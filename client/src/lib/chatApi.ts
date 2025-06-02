import { apiRequest } from "./queryClient";
import { ChatSession, ChatMessage, AdrReport, InsertChatSession, InsertChatMessage } from "@shared/schema";

export const chatApi = {
  // Create new chat session
  createSession: async (sessionData: InsertChatSession): Promise<ChatSession> => {
    const response = await apiRequest("POST", "/api/sessions", sessionData);
    return response.json();
  },

  // Get chat session
  getSession: async (sessionId: string): Promise<ChatSession> => {
    const response = await apiRequest("GET", `/api/sessions/${sessionId}`);
    return response.json();
  },

  // Get chat messages
  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    const response = await apiRequest("GET", `/api/sessions/${sessionId}/messages`);
    return response.json();
  },

  // Send message and get response
  sendMessage: async (sessionId: string, messageData: Omit<InsertChatMessage, "sessionId">): Promise<{
    userMessage: ChatMessage;
    botMessage: ChatMessage;
    progress: number;
    extractedData: any;
  }> => {
    const response = await apiRequest("POST", `/api/sessions/${sessionId}/messages`, messageData);
    return response.json();
  },

  // Get ADR report
  getReport: async (sessionId: string): Promise<AdrReport> => {
    const response = await apiRequest("GET", `/api/sessions/${sessionId}/report`);
    return response.json();
  },

  // Export session data
  exportSession: async (sessionId: string): Promise<Blob> => {
    const response = await apiRequest("GET", `/api/sessions/${sessionId}/export`);
    return response.blob();
  },

  // Submit training feedback
  submitFeedback: async (feedbackData: any): Promise<any> => {
    const response = await apiRequest("POST", "/api/training-feedback", feedbackData);
    return response.json();
  }
};
