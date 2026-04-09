# Real-Time Gmail Management System with MongoDB

A complete email management system built with Node.js, Express, MongoDB, and Alpine.js that provides Gmail-like functionality for your application.

## 🚀 Features

✅ **Real-time Email Management** - CRUD operations with MongoDB
✅ **Gmail-like Folders** - Inbox, Sent, Drafts, Spam, Trash, Archive
✅ **Smart Labels** - Personal, Work, Payments, Invoices
✅ **Email Filtering** - Filter by folder, label, read status, starred
✅ **Reply System** - Thread-based email conversations
✅ **Search Functionality** - Full-text search across emails
✅ **Bulk Operations** - Move multiple emails at once
✅ **Real-time Updates** - Alpine.js reactive UI
✅ **Authentication** - Token-based JWT auth

## 📁 Project Structure

```
nodejs-getting-started/
├── models/
│   └── Email.js              # MongoDB Email schema
├── routes/
│   └── emails.js             # Email API endpoints
├── create-test-emails.js     # Seed script for sample data
└── index.js                  # Main server file (updated)

test01/demo.tailadmin.com/
├── inbox.html                # Main inbox UI
├── assets/js/
│   └── mail-client.js        # Email client library
```

## 🔧 Installation & Setup

### 1. **Install Dependencies**
```bash
cd nodejs-getting-started
npm install
```

### 2. **Configure Environment Variables**
Update `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/email_system
JWT_SECRET=your_secret_key
PORT=5006
```

### 3. **Seed Sample Data**
```bash
node create-test-emails.js
```

This will create 12 sample emails in your MongoDB database.

### 4. **Start the Server**
```bash
npm start
# or
npm run dev
```

## 📚 API Endpoints

### Get All Emails
```
GET /api/emails
Query Parameters:
  - folder: "inbox" | "sent" | "drafts" | "spam" | "trash" | "archive"
  - label: "personal" | "work" | "payments" | "invoices"
  - isStarred: true | false
  - isRead: true | false

Example: GET /api/emails?folder=inbox&label=work
```

### Get Single Email
```
GET /api/emails/:id
Marks email as read automatically
```

### Send Email
```
POST /api/emails
Body: {
  subject: string (required),
  sender: string,
  senderEmail: string,
  content: string (required),
  fullContent: string,
  badge: "Important" | "Social" | "Promotional",
  label: "personal" | "work" | "payments" | "invoices"
}
```

### Update Email
```
PUT /api/emails/:id
Body: {
  isRead: boolean,
  isStarred: boolean,
  folder: ["inbox" | "sent" | ...],
  label: string
}
```

### Delete Email
```
DELETE /api/emails/:id?permanent=true
- permanent=false: Move to trash (default)
- permanent=true: Permanent delete
```

### Move Multiple Emails
```
POST /api/emails/bulk/move
Body: {
  emailIds: [id1, id2, ...],
  folder: "inbox" | "spam" | ...
}
```

### Reply to Email
```
POST /api/emails/:id/reply
Body: {
  content: string (required),
  fullContent: string
}
```

### Search Emails
```
GET /api/emails/search/query?q=search_term
```

## 🎨 Frontend Integration

### 1. **Include the Mail Client Library**
```html
<script src="/admin-dashboard/assets/js/mail-client.js"></script>
```

### 2. **Initialize and Use**
```javascript
// Initialize the mail client
const mailClient = new MailClient("/api/emails");

// Fetch emails for a folder
await mailClient.fetchEmails("inbox");

// Get filtered emails
const workEmails = await mailClient.fetchEmails("inbox", "work");

// Send email
await mailClient.sendEmail({
  subject: "Hello",
  sender: "You",
  content: "Email body",
  label: "work"
});

// Mark as read
await mailClient.updateEmail(emailId, { isRead: true });

// Star email
await mailClient.updateEmail(emailId, { isStarred: true });

// Delete email
await mailClient.deleteEmail(emailId);

// Reply
await mailClient.replyToEmail(emailId, "Reply content");

// Search
const results = await mailClient.searchEmails("invoice");
```

## 🔌 Alpine.js Integration

The inbox.html uses Alpine.js for reactive UI. The mail client updates the data automatically:

```javascript
// In Alpine.js component
async function mailApp() {
  return {
    isActive: 'inbox',
    mails: [],
    selectedEmail: null,
    
    // Load emails on mount
    async init() {
      this.mails = await mailClient.fetchEmails(this.isActive);
    },
    
    // Get filtered mails
    getFilteredMails() {
      return mailClient.emails.filter(mail => 
        mail.folder.includes(this.isActive) || 
        mail.label === this.isActive
      );
    },
    
    // Send new email
    async sendEmail(emailData) {
      try {
        await mailClient.sendEmail(emailData);
        this.mails = await mailClient.fetchEmails('sent');
      } catch (error) {
        console.error('Send failed:', error);
      }
    }
  }
}
```

## 📊 Database Schema (Email Model)

```javascript
{
  userId: ObjectId,              // Reference to User
  subject: String,               // Email subject
  sender: String,                // Sender name
  senderEmail: String,           // Sender email
  content: String,               // Email preview
  fullContent: String,           // Full email body
  time: Date,                    // Sent/received time
  badge: String,                 // Important, Social, Promotional
  folder: [String],              // inbox, sent, drafts, spam, trash, archive
  label: String,                 // personal, work, payments, invoices
  isStarred: Boolean,            // Starred flag
  isRead: Boolean,               // Read status
  hasAttachments: Boolean,       // Attachment flag
  attachments: Array,            // File attachments
  replyTo: ObjectId,             // References original email
  replies: [ObjectId],           // Array of reply IDs
  createdAt: Date,               // Created timestamp
  updatedAt: Date                // Updated timestamp
}
```

## 🔐 Authentication

All endpoints require JWT authentication. Include the token in headers:
```http
Authorization: Bearer <token>
```

The auth middleware validates the token and extracts `req.user.id` for user-specific queries.

## 🗂️ Example Workflows

### Filter by Folder
```javascript
// Inbox
await mailClient.fetchEmails('inbox');

// Sent items
await mailClient.fetchEmails('sent');

// Spam folder
await mailClient.fetchEmails('spam');
```

### Filter by Label
```javascript
// Work emails in inbox
await mailClient.fetchEmails('inbox', 'work');

// Payment emails
await mailClient.fetchEmails('inbox', 'payments');
```

### Advanced Filtering
```javascript
// Get important emails
const importantEmails = await mailClient.fetchEmails('important');

// Get starred emails
const starred = mailClient.emails.filter(e => e.isStarred);

// Get unread
const unread = mailClient.emails.filter(e => !e.isRead);
```

### Manage Emails
```javascript
// Move to spam
await mailClient.updateEmail(id, { folder: ['spam'] });

// Star for later
await mailClient.updateEmail(id, { isStarred: true });

// Change label
await mailClient.updateEmail(id, { label: 'invoices' });

// Mark as read
await mailClient.updateEmail(id, { isRead: true });
```

## 📦 Real-time Sync

To enable real-time syncing (WebSocket), you can extend the system:

```javascript
// In mail-client.js
async enableRealtimeSync() {
  const socket = io('/api/emails');
  
  socket.on('email:new', (email) => {
    this.emails.unshift(email);
    // Update UI
  });
  
  socket.on('email:updated', (email) => {
    const index = this.emails.findIndex(e => e._id === email._id);
    if(index !== -1) this.emails[index] = email;
  });
}
```

## 🚦 Error Handling

All API calls include error handling:
```javascript
try {
  await mailClient.sendEmail({...});
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly error message
}
```

## 🔄 Testing the System

1. **Start the server**: `npm start`
2. **Log in** with a user account
3. **Seed emails**: `node create-test-emails.js`
4. **Access inbox**: `http://localhost:5006/admin-dashboard/inbox.html`
5. **Test features:**
   - Click folders to filter emails
   - Click labels to filter by label
   - Star emails
   - Mark as read
   - Send new emails
   - Reply to emails
   - Move to different folders

## 🎯 Next Steps

1. **Notifications** - Add real-time email notifications
2. **Attachments** - Implement file upload/download
3. **Templates** - Save email templates
4. **Scheduled Send** - Schedule emails for later
5. **Sync** - Sync with actual Gmail via OAuth
6. **WebSocket** - Real-time updates with Socket.io
7. **Signatures** - User-defined email signatures

## 📝 Notes

- All email times are stored in MongoDB
- Emails are associated with userId for multi-user support
- Deleted emails remain in trash for 30 days before permanent deletion
- Search is case-insensitive full-text search
- Bulk operations support up to 100 emails at a time

## 🆘 Troubleshooting

**No emails showing?**
- Run `node create-test-emails.js` to seed data
- Check MongoDB connection in `.env`

**Authentication errors?**
- Ensure JWT token is valid
- Check `Authorization` header format

**API 404 errors?**
- Verify routes are registered in `index.js`
- Check route file paths

---

Happy emailing! 🚀
