/**
 * Seed sample emails for test user
 * Run with: node create-test-emails-for-test-user.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Email = require("./models/Email");

const connectDB = async () => {
  try {
    // Try to connect to MongoDB Atlas first
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ MongoDB Atlas connected");
  } catch (error) {
    console.warn("⚠ MongoDB Atlas connection failed, trying local MongoDB...");
    
    try {
      // Fallback to local MongoDB
      await mongoose.connect("mongodb://127.0.0.1:27017/email_system");
      console.log("✓ Local MongoDB connected");
    } catch (localError) {
      console.error("✗ Both MongoDB Atlas and local MongoDB failed.");
      process.exit(1);
    }
  }
};

const TEST_USER_ID = "66666666666666666666cccc";

const seedEmails = async () => {
  try {
    // Sample emails for test user
    const sampleEmails = [
      {
        userId: TEST_USER_ID,
        subject: "Welcome to Gmail Clone",
        sender: "Support Team",
        senderEmail: "support@example.com",
        content: "Welcome! This is your inbox. Let's get started.",
        fullContent: "Welcome to your email inbox! You can now send, receive, and organize emails.",
        folder: ["inbox"],
        label: "work",
        time: new Date(Date.now() - 1000 * 60 * 10),
      },
      {
        userId: TEST_USER_ID,
        subject: "Project Update",
        sender: "Project Manager",
        senderEmail: "pm@company.com",
        content: "The latest project update is here. Check the details below.",
        fullContent: "Project Status Update:\n\nThe project is progressing well. All tasks are on track.",
        folder: ["inbox"],
        label: "work",
        badge: "Important",
        time: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        userId: TEST_USER_ID,
        subject: "Invoice #12345",
        sender: "Billing Team",
        senderEmail: "billing@company.com",
        content: "Your invoice for this month is ready.",
        fullContent: "Invoice Details:\nAmount: $1,000\nDue Date: Next Month",
        folder: ["inbox"],
        label: "invoices",
        time: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        userId: TEST_USER_ID,
        subject: "Payment Received",
        sender: "Payment System",
        senderEmail: "payments@company.com",
        content: "Your payment has been processed successfully.",
        fullContent: "Payment Confirmation:\nAmount: $500\nDate: Today\nStatus: Complete",
        folder: ["inbox"],
        label: "payments",
        time: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        userId: TEST_USER_ID,
        subject: "Meeting Tomorrow at 10am",
        sender: "Team Lead",
        senderEmail: "lead@company.com",
        content: "Don't forget about tomorrow's meeting at 10am!",
        fullContent: "Meeting Details:\nTime: 10:00 AM\nLocation: Conference Room A\nTopic: Q1 Planning",
        folder: ["inbox"],
        label: "work",
        badge: "Important",
        time: new Date(Date.now() - 1000 * 60 * 60 * 3),
      },
      {
        userId: TEST_USER_ID,
        subject: "Test Email for Sent Folder",
        sender: "You",
        senderEmail: "test@example.com",
        content: "This is a test email in the sent folder.",
        fullContent: "Testing the sent folder functionality.",
        folder: ["sent"],
        label: "work",
        isRead: true,
        time: new Date(Date.now() - 1000 * 60 * 60 * 5),
      },
      {
        userId: TEST_USER_ID,
        subject: "Draft Email Example",
        sender: "You",
        senderEmail: "test@example.com",
        content: "This is a draft email.",
        fullContent: "I was working on this email draft...",
        folder: ["drafts"],
        label: null,
        isRead: true,
        time: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      {
        userId: TEST_USER_ID,
        subject: "Spam Email Example",
        sender: "Spam Bot",
        senderEmail: "spam@spammer.com",
        content: "Buy cheap products now!",
        fullContent: "Visit our site for amazing deals!",
        folder: ["spam"],
        label: null,
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      },
      {
        userId: TEST_USER_ID,
        subject: "Personal Note",
        sender: "Friend",
        senderEmail: "friend@personal.com",
        content: "Hey! How's everything going?",
        fullContent: "Let's catch up soon!",
        folder: ["inbox"],
        label: "personal",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
      {
        userId: TEST_USER_ID,
        subject: "Old Email",
        sender: "Archive Test",
        senderEmail: "archive@test.com",
        content: "This email has been archived.",
        fullContent: "Archived for later reference.",
        folder: ["archive"],
        label: null,
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
      {
        userId: TEST_USER_ID,
        subject: "Trash Email",
        sender: "Delete Test",
        senderEmail: "trash@test.com",
        content: "This email should be in trash.",
        fullContent: "Ready to be permanently deleted.",
        folder: ["trash"],
        label: null,
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      },
      {
        userId: TEST_USER_ID,
        subject: "Starred Email",
        sender: "Important Task",
        senderEmail: "important@company.com",
        content: "This is an important starred email.",
        fullContent: "Remember to follow up on this.",
        folder: ["inbox", "starred"],
        label: "work",
        isStarred: true,
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      },
    ];

    // Clear existing emails for test user
    await Email.deleteMany({ userId: TEST_USER_ID });

    // Insert sample emails
    await Email.insertMany(sampleEmails);
    console.log(
      `✓ Successfully seeded ${sampleEmails.length} sample emails for test user: ${TEST_USER_ID}`
    );

    // Verify emails were created
    const count = await Email.countDocuments({ userId: TEST_USER_ID });
    console.log(`📧 Total emails for test user: ${count}`);

    // Show folder breakdown
    const folders = await Email.aggregate([
      { $match: { userId: TEST_USER_ID } },
      { $unwind: "$folder" },
      { $group: { _id: "$folder", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log("\n📂 Folder Breakdown:");
    folders.forEach(f => {
      console.log(`   ${f._id}: ${f.count} emails`);
    });

    process.exit(0);
  } catch (error) {
    console.error("✗ Error seeding emails:", error);
    process.exit(1);
  }
};

connectDB().then(seedEmails);
