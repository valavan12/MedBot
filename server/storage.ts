import { 
  ChatSession, InsertChatSession, 
  ChatMessage, InsertChatMessage,
  AdrReport, InsertAdrReport,
  QuestionFlow, InsertQuestionFlow,
  TrainingFeedback, InsertTrainingFeedback,
  User, InsertUser 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Chat session methods
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(sessionId: string): Promise<ChatSession | undefined>;
  updateChatSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined>;
  
  // Chat message methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  
  // ADR report methods
  createAdrReport(report: InsertAdrReport): Promise<AdrReport>;
  getAdrReport(sessionId: string): Promise<AdrReport | undefined>;
  updateAdrReport(sessionId: string, updates: Partial<AdrReport>): Promise<AdrReport | undefined>;
  getAllAdrReports(): Promise<AdrReport[]>;
  
  // Question flow methods
  getQuestionFlow(): Promise<QuestionFlow[]>;
  createQuestionFlow(question: InsertQuestionFlow): Promise<QuestionFlow>;
  updateQuestionFlow(id: number, updates: Partial<QuestionFlow>): Promise<QuestionFlow | undefined>;
  
  // Training feedback methods
  createTrainingFeedback(feedback: InsertTrainingFeedback): Promise<TrainingFeedback>;
  getTrainingFeedback(): Promise<TrainingFeedback[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatSessions: Map<string, ChatSession>;
  private chatMessages: Map<string, ChatMessage[]>;
  private adrReports: Map<string, AdrReport>;
  private questionFlows: Map<number, QuestionFlow>;
  private trainingFeedbacks: Map<number, TrainingFeedback>;
  
  private currentUserId: number;
  private currentMessageId: number;
  private currentAdrId: number;
  private currentQuestionId: number;
  private currentFeedbackId: number;

  constructor() {
    this.users = new Map();
    this.chatSessions = new Map();
    this.chatMessages = new Map();
    this.adrReports = new Map();
    this.questionFlows = new Map();
    this.trainingFeedbacks = new Map();
    
    this.currentUserId = 1;
    this.currentMessageId = 1;
    this.currentAdrId = 1;
    this.currentQuestionId = 1;
    this.currentFeedbackId = 1;

    this.initializeQuestionFlow();
  }

  private initializeQuestionFlow() {
    const defaultQuestions: InsertQuestionFlow[] = [
      {
        questionKey: "medication_name",
        questionText: "What medication are you reporting a reaction to? Please include the name and dosage if known.",
        questionType: "text",
        priority: 1,
        dependsOn: null,
        isActive: true
      },
      {
        questionKey: "reaction_symptoms",
        questionText: "Could you describe the reaction or symptoms you experienced? Please be as detailed as possible.",
        questionType: "text",
        priority: 2,
        dependsOn: "medication_name",
        isActive: true
      },
      {
        questionKey: "reaction_severity",
        questionText: "How would you rate the severity of your reaction on a scale of 1-5, where 1 is mild and 5 is severe?",
        questionType: "scale",
        options: [
          { value: 1, label: "1 - Mild" },
          { value: 2, label: "2 - Moderate" },
          { value: 3, label: "3 - Noticeable" },
          { value: 4, label: "4 - Severe" },
          { value: 5, label: "5 - Very Severe" }
        ],
        priority: 3,
        dependsOn: "reaction_symptoms",
        isActive: true
      },
      {
        questionKey: "timeline_start",
        questionText: "When did you first notice these symptoms? Was it immediately after taking the medication or some time later?",
        questionType: "text",
        priority: 4,
        dependsOn: "reaction_severity",
        isActive: true
      },
      {
        questionKey: "previous_reactions",
        questionText: "Have you taken this medication before without any problems, or is this the first time you've used it?",
        questionType: "boolean",
        options: [
          { value: true, label: "I've taken it before with no issues" },
          { value: false, label: "This is my first time taking it" }
        ],
        priority: 5,
        dependsOn: "timeline_start",
        isActive: true
      },
      {
        questionKey: "patient_demographics",
        questionText: "Could you share some basic information - your age range and any other medications you're currently taking?",
        questionType: "text",
        priority: 6,
        dependsOn: "previous_reactions",
        isActive: true
      }
    ];

    defaultQuestions.forEach(question => {
      this.createQuestionFlow(question);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const newSession: ChatSession = {
      id: Date.now(),
      startTime: new Date(),
      endTime: null,
      ...session
    };
    this.chatSessions.set(session.sessionId, newSession);
    this.chatMessages.set(session.sessionId, []);
    return newSession;
  }

  async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(sessionId);
  }

  async updateChatSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(sessionId);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.chatSessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      id: this.currentMessageId++,
      timestamp: new Date(),
      ...message
    };
    
    const messages = this.chatMessages.get(message.sessionId) || [];
    messages.push(newMessage);
    this.chatMessages.set(message.sessionId, messages);
    
    return newMessage;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.chatMessages.get(sessionId) || [];
  }

  async createAdrReport(report: InsertAdrReport): Promise<AdrReport> {
    const newReport: AdrReport = {
      id: this.currentAdrId++,
      createdAt: new Date(),
      ...report
    };
    this.adrReports.set(report.sessionId, newReport);
    return newReport;
  }

  async getAdrReport(sessionId: string): Promise<AdrReport | undefined> {
    return this.adrReports.get(sessionId);
  }

  async updateAdrReport(sessionId: string, updates: Partial<AdrReport>): Promise<AdrReport | undefined> {
    const report = this.adrReports.get(sessionId);
    if (!report) return undefined;
    
    const updatedReport = { ...report, ...updates };
    this.adrReports.set(sessionId, updatedReport);
    return updatedReport;
  }

  async getAllAdrReports(): Promise<AdrReport[]> {
    return Array.from(this.adrReports.values());
  }

  async getQuestionFlow(): Promise<QuestionFlow[]> {
    return Array.from(this.questionFlows.values())
      .filter(q => q.isActive)
      .sort((a, b) => a.priority - b.priority);
  }

  async createQuestionFlow(question: InsertQuestionFlow): Promise<QuestionFlow> {
    const newQuestion: QuestionFlow = {
      id: this.currentQuestionId++,
      ...question
    };
    this.questionFlows.set(newQuestion.id, newQuestion);
    return newQuestion;
  }

  async updateQuestionFlow(id: number, updates: Partial<QuestionFlow>): Promise<QuestionFlow | undefined> {
    const question = this.questionFlows.get(id);
    if (!question) return undefined;
    
    const updatedQuestion = { ...question, ...updates };
    this.questionFlows.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async createTrainingFeedback(feedback: InsertTrainingFeedback): Promise<TrainingFeedback> {
    const newFeedback: TrainingFeedback = {
      id: this.currentFeedbackId++,
      createdAt: new Date(),
      ...feedback
    };
    this.trainingFeedbacks.set(newFeedback.id, newFeedback);
    return newFeedback;
  }

  async getTrainingFeedback(): Promise<TrainingFeedback[]> {
    return Array.from(this.trainingFeedbacks.values());
  }
}

export const storage = new MemStorage();
