const mongoose = require('mongoose');

const moduleManagementSchema = new mongoose.Schema(
  {
    moduleName: {
      type: String,
      enum: ['dashboard', 'ecommerce', 'analytics', 'marketing', 'crm', 'stocks', 'saas', 'logistics', 'ai-assistant', 'calendar', 'profile', 'task', 'forms', 'tables', 'pages', 'support', 'chat', 'ticket', 'email', 'charts', 'ui-elements', 'authentication'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    image: String, // Base64 encoded
    imageUrl: String,
    icon: String,
    category: String,
    tags: [String],
    status: {
      type: String,
      enum: ['active', 'inactive', 'coming-soon', 'archived'],
      default: 'active',
    },
    order: {
      type: Number,
      default: 0,
    },
    features: [String],
    details: mongoose.Schema.Types.Mixed,
    metadata: mongoose.Schema.Types.Mixed,
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isNew: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

moduleManagementSchema.index({ moduleName: 1, status: 1 });
moduleManagementSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('ModuleManagement', moduleManagementSchema);
