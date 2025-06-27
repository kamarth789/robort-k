import { conversations, type Conversation, type InsertConversation } from "@shared/schema";

export interface IStorage {
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getRecentConversations(limit?: number): Promise<Conversation[]>;
}

export class MemStorage implements IStorage {
  private conversations: Map<number, Conversation>;
  private currentId: number;

  constructor() {
    this.conversations = new Map();
    this.currentId = 1;
  }

  // Method to clear all conversations (for testing)
  async clearAllConversations(): Promise<void> {
    this.conversations.clear();
    this.currentId = 1;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentId++;
    const conversation: Conversation = {
      id,
      message: insertConversation.message,
      response: insertConversation.response,
      isVoiceInput: insertConversation.isVoiceInput,
      timestamp: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getRecentConversations(limit: number = 50): Promise<Conversation[]> {
    const allConversations = Array.from(this.conversations.values());
    return allConversations
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();