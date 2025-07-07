const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

// Import storage and other dependencies
const { storage } = require('../server/storage.ts');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Basic request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json({ success: true, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/admin/api-keys', async (req, res) => {
  try {
    const apiKeys = await storage.getApiKeys();
    res.json(apiKeys);
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/admin/api-keys', async (req, res) => {
  try {
    const { name, key } = req.body;
    
    if (!name || !key) {
      return res.status(400).json({ message: 'Name and key are required' });
    }
    
    const apiKey = await storage.createApiKey({ name, key });
    res.json(apiKey);
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/admin/api-keys/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteApiKey(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const apiKeys = await storage.getApiKeys();
    const totalTokens = await storage.getTotalTokensUsed();
    const totalRequests = await storage.getTotalRequests();
    
    res.json({
      totalApiKeys: apiKeys.length,
      totalTokens,
      totalRequests,
      activeApiKey: apiKeys.find(key => key.isActive)?.name || 'None'
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/chat/messages', async (req, res) => {
  try {
    const messages = await storage.getChatMessages();
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/chat/send', async (req, res) => {
  try {
    const { message, model = 'gpt-4o-mini' } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    // Get active API key
    const apiKeys = await storage.getApiKeys();
    const activeKey = apiKeys.find(key => key.isActive);
    
    if (!activeKey) {
      return res.status(400).json({ message: 'No active API key available' });
    }
    
    // Store user message
    const userMessage = await storage.createChatMessage({
      role: 'user',
      content: message,
      tokens: 0,
      model
    });
    
    // Make API call to Sumopod AI
    const response = await fetch('https://ai.sumopod.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeKey.key}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: message }],
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    
    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens || 0;
    
    // Store assistant message
    await storage.createChatMessage({
      role: 'assistant',
      content: assistantMessage,
      tokens: tokensUsed,
      model
    });
    
    // Update API key usage
    await storage.updateApiKeyUsage(activeKey.id, tokensUsed);
    
    // Create usage stats
    await storage.createUsageStats({
      apiKeyId: activeKey.id,
      tokensUsed,
      cost: tokensUsed * 0.00001, // Estimated cost
      model
    });
    
    res.json({
      userMessage,
      assistantMessage: {
        role: 'assistant',
        content: assistantMessage,
        tokens: tokensUsed,
        model
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Export handler for Netlify Functions
module.exports.handler = serverless(app);