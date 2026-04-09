/**
 * Seed sample emails for testing Gmail management system
 * Run with: node create-test-emails.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Email = require("./models/Email");
const User = require("./models/User");

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
      console.error("\nTo fix this, you have options:");
      console.error("1. Start local MongoDB: mongod");
      console.error("2. Or configure a valid MongoDB Atlas URI in .env");
      console.error("3. Or use Docker: docker run -d -p 27017:27017 mongo");
      process.exit(1);
    }
  }
};

const seedEmails = async () => {
  try {
    // Get the first admin user
    let user = await User.findOne({ role: "admin" });

    if (!user) {
      // Create a test user if none exists
      user = new User({
        name: "Admin User",
        email: "admin@example.com",
        password: "hashedpassword",
        role: "admin",
      });
      await user.save();
      console.log("Created test user");
    }

    // Sample emails
    const sampleEmails = [
      {
        userId: user._id,
        subject: "Material UI",
        sender: "Material UI Team",
        senderEmail: "team@material-ui.com",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
        fullContent: `Dear Valued Customer,

Thank you for reaching out to Material UI Team. We're excited to discuss our latest design components and how they can enhance your project.

Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam! Qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.

Best regards,
Material UI Team`,
        badge: "Important",
        folder: ["inbox", "important"],
        label: "work",
        time: new Date(Date.now() - 1000 * 60 * 10), // 10 mins ago
      },
      {
        userId: user._id,
        subject: "Wise",
        sender: "Wise Support",
        senderEmail: "support@wise.com",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
        fullContent: `Hi there,

Your Wise account has been updated with new features. Check out what's new and how you can make the most of our platform.

Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Best regards,
Wise Team`,
        folder: ["inbox"],
        label: "payments",
        time: new Date(Date.now() - 1000 * 60 * 10),
      },
      {
        userId: user._id,
        subject: "Search Console",
        sender: "Google Search Console",
        senderEmail: "noreply@google.com",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
        fullContent: `Hello,

Your Google Search Console report is ready. Check the latest insights about your website's performance.

Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Best regards,
Google Search Console`,
        badge: "Social",
        folder: ["inbox"],
        label: "work",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      },
      {
        userId: user._id,
        subject: "PayPal",
        sender: "PayPal",
        senderEmail: "service@paypal.com",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
        fullContent: `Transaction Update

Your recent transaction has been processed successfully. Here are the details:

Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Best regards,
PayPal Security Team`,
        folder: ["inbox"],
        label: "payments",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      },
      {
        userId: user._id,
        subject: "Google Meet",
        sender: "Google Meet",
        senderEmail: "noreply@meet.google.com",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
        fullContent: `Meeting Reminder

You have an upcoming meeting scheduled. Join now or add it to your calendar.

Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Best regards,
Google Meet`,
        folder: ["inbox"],
        label: "work",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      },
      {
        userId: user._id,
        subject: "Loom Recording",
        sender: "Loom",
        senderEmail: "noreply@loom.com",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
        fullContent: `New Video Recording

Your Loom recording is ready to share. Create a link and share with your team.

Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Best regards,
Loom Team`,
        folder: ["sent"],
        label: "work",
        isRead: true,
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
      {
        userId: user._id,
        subject: "Airbnb Booking Confirmed",
        sender: "Airbnb",
        senderEmail: "noreply@airbnb.com",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
        fullContent: `Booking Confirmation

Your reservation is confirmed. Here are your booking details:

Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Best regards,
Airbnb Team`,
        folder: ["inbox"],
        label: "personal",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
      {
        userId: user._id,
        subject: "Facebook Account Activity",
        sender: "Facebook",
        senderEmail: "security@facebookmail.com",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
        fullContent: `Account Activity

We noticed some new activity on your Facebook account. Review your security settings.

Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Best regards,
Facebook Security`,
        folder: ["inbox", "important"],
        label: "personal",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
      {
        userId: user._id,
        subject: "Instagram New Followers",
        sender: "Instagram",
        senderEmail: "noreply@mail.instagram.com",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
        fullContent: `New Followers

Congratulations! You have new followers on Instagram. Check out who followed you.

Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Best regards,
Instagram Team`,
        badge: "Promotional",
        folder: ["inbox"],
        label: "personal",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
      {
        userId: user._id,
        subject: "FormBold Submission",
        sender: "FormBold",
        senderEmail: "noreply@formbold.com",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
        fullContent: `New Form Submission

You have a new form submission. Review it in your dashboard.

Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Best regards,
FormBold Team`,
        folder: ["inbox", "important"],
        label: "payments",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
      {
        userId: user._id,
        subject: "GrayGrids Templates",
        sender: "GrayGrids",
        senderEmail: "marketing@graygrid.io",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
        fullContent: `New Template Released

Check out our latest UI templates and components.

Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Best regards,
GrayGrids Team`,
        folder: ["spam"],
        label: "work",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
      {
        userId: user._id,
        subject: "UIdeck UI Kit",
        sender: "UIdeck",
        senderEmail: "noreply@uideck.com",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
        fullContent: `Awesome UI Kit Available

Our new UI Kit is now available for purchase. Limited time offer!

Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Best regards,
UIdeck Team`,
        folder: ["inbox"],
        label: "invoices",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
    ];

    // Clear existing emails for this user
    await Email.deleteMany({ userId: user._id });

    // Insert sample emails
    await Email.insertMany(sampleEmails);
    console.log(
      `Successfully seeded ${sampleEmails.length} sample emails for user: ${user.email}`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding emails:", error);
    process.exit(1);
  }
};

connectDB().then(() => seedEmails());
