const mongoose = require('mongoose');

const imageGallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Image title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['product', 'banner', 'team', 'portfolio', 'other'],
      default: 'other',
    },
    imageData: {
      type: String, // Base64 encoded image data
      required: [true, 'Image data is required'],
    },
    mimeType: {
      type: String,
      default: 'image/jpeg',
    },
    fileSize: Number, // in bytes
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    url: String, // For reference/display
    alt: String, // Alternative text for accessibility
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Create index for faster searches
imageGallerySchema.index({ category: 1, isActive: 1 });
imageGallerySchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('ImageGallery', imageGallerySchema);
