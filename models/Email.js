const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    senderEmail: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    fullContent: {
      type: String,
    },
    time: {
      type: Date,
      default: Date.now,
    },
    badge: {
      type: String,
      enum: ["Important", "Social", "Promotional", null],
      default: null,
    },
    folder: {
      type: [String],
      enum: ["inbox", "sent", "drafts", "spam", "trash", "archive", "important", "starred"],
      default: ["inbox"],
    },
    label: {
      type: String,
      enum: ["personal", "work", "payments", "invoices", null],
      default: null,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    hasAttachments: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        filename: String,
        url: String,
        size: Number,
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Email",
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Email",
      },
    ],
  },
  { timestamps: true }
);

// Index for faster queries
emailSchema.index({ userId: 1, folder: 1 });
emailSchema.index({ userId: 1, label: 1 });
emailSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model("Email", emailSchema);
