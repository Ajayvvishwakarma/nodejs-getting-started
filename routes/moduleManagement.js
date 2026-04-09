const express = require('express');
const router = express.Router();
const multer = require('multer');
const ModuleManagement = require('../models/ModuleManagement');
const { verifyToken, isAdmin } = require('../middleware/auth');

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
});

// Get all modules with filters
router.get('/', async (req, res) => {
  try {
    const { moduleName, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (moduleName) filter.moduleName = moduleName;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const modules = await ModuleManagement.find(filter)
      .select('-image') // Don't send large image data in list
      .limit(limit)
      .skip(skip)
      .sort({ order: 1, createdAt: -1 });

    const total = await ModuleManagement.countDocuments(filter);

    res.json({
      success: true,
      data: modules,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch modules' });
  }
});

// Get single module
router.get('/:id', async (req, res) => {
  try {
    const module = await ModuleManagement.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    res.json({ success: true, data: module });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch module' });
  }
});

// Create new module (Admin only)
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { moduleName, title, description, price, currency, category, tags, features, isNew } = req.body;

    if (!moduleName || !title) {
      return res.status(400).json({
        success: false,
        message: 'Module name and title are required',
      });
    }

    let imageData = null;
    if (req.file) {
      imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const module = new ModuleManagement({
      moduleName,
      title,
      description,
      price: parseFloat(price) || 0,
      currency,
      image: imageData,
      category,
      tags: tags ? (typeof tags === 'string' ? tags.split(',') : tags) : [],
      features: features ? (typeof features === 'string' ? features.split(',') : features) : [],
      managedBy: req.user.id,
      isNew: isNew === 'true' || isNew === true,
    });

    await module.save();

    res.json({
      success: true,
      message: 'Module created successfully',
      data: module,
    });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ success: false, message: 'Failed to create module', error: error.message });
  }
});

// Update module (Admin only)
router.put('/:id', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, currency, category, tags, features, status, order, isNew } = req.body;

    const updateData = {
      title,
      description,
      price: price ? parseFloat(price) : undefined,
      currency,
      category,
      status,
      order: order ? parseInt(order) : undefined,
      isNew: isNew === 'true' || isNew === true,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : undefined,
      features: features ? (Array.isArray(features) ? features : features.split(',')) : undefined,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    if (req.file) {
      updateData.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const module = await ModuleManagement.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    res.json({
      success: true,
      message: 'Module updated successfully',
      data: module,
    });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ success: false, message: 'Failed to update module', error: error.message });
  }
});

// Update price (Admin only)
router.patch('/:id/price', verifyToken, isAdmin, async (req, res) => {
  try {
    const { price, currency } = req.body;

    if (price === undefined) {
      return res.status(400).json({ success: false, message: 'Price is required' });
    }

    const module = await ModuleManagement.findByIdAndUpdate(
      req.params.id,
      { price: parseFloat(price), currency: currency || 'USD' },
      { new: true }
    );

    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    res.json({
      success: true,
      message: 'Price updated successfully',
      data: { id: module._id, price: module.price, currency: module.currency },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update price' });
  }
});

// Update image (Admin only)
router.patch('/:id/image', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const module = await ModuleManagement.findByIdAndUpdate(
      req.params.id,
      { image: imageData },
      { new: true }
    );

    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    res.json({
      success: true,
      message: 'Image updated successfully',
      data: { id: module._id, imageUrl: module.imageUrl },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update image' });
  }
});

// Delete module (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const module = await ModuleManagement.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    );

    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    res.json({ success: true, message: 'Module archived successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete module' });
  }
});

// Get modules by module name
router.get('/category/:moduleName', async (req, res) => {
  try {
    const modules = await ModuleManagement.find({
      moduleName: req.params.moduleName,
      status: 'active',
    })
      .select('-image')
      .sort({ order: 1 });

    res.json({ success: true, data: modules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch modules' });
  }
});

// Reorder modules
router.post('/reorder', verifyToken, isAdmin, async (req, res) => {
  try {
    const { orders } = req.body; // [{ id, order }, ...]

    for (const item of orders) {
      await ModuleManagement.findByIdAndUpdate(item.id, { order: item.order });
    }

    res.json({ success: true, message: 'Modules reordered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reorder modules' });
  }
});

// Bulk update status
router.patch('/bulk/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !status) {
      return res.status(400).json({ success: false, message: 'IDs and status are required' });
    }

    await ModuleManagement.updateMany({ _id: { $in: ids } }, { status });

    res.json({ success: true, message: `${ids.length} modules updated` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update modules' });
  }
});

module.exports = router;
