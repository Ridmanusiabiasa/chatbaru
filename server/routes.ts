import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertApiKeySchema, insertChatMessageSchema } from "@shared/schema";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (user && user.password === password) {
        res.json({ success: true, user: { id: user.id, username: user.username } });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // API Key management
  app.get("/api/admin/api-keys", async (req, res) => {
    try {
      const apiKeys = await storage.getApiKeys();
      // Mask the API keys for security
      const maskedKeys = apiKeys.map(key => ({
        ...key,
        key: `${key.key.slice(0, 10)}***${key.key.slice(-4)}`
      }));
      res.json(maskedKeys);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.post("/api/admin/api-keys", async (req, res) => {
    try {
      const validatedData = insertApiKeySchema.parse(req.body);
      const apiKey = await storage.createApiKey(validatedData);
      res.json(apiKey);
    } catch (error) {
      res.status(400).json({ message: "Invalid API key data" });
    }
  });

  app.delete("/api/admin/api-keys/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteApiKey(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete API key" });
    }
  });

  // Chat functionality
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/send", async (req, res) => {
    try {
      const { message, model = "gpt-4o-mini" } = req.body;
      
      // Get the first available API key
      const apiKeys = await storage.getApiKeys();
      const activeKey = apiKeys.find(key => key.isActive);
      
      if (!activeKey) {
        return res.status(400).json({ message: "No active API key available" });
      }

      // Save user message
      const userMessage = await storage.createChatMessage({
        role: "user",
        content: message,
        tokens: 0,
        model,
        apiKeyId: activeKey.id,
      });

      try {
        // Call Sumopod AI API
        const response = await axios.post(
          "https://ai.sumopod.com/v1/chat/completions",
          {
            model: model,
            messages: [
              {
                role: "user",
                content: message
              }
            ],
            max_tokens: 150,
            temperature: 0.7
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${activeKey.key}`
            }
          }
        );

        const aiResponse = response.data.choices[0].message.content;
        const tokensUsed = response.data.usage?.total_tokens || 50;

        // Save AI response
        const aiMessage = await storage.createChatMessage({
          role: "assistant",
          content: aiResponse,
          tokens: tokensUsed,
          model,
          apiKeyId: activeKey.id,
        });

        // Update API key usage
        await storage.updateApiKeyUsage(activeKey.id, tokensUsed);

        // Create usage stats
        await storage.createUsageStats({
          apiKeyId: activeKey.id,
          tokens: tokensUsed,
          requestType: "chat_completion",
        });

        res.json({
          userMessage,
          aiMessage,
          tokensUsed
        });

      } catch (apiError) {
        console.error("Sumopod AI API Error:", apiError);
        
        // Create a fallback response
        const fallbackResponse = "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again later.";
        
        const aiMessage = await storage.createChatMessage({
          role: "assistant",
          content: fallbackResponse,
          tokens: 0,
          model,
          apiKeyId: activeKey.id,
        });

        res.json({
          userMessage,
          aiMessage,
          tokensUsed: 0,
          error: "API connection failed"
        });
      }

    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Statistics
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const apiKeys = await storage.getApiKeys();
      const totalTokens = await storage.getTotalTokensUsed();
      const totalRequests = await storage.getTotalRequests();
      const usageStats = await storage.getUsageStats();

      res.json({
        totalApiKeys: apiKeys.length,
        totalTokens,
        totalRequests,
        apiKeys: apiKeys.map(key => ({
          id: key.id,
          name: key.name,
          tokensUsed: key.tokensUsed,
          isActive: key.isActive
        })),
        recentActivity: usageStats.slice(-10).reverse()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
