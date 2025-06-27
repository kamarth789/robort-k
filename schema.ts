import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversations = pgTable("conversations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  isVoiceInput: text("is_voice_input").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  timestamp: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  isVoiceInput: z.boolean(),
});

export const chatResponseSchema = z.object({
  response: z.string(),
  conversationId: z.number(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;