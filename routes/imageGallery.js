const express = require('express');
const router = express.Router();
const multer = require('multer');
const ImageGallery = require('../models/ImageGallery');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Configure multer for image uploads
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all images (with pagination and filtering)
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 12, search } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) {
      filter.$text = { $search: search };
    }

    const images = await ImageGallery.find(filter)
      .select('-imageData') // Don't return large image data in list
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await ImageGallery.countDocuments(filter);

    res.json({
      success: true,
      data: images,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images',
    });
  }
});

// Get single image by ID
router.get('/:id', async (req, res) => {
  try {
    const image = await ImageGallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    res.json({
      success: true,
      data: image,
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image',
    });
  }
});

// Upload new image (Admin only)
router.post('/upload', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, alt, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Image title is required',
      });
    }

    // Convert file to base64
    const imageData = req.file.buffer.toString('base64');

    const image = new ImageGallery({
      title: title.trim(),
      description: description?.trim(),
      category: category || 'other',
      imageData: `data:${req.file.mimetype};base64,${imageData}`,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      alt: alt?.trim(),
      tags: tags ? (typeof tags === 'string' ? tags.split(',') : tags) : [],
    });

    await image.save();

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        id: image._id,
        title: image.title,
        category: image.category,
        fileSize: image.fileSize,
      },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
});

// Update image metadata (Admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, description, category, alt, tags, isActive } = req.body;

    const image = await ImageGallery.findByIdAndUpdate(
      req.params.id,
      {
        title: title?.trim(),
        description: description?.trim(),
        category,
        alt: alt?.trim(),
        tags: Array.isArray(tags) ? tags : tags?.split(',') || [],
        isActive: isActive !== undefined ? isActive : true,
      },
      { new: true, runValidators: true }
    );

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    res.json({
      success: true,
      message: 'Image updated successfully',
      data: image,
    });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update image',
      error: error.message,
    });
  }
});

// Delete image (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const image = await ImageGallery.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message,
    });
  }
});

// Get images by category
router.get('/category/:category', async (req, res) => {
  try {
    const images = await ImageGallery.find({
      category: req.params.category,
      isActive: true,
    })
      .select('-imageData')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error('Error fetching images by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images',
    });
  }
});

// Restore deleted image (Admin only)
router.put('/:id/restore', verifyToken, isAdmin, async (req, res) => {
  try {
    const image = await ImageGallery.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    res.json({
      success: true,
      message: 'Image restored successfully',
      data: image,
    });
  } catch (error) {
    console.error('Error restoring image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore image',
      error: error.message,
    });
  }
});

module.exports = router;
