const express = require('express')
const router = express.Router()
const Message = require('../models/Message')
const { verifyToken, isAdmin } = require('../middleware/auth')
const multer = require('multer')
const path = require('path')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
})

// Helper to check if string is valid MongoDB ObjectID
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

// Get single message by ID (must come BEFORE generatorType route)
router.get('/messages/:id', verifyToken, async (req, res, next) => {
  try {
    // Check if this looks like a MongoDB ID (hex string of 24 chars)
    if (!isValidObjectId(req.params.id)) {
      return next() // Pass to next route handler (generatorType)
    }

    const message = await Message.findById(req.params.id)

    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' })
    }

    res.json({
      success: true,
      data: message
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get all messages for a generator type
router.get('/messages/:generatorType', verifyToken, async (req, res) => {
  try {
    const { generatorType } = req.params
    const messages = await Message.find({
      userId: req.user._id || req.userId,
      generatorType
    })
      .sort({ createdAt: -1 })
      .limit(50)

    res.json({
      success: true,
      data: messages.reverse()
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Send new message with optional file
router.post('/messages', verifyToken, upload.single('attachment'), async (req, res) => {
  try {
    const { userMessage, generatorType } = req.body

    if (!userMessage || !generatorType) {
      return res.status(400).json({
        success: false,
        error: 'Message and generator type required'
      })
    }

    const userId = req.user._id || req.userId
    
    if (!userId) {
      console.error('❌ userId is undefined. req.user:', req.user)
      return res.status(401).json({
        success: false,
        error: 'User ID not found in token'
      })
    }

    const messageData = {
      userId,
      generatorType,
      userMessage,
      status: 'pending'
    }

    // Add attachment if file uploaded
    if (req.file) {
      messageData.attachment = {
        filename: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      }
    }

    const message = new Message(messageData)
    await message.save()

    console.log('✅ Message saved:', message._id, 'GeneratorType:', generatorType)

    // Simulate AI response (in real scenario, call actual AI API)
    setTimeout(async () => {
      try {
        const mockResponse = generateMockResponse(userMessage, generatorType)
        console.log('🤖 Generating mock response for:', generatorType)
        console.log('📝 Mock response:', mockResponse)
        
        const updatedMessage = await Message.findByIdAndUpdate(
          message._id,
          {
            aiResponse: mockResponse,
            status: 'completed',
            tokensUsed: Math.floor(Math.random() * 500) + 100
          },
          { new: true }
        )
        
        console.log('✅ Message updated with AI response:', updatedMessage._id)
      } catch (err) {
        console.error('❌ Error updating message with AI response:', err)
      }
    }, 500)  // Reduced from 2000ms to 500ms for instant response

    res.json({
      success: true,
      data: message
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Delete message
router.delete('/messages/:id', verifyToken, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id)

    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' })
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Mock AI response based on generator type
function generateMockResponse(userMessage, generatorType) {
  const genType = (generatorType || '').toLowerCase().trim()
  
  console.log('🎯 Generating response for genType:', genType)

  const responses = {
    text: `Here's some generated text based on your request: "${userMessage.substring(0, 30)}..." This is a placeholder response that would come from the AI service.`,
    image: `🖼️ Image generation started for: "${userMessage}". Your image will be ready shortly. This would typically take 2-3 minutes.`,
    code: `// Generated code based on your request\nfunction generated() {\n  // Implementation for: ${userMessage.substring(0, 20)}...\n  console.log("Code generated successfully for: ${userMessage}");\n  return { success: true, output: "Generated code" };\n}`,
    video: `🎬 Video generation queued for: "${userMessage}". Processing time: ~5-10 minutes. You'll receive a notification when it's ready.`,
    product: `📦 Product analysis for: "${userMessage}".\n\nThis product would be categorized as recommended with 4.5/5 quality rating. Estimated market demand: High. Ready to publish to your catalog.`
  }

  const response = responses[genType] || `Response generated for: "${userMessage}"`
  console.log('✅ Generated response:', response.substring(0, 50) + '...')
  return response
}

module.exports = router
