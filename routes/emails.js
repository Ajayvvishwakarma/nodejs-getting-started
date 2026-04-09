const express = require("express");
const router = express.Router();
const Email = require("../models/Email");
const { verifyToken: auth } = require("../middleware/auth");

// Middleware to allow optional auth (for testing)
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      req.user = decoded;
      req.user.id = decoded._id || decoded.id || decoded.userId;
    } else {
      // Use default test user for testing without auth
      req.user = {
        id: '66666666666666666666cccc', // Default test user ID
        email: 'test@example.com'
      };
    }
    next();
  } catch (error) {
    // If token is invalid, still allow with test user
    req.user = {
      id: '66666666666666666666cccc',
      email: 'test@example.com'
    };
    next();
  }
};

// GET all emails for user with filtering
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { folder, label, isStarred, isRead } = req.query;
    let query = { userId: req.user.id };

    // Add filters if provided
    if (folder) {
      // folder is an array in the Email model, use $in to check if folder exists in array
      query.folder = { $in: [folder] };
    }
    if (label) {
      query.label = label;
    }
    if (isStarred !== undefined) {
      query.isStarred = isStarred === "true";
    }
    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    const emails = await Email.find(query)
      .sort({ time: -1 })
      .populate("replyTo", "sender subject")
      .populate("replies", "sender subject time");

    res.json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ message: "Error fetching emails", error: error.message });
  }
});

// GET single email
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const email = await Email.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })
      .populate("replyTo", "sender subject content time")
      .populate("replies", "sender subject content time");

    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Mark as read
    email.isRead = true;
    await email.save();

    res.json(email);
  } catch (error) {
    res.status(500).json({ message: "Error fetching email", error: error.message });
  }
});

// CREATE new email (send)
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { subject, sender, senderEmail, content, fullContent, badge, label, recipients } = req.body;

    // Validate required fields
    if (!subject || !content) {
      return res.status(400).json({ message: "Subject and content are required" });
    }

    // Create email for user's sent folder
    const email = new Email({
      userId: req.user.id,
      subject,
      sender,
      senderEmail: senderEmail || req.user.email,
      content,
      fullContent: fullContent || content,
      badge,
      label,
      folder: ["sent"],
      isRead: true,
      time: new Date(),
    });

    await email.save();

    // In real scenario, send email to recipients via nodemailer
    res.status(201).json({
      message: "Email sent successfully",
      email,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email", error: error.message });
  }
});

// UPDATE email (mark as read, star, change folder, change label)
router.put("/:id", optionalAuth, async (req, res) => {
  try {
    const { isRead, isStarred, folder, label } = req.body;

    let email = await Email.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Update fields
    if (isRead !== undefined) email.isRead = isRead;
    if (isStarred !== undefined) email.isStarred = isStarred;
    if (folder) email.folder = folder;
    if (label !== undefined) email.label = label;

    email = await email.save();
    res.json({
      message: "Email updated successfully",
      email,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating email", error: error.message });
  }
});

// DELETE email (move to trash or permanent delete)
router.delete("/:id", optionalAuth, async (req, res) => {
  try {
    const { permanent } = req.query;

    const email = await Email.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    if (permanent === "true") {
      // Permanent delete
      await Email.deleteOne({ _id: req.params.id });
      res.json({ message: "Email permanently deleted" });
    } else {
      // Move to trash
      email.folder = ["trash"];
      await email.save();
      res.json({ message: "Email moved to trash", email });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting email", error: error.message });
  }
});

// BULK operations
router.post("/bulk/move", optionalAuth, async (req, res) => {
  try {
    const { emailIds, folder } = req.body;

    if (!emailIds || !folder) {
      return res.status(400).json({ message: "emailIds and folder are required" });
    }

    const result = await Email.updateMany(
      {
        _id: { $in: emailIds },
        userId: req.user.id,
      },
      {
        $set: { folder: [folder] },
      }
    );

    res.json({
      message: "Emails moved successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error moving emails", error: error.message });
  }
});

// REPLY to email
router.post("/:id/reply", optionalAuth, async (req, res) => {
  try {
    const { content, fullContent } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const originalEmail = await Email.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!originalEmail) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Create reply email
    const reply = new Email({
      userId: req.user.id,
      subject: `Re: ${originalEmail.subject}`,
      sender: originalEmail.sender === "You" ? req.user.name : "You",
      content,
      fullContent: fullContent || content,
      folder: ["sent"],
      isRead: true,
      replyTo: req.params.id,
      time: new Date(),
    });

    await reply.save();

    // Add reply to original email's replies
    originalEmail.replies.push(reply._id);
    await originalEmail.save();

    res.status(201).json({
      message: "Reply sent successfully",
      reply,
    });
  } catch (error) {
    console.error("Error sending reply:", error);
    res.status(500).json({ message: "Error sending reply", error: error.message });
  }
});

// SEARCH emails
router.get("/search/query", optionalAuth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const emails = await Email.find(
      {
        userId: req.user.id,
        $or: [
          { subject: { $regex: q, $options: "i" } },
          { content: { $regex: q, $options: "i" } },
          { sender: { $regex: q, $options: "i" } },
        ],
      },
      null,
      { limit: 20 }
    ).sort({ time: -1 });

    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: "Error searching emails", error: error.message });
  }
});

module.exports = router;
