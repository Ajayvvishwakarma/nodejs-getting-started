const express = require('express');
const path = require('path');
const router = express.Router();
const upload = require('../middleware/upload');

// POST /api/upload - handle image upload
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  // Build the public URL for the uploaded image
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: imageUrl });
});

module.exports = router;
