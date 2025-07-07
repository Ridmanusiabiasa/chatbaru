import { 
  users, apiKeys, chatMessages, usageStats,
  type User, type InsertUser,
  type ApiKey, type InsertApiKey,
  type ChatMessage, type InsertChatMessage,
  type UsageStats, type InsertUsageStats
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // API Key methods
  getApiKeys(): Promise<ApiKey[]>;
  getApiKey(id: number): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  deleteApiKey(id: number): Promise<void>;
  updateApiKeyUsage(id: number, tokens: number): Promise<void>;

  // Chat Message methods
  getChatMessages(): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Usage Stats methods
  getUsageStats(): Promise<UsageStats[]>;
  createUsageStats(stats: InsertUsageStats): Promise<UsageStats>;
  getTotalTokensUsed(): Promise<number>;
  getTotalRequests(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apiKeys: Map<number, ApiKey>;
  private chatMessages: Map<number, ChatMessage>;
  private usageStats: Map<number, UsageStats>;
  private currentUserId: number;
  private currentApiKeyId: number;
  private currentChatMessageId: number;
  private currentUsageStatsId: number;

  constructor() {
    this.users = new Map();
    this.apiKeys = new Map();
    this.chatMessages = new Map();
    this.usageStats = new Map();
    this.currentUserId = 1;
    this.currentApiKeyId = 1;
    this.currentChatMessageId = 1;
    this.currentUsageStatsId = 1;

    // Initialize with admin user
    this.createUser({ username: "admin", password: "082254730892" });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getApiKeys(): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values());
  }

  async getApiKey(id: number): Promise<ApiKey | undefined> {
    return this.apiKeys.get(id);
  }

  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const id = this.currentApiKeyId++;
    const apiKey: ApiKey = {
      ...insertApiKey,
      id,
      isActive: true,
      tokensUsed: 0,
      createdAt: new Date(),
      lastUsedAt: null,
    };
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }

  async deleteApiKey(id: number): Promise<void> {
    this.apiKeys.delete(id);
  }

  async updateApiKeyUsage(id: number, tokens: number): Promise<void> {
    const apiKey = this.apiKeys.get(id);
    if (apiKey) {
      apiKey.tokensUsed += tokens;
      apiKey.lastUsedAt = new Date();
      this.apiKeys.set(id, apiKey);
    }
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async createChatMessage(insertChatMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const message: ChatMessage = {
      ...insertChatMessage,
      id,
      tokens: insertChatMessage.tokens || 0,
      model: insertChatMessage.model || "gpt-4o-mini",
      apiKeyId: insertChatMessage.apiKeyId || null,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getUsageStats(): Promise<UsageStats[]> {
    return Array.from(this.usageStats.values());
  }

  async createUsageStats(insertUsageStats: InsertUsageStats): Promise<UsageStats> {
    const id = this.currentUsageStatsId++;
    const stats: UsageStats = {
      ...insertUsageStats,
      id,
      createdAt: new Date(),
    };
    this.usageStats.set(id, stats);
    return stats;
  }

  async getTotalTokensUsed(): Promise<number> {
    return Array.from(this.apiKeys.values()).reduce((total, key) => total + key.tokensUsed, 0);
  }

  async getTotalRequests(): Promise<number> {
    return this.chatMessages.size;
  }
}

export const storage = new MemStorage();
