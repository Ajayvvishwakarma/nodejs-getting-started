const mongoose = require('mongoose');

const DiscountCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  maxUsagePerCustomer: {
    type: Number,
    default: 1
  },
  totalUsageLimit: {
    type: Number,
    default: null // null = unlimited
  },
  usageCount: {
    type: Number,
    default: 0
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null // max discount in dollars (for percentage codes)
  },
  applicableCategories: [String], // empty = all categories
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usedBy: [{
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    usedAt: Date,
    orderId: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
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

// Check if code is valid for current time
DiscountCodeSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && this.validFrom <= now && this.validUntil >= now;
};

// Check if code usage limit exceeded
DiscountCodeSchema.methods.isUsageLimitExceeded = function() {
  if (this.totalUsageLimit === null) return false;
  return this.usageCount >= this.totalUsageLimit;
};

// Index for faster lookups
DiscountCodeSchema.index({ code: 1 });
DiscountCodeSchema.index({ validFrom: 1, validUntil: 1 });

module.exports = mongoose.model('DiscountCode', DiscountCodeSchema);
