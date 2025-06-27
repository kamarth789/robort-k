import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatRequestSchema, chatResponseSchema } from "@shared/schema";
import { CohereClient } from 'cohere-ai';

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Cohere client
  const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY || process.env.COHERE_KEY || "your-cohere-api-key",
  });

  // Chat endpoint for Cohere AI integration
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, isVoiceInput } = chatRequestSchema.parse(req.body);
      
      // Generate response using Cohere Chat API - NO introduction logic here
      // The introduction is handled by the frontend when the app starts
      const response = await cohere.chat({
        model: 'command-r-plus',
        message: message,
        preamble: `You are K, a helpful robot assistant made by Sir Kamarth working for DHSS Humadpuram. Answer the user's question directly and helpfully. Be professional, knowledgeable, and concise. Do NOT introduce yourself as that is handled separately when the app starts.`,
        maxTokens: 300,
        temperature: 0.7,
      });

      const aiResponse = response.text?.trim() || "I apologize, but I'm having trouble processing your request right now. Please try again.";

      // Store conversation in memory
      const conversation = await storage.createConversation({
        message,
        response: aiResponse,
        isVoiceInput: isVoiceInput ? "true" : "false",
      });

      const result = chatResponseSchema.parse({
        response: aiResponse,
        conversationId: conversation.id,
      });

      res.json(result);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        error: "Failed to process chat request",
        message: "I'm experiencing technical difficulties. Please try again later."
      });
    }
  });

  // Get conversation history
  app.get("/api/conversations", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const conversations = await storage.getRecentConversations(limit);
      res.json(conversations);
    } catch (error) {
      console.error("Conversation history error:", error);
      res.status(500).json({ error: "Failed to fetch conversation history" });
    }
  });

  // Clear conversations endpoint (for testing)
  app.post("/api/conversations/clear", async (req, res) => {
    try {
      await (storage as any).clearAllConversations();
      res.json({ message: "All conversations cleared" });
    } catch (error) {
      console.error("Clear conversations error:", error);
      res.status(500).json({ error: "Failed to clear conversations" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}