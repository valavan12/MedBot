import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  progressPercentage: integer("progress_percentage").notNull().default(0),
  isComplete: boolean("is_complete").notNull().default(false),
  collectedData: jsonb("collected_data"),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  messageType: text("message_type").notNull(), // 'user' | 'bot' | 'system'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: jsonb("metadata"), // For storing additional message data
});

export const adrReports = pgTable("adr_reports", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  medicationName: text("medication_name"),
  medicationDose: text("medication_dose"),
  reactionSymptoms: text("reaction_symptoms"),
  reactionSeverity: integer("reaction_severity"), // 1-5 scale
  timelineStart: text("timeline_start"),
  timelineDescription: text("timeline_description"),
  patientAge: text("patient_age"),
  patientGender: text("patient_gender"),
  otherMedications: text("other_medications"),
  previousReactions: boolean("previous_reactions"),
  additionalNotes: text("additional_notes"),
  isComplete: boolean("is_complete").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const questionFlow = pgTable("question_flow", {
  id: serial("id").primaryKey(),
  questionKey: text("question_key").notNull(),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(), // 'text' | 'selection' | 'scale' | 'boolean'
  options: jsonb("options"), // For selection type questions
  priority: integer("priority").notNull().default(0),
  dependsOn: text("depends_on"), // Question key this depends on
  isActive: boolean("is_active").notNull().default(true),
});

export const trainingFeedback = pgTable("training_feedback", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  questionSequence: jsonb("question_sequence").notNull(),
  completionRate: integer("completion_rate").notNull(),
  userSatisfaction: integer("user_satisfaction"), // 1-5 rating
  improvements: text("improvements"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertAdrReportSchema = createInsertSchema(adrReports).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionFlowSchema = createInsertSchema(questionFlow).omit({
  id: true,
});

export const insertTrainingFeedbackSchema = createInsertSchema(trainingFeedback).omit({
  id: true,
  createdAt: true,
});

// Types
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type AdrReport = typeof adrReports.$inferSelect;
export type InsertAdrReport = z.infer<typeof insertAdrReportSchema>;

export type QuestionFlow = typeof questionFlow.$inferSelect;
export type InsertQuestionFlow = z.infer<typeof insertQuestionFlowSchema>;

export type TrainingFeedback = typeof trainingFeedback.$inferSelect;
export type InsertTrainingFeedback = z.infer<typeof insertTrainingFeedbackSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
