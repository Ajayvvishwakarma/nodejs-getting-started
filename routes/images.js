const express = require('express')
const router = express.Router()
const multer = require('multer')
const User = require('../models/User')
const Product = require('../models/Product')
const { verifyToken } = require('../middleware/auth')

// Configure multer for file uploads (store in memory)
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
})

// Upload user profile image
router.post('/upload/profile', verifyToken, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' })
    }

    const userId = req.user._id || req.user.userId

    // Convert image to base64
    const imageBase64 = req.file.buffer.toString('base64')
    const imageUrl = `data:${req.file.mimetype};base64,${imageBase64}`

    // Update user with image
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password')

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        userId: updatedUser._id,
        profileImage: updatedUser.profileImage,
        imageSize: req.file.size,
        imageMimeType: req.file.mimetype,
      },
    })
  } catch (error) {
    console.error('Profile image upload error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get user profile image
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('profileImage')

    if (!user || !user.profileImage) {
      return res.status(404).json({ success: false, error: 'Image not found' })
    }

    // If it's a base64 data URL, return as is
    if (user.profileImage.startsWith('data:')) {
      res.json({
        success: true,
        data: {
          profileImage: user.profileImage,
          imageType: 'base64',
        },
      })
    } else {
      // If it's a URL, return the URL
      res.json({
        success: true,
        data: {
          profileImage: user.profileImage,
          imageType: 'url',
        },
      })
    }
  } catch (error) {
    console.error('Get profile image error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Remove user profile image
router.delete('/profile/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId
    const currentUserId = req.user._id || req.user.userId

    // Check if user is deleting their own image or is admin
    if (userId !== currentUserId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' })
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { profileImage: null }, { new: true }).select('-password')

    res.json({
      success: true,
      message: 'Profile image removed successfully',
      data: {
        userId: updatedUser._id,
        profileImage: updatedUser.profileImage,
      },
    })
  } catch (error) {
    console.error('Delete profile image error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Upload product image
router.post('/upload/product/:productId', verifyToken, upload.single('productImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' })
    }

    const productId = req.params.productId

    // Convert image to base64
    const imageBase64 = req.file.buffer.toString('base64')
    const imageUrl = `data:${req.file.mimetype};base64,${imageBase64}`

    // Update product with image
    const updatedProduct = await Product.findByIdAndUpdate(productId, { image: imageUrl }, { new: true })

    res.json({
      success: true,
      message: 'Product image uploaded successfully',
      data: {
        productId: updatedProduct._id,
        image: updatedProduct.image,
        imageSize: req.file.size,
      },
    })
  } catch (error) {
    console.error('Product image upload error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get product image
router.get('/product/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select('image')

    if (!product || !product.image) {
      return res.status(404).json({ success: false, error: 'Image not found' })
    }

    res.json({
      success: true,
      data: {
        image: product.image,
        imageType: product.image.startsWith('data:') ? 'base64' : 'url',
      },
    })
  } catch (error) {
    console.error('Get product image error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Remove product image
router.delete('/product/:productId', verifyToken, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.productId, { image: null }, { new: true })

    res.json({
      success: true,
      message: 'Product image removed successfully',
      data: {
        productId: updatedProduct._id,
        image: updatedProduct.image,
      },
    })
  } catch (error) {
    console.error('Delete product image error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get all images count (admin only)
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const usersWithImages = await User.countDocuments({ profileImage: { $ne: null } })
    const productsWithImages = await Product.countDocuments({ image: { $ne: null } })

    res.json({
      success: true,
      data: {
        usersWithImages,
        productsWithImages,
        totalImages: usersWithImages + productsWithImages,
      },
    })
  } catch (error) {
    console.error('Get image stats error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
