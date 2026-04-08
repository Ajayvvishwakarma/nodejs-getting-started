const mongoose = require('mongoose')
const AIAssistant = require('./models/AIAssistant')

// Connection string
const mongoURL = 'mongodb+srv://ecomus-store:ecomus123@cluster0.j9y8s.mongodb.net/?retryWrites=true&w=majority'

async function createAIAssistantData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/ecomus-store')
    console.log('\n✅ Connected to MongoDB')

    // Delete existing AI Assistant data
    await AIAssistant.deleteMany({})
    console.log('🗑️  Cleared existing AI Assistant data')

    // Create AI Assistant data
    const aiData = new AIAssistant({
      totalRequests: 45230,
      tokensUsed: 2345680,
      apiCalls: 12450,
      errors: 23,
      uptime: 99.96,
      activeUsers: 487,
      toolsUsage: [
        {
          tool: 'Text Generator',
          usageCount: 18940,
          tokensConsumed: 1250340,
          averageResponseTime: 2.3 // seconds
        },
        {
          tool: 'Image Generator',
          usageCount: 12340,
          tokensConsumed: 654200,
          averageResponseTime: 5.8
        },
        {
          tool: 'Code Generator',
          usageCount: 8950,
          tokensConsumed: 356890,
          averageResponseTime: 1.9
        },
        {
          tool: 'Video Generator',
          usageCount: 5020,
          tokensConsumed: 84250,
          averageResponseTime: 12.4
        }
      ],
      recentGenerations: [
        {
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          tool: 'Text Generator',
          user: 'user@example.com',
          prompt: 'Write a professional email about project deadline',
          status: 'completed',
          tokensUsed: 285
        },
        {
          timestamp: new Date(Date.now() - 12 * 60 * 1000),
          tool: 'Image Generator',
          user: 'designer@example.com',
          prompt: 'Create a modern logo for a startup',
          status: 'completed',
          tokensUsed: 420
        },
        {
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          tool: 'Code Generator',
          user: 'dev@example.com',
          prompt: 'Generate a React component for a user profile card',
          status: 'completed',
          tokensUsed: 310
        },
        {
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          tool: 'Video Generator',
          user: 'marketing@example.com',
          prompt: 'Create a promotional video for our new product',
          status: 'in_progress',
          tokensUsed: 0
        },
        {
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          tool: 'Text Generator',
          user: 'content@example.com',
          prompt: 'Write a blog post about AI trends in 2024',
          status: 'completed',
          tokensUsed: 580
        },
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          tool: 'Code Generator',
          user: 'developer@example.com',
          prompt: 'Create a REST API endpoint for user authentication',
          status: 'completed',
          tokensUsed: 425
        }
      ],
      averageResponseTime: 3.6,
      requestsChange: 12.5,
      tokensChange: 8.3,
      usersChange: 5.8
    })

    await aiData.save()
    console.log('✅ AI Assistant data created successfully')
    console.log('\n🤖 AI Assistant Data Summary:')
    console.log(`   Total Requests: ${aiData.totalRequests}`)
    console.log(`   Tokens Used: ${aiData.tokensUsed.toLocaleString()}`)
    console.log(`   Tools: ${aiData.toolsUsage.length}`)
    console.log(`   Recent Generations: ${aiData.recentGenerations.length}`)
    console.log(`   Active Users: ${aiData.activeUsers}`)
    console.log(`   Uptime: ${aiData.uptime}%`)
    console.log(`   Avg Response Time: ${aiData.averageResponseTime}s`)

    mongoose.connection.close()
    console.log('\n✅ Database connection closed')
  } catch (error) {
    console.error('❌ Error:', error.message)
    mongoose.connection.close()
    process.exit(1)
  }
}

createAIAssistantData()
