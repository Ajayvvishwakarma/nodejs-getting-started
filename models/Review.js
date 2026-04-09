const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  order: {
    type: String, // orderId from CustomerOrder
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  images: [String], // URLs of images uploaded by reviewer
  helpful: {
    type: Number,
    default: 0
  },
  unhelpful: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: true // verified purchase
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminResponse: {
    text: String,
    respondedAt: Date,
    respondedBy: mongoose.Schema.Types.ObjectId
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate reviews per order
ReviewSchema.index({ product: 1, order: 1 }, { unique: true });

// Index for product reviews
ReviewSchema.index({ product: 1, status: 1, createdAt: -1 });

// Index for customer reviews
ReviewSchema.index({ customer: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
