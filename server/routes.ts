import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSessionSchema, insertChatMessageSchema, insertAdrReportSchema, insertTrainingFeedbackSchema } from "@shared/schema";
import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create new chat session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(sessionData);
      
      // Create initial ADR report
      await storage.createAdrReport({
        sessionId: session.sessionId,
        isComplete: false
      });
      
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get chat session
  app.get("/api/sessions/:sessionId", async (req, res) => {
    try {
      const session = await storage.getChatSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get chat messages for session
  app.get("/api/sessions/:sessionId/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Send message and get AI response
  app.post("/api/sessions/:sessionId/messages", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        sessionId: req.params.sessionId
      });

      // Save user message
      const userMessage = await storage.createChatMessage(messageData);

      // Get current session and ADR report
      const session = await storage.getChatSession(req.params.sessionId);
      const adrReport = await storage.getAdrReport(req.params.sessionId);
      const questionFlow = await storage.getQuestionFlow();
      const chatHistory = await storage.getChatMessages(req.params.sessionId);

      // Generate AI response
      const aiResponse = await generateAIResponse(userMessage.content, session, adrReport, questionFlow, chatHistory);
      
      // Save AI message
      const botMessage = await storage.createChatMessage({
        sessionId: req.params.sessionId,
        messageType: "bot",
        content: aiResponse.message,
        metadata: aiResponse.metadata
      });

      // Update ADR report if data was extracted
      if (aiResponse.extractedData && Object.keys(aiResponse.extractedData).length > 0) {
        await storage.updateAdrReport(req.params.sessionId, {
          ...aiResponse.extractedData,
          isComplete: aiResponse.isComplete || false
        });
      }

      // Update session progress
      const progress = calculateProgress(adrReport, aiResponse.extractedData);
      await storage.updateChatSession(req.params.sessionId, {
        progressPercentage: progress,
        isComplete: progress >= 100
      });

      res.json({
        userMessage,
        botMessage,
        progress,
        extractedData: aiResponse.extractedData
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get ADR report data
  app.get("/api/sessions/:sessionId/report", async (req, res) => {
    try {
      const report = await storage.getAdrReport(req.params.sessionId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Export session data
  app.get("/api/sessions/:sessionId/export", async (req, res) => {
    try {
      const session = await storage.getChatSession(req.params.sessionId);
      const messages = await storage.getChatMessages(req.params.sessionId);
      const report = await storage.getAdrReport(req.params.sessionId);

      const exportData = {
        session,
        messages,
        report,
        exportedAt: new Date().toISOString()
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="adr-report-${req.params.sessionId}.json"`);
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Submit training feedback
  app.post("/api/training-feedback", async (req, res) => {
    try {
      const feedbackData = insertTrainingFeedbackSchema.parse(req.body);
      const feedback = await storage.createTrainingFeedback(feedbackData);
      res.json(feedback);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get question flow
  app.get("/api/question-flow", async (req, res) => {
    try {
      const questions = await storage.getQuestionFlow();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all ADR reports (for analytics)
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getAllAdrReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function generateAIResponse(userMessage: string, session: any, adrReport: any, questionFlow: any[], chatHistory: any[]) {
  const systemPrompt = `You are MedBot, a compassionate AI assistant specialized in collecting adverse drug reaction (ADR) reports. Your role is to:

1. Guide users through reporting adverse drug reactions in a caring, professional manner
2. Ask relevant follow-up questions based on the conversation flow
3. Extract and structure information for medical safety reporting
4. Ensure all required data is collected: medication name/dose, symptoms, timeline, severity, patient demographics

Current ADR Report Status:
- Medication: ${adrReport?.medicationName || 'Not provided'}
- Symptoms: ${adrReport?.reactionSymptoms || 'Not provided'}
- Severity: ${adrReport?.reactionSeverity || 'Not provided'}
- Timeline: ${adrReport?.timelineStart || 'Not provided'}
- Previous reactions: ${adrReport?.previousReactions !== null ? adrReport.previousReactions : 'Not provided'}
- Demographics: ${adrReport?.patientAge || 'Not provided'}

Question Flow Available:
${questionFlow.map(q => `- ${q.questionKey}: ${q.questionText}`).join('\n')}

Guidelines:
- Be empathetic and reassuring about privacy/HIPAA compliance
- Ask one question at a time to avoid overwhelming the user
- Provide quick action suggestions when appropriate
- Extract structured data from responses
- Determine appropriate next questions based on missing information

Respond with JSON in this exact format:
{
  "message": "Your response to the user",
  "extractedData": {
    "medicationName": "extracted medication name if mentioned",
    "medicationDose": "extracted dose if mentioned",
    "reactionSymptoms": "extracted symptoms if mentioned",
    "reactionSeverity": "1-5 severity rating if mentioned",
    "timelineStart": "timeline information if mentioned",
    "patientAge": "age range if mentioned",
    "otherMedications": "other medications if mentioned",
    "previousReactions": "boolean if mentioned"
  },
  "isComplete": false,
  "nextAction": "suggested next question or action",
  "metadata": {
    "confidenceScore": 0.8,
    "questionType": "medication_name|reaction_symptoms|etc",
    "quickActions": ["suggestion1", "suggestion2"]
  }
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory.slice(-6).map(msg => ({
          role: msg.messageType === "user" ? "user" : "assistant",
          content: msg.content
        })),
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Clean up extracted data - only include non-null, non-empty values
    const cleanedExtractedData: any = {};
    if (result.extractedData) {
      Object.keys(result.extractedData).forEach(key => {
        const value = result.extractedData[key];
        if (value !== null && value !== undefined && value !== "" && value !== "Not provided") {
          cleanedExtractedData[key] = value;
        }
      });
    }

    return {
      message: result.message || "I'm here to help you report your adverse drug reaction. Could you tell me more about what happened?",
      extractedData: cleanedExtractedData,
      isComplete: result.isComplete || false,
      metadata: result.metadata || {}
    };

  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Fallback response
    return {
      message: "I'm here to help you report your adverse drug reaction. Could you tell me what medication you're reporting a reaction to?",
      extractedData: {},
      isComplete: false,
      metadata: { error: "AI service temporarily unavailable" }
    };
  }
}

function calculateProgress(adrReport: any, newData: any = {}): number {
  const combined = { ...adrReport, ...newData };
  const requiredFields = [
    'medicationName',
    'reactionSymptoms', 
    'reactionSeverity',
    'timelineStart',
    'previousReactions',
    'patientAge'
  ];

  const completedFields = requiredFields.filter(field => {
    const value = combined[field];
    return value !== null && value !== undefined && value !== "";
  });

  return Math.round((completedFields.length / requiredFields.length) * 100);
}
