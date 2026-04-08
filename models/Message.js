const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    generatorType: {
      type: String,
      enum: ['text', 'image', 'code', 'video', 'product'],
      required: true
    },
    userMessage: {
      type: String,
      required: true
    },
    aiResponse: {
      type: String,
      default: null
    },
    attachment: {
      filename: String,
      fileUrl: String,
      fileType: String,
      fileSize: Number
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    tokensUsed: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Message', messageSchema)
