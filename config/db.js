const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongoServer

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI

    if (!mongoUri) {
      throw new Error('MONGODB_URI not configured')
    }

    console.log('🔗 Connecting to MongoDB Atlas...')
    
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      
      console.log('✓ MongoDB Atlas connected successfully!')
      console.log(`📊 Database: ${mongoose.connection.name}`)
      console.log(`🖥️ Host: ${mongoose.connection.host}`)
      console.log('☁️ Using MongoDB Atlas Cloud')
      
      return mongoose.connection
    } catch (atlasError) {
      console.warn('⚠️ MongoDB Atlas connection failed')
      console.warn('Error:', atlasError.message)
      
      // Fallback to local MongoDB
      console.log('🔄 Attempting local MongoDB connection...')
      
      try {
        const localUri = 'mongodb://localhost:27017/ecomus-store'
        await mongoose.connect(localUri)
        console.log('✓ Connected to local MongoDB')
        console.log(`📊 Database: ${mongoose.connection.name}`)
        return mongoose.connection
      } catch (localError) {
        // Fallback to in-memory
        console.log('📦 Starting in-memory MongoDB...')
        mongoServer = await MongoMemoryServer.create()
        const memUri = mongoServer.getUri()
        
        await mongoose.connect(memUri)
        console.log('✓ Using in-memory MongoDB (temporary data)')
        return mongoose.connection
      }
    }
  } catch (error) {
    console.error('✗ Database connection failed:', error.message)
    process.exit(1)
  }
}

module.exports = connectDB
