const mongoose = require('mongoose');

const aiAssistantSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    
    // Total Usage Stats
    totalRequests: { type: Number, default: 0 },
    tokensUsed: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 }, // ms
    successRate: { type: Number, default: 0 }, // percentage
    
    // Change metrics
    requestsChangePercent: { type: Number, default: 0 },
    tokensChangePercent: { type: Number, default: 0 },
    responseTimeChangePercent: { type: Number, default: 0 },
    successChangePercent: { type: Number, default: 0 },
    
    // Tool Usage
    toolsUsage: [
      {
        tool: String, // text-generator, image-generator, code-generator, video-generator
        requests: Number,
        percentage: Number,
        tokensUsed: Number
      }
    ],
    
    // User Engagement
    activeUsers: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    churnRate: { type: Number, default: 0 },
    
    // API Performance
    apiCalls: { type: Number, default: 0 },
    errors: { type: Number, default: 0 },
    uptime: { type: Number, default: 0 }, // percentage
    
    // Recent Generations
    recentGenerations: [
      {
        id: String,
        tool: String,
        prompt: String,
        tokens: Number,
        duration: Number, // ms
        timestamp: String,
        status: String // Success, Failed
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIAssistant', aiAssistantSchema);
