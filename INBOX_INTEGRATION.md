# Real-Time Inbox Integration Guide

## Quick Start

### 1. Add Script to inbox.html

Add this before the closing `</body>` tag in `inbox.html`:

```html
<!-- Real-time Email Client -->
<script src="/admin-dashboard/assets/js/mail-client.js"></script>
```

### 2. Update Alpine.js Component

Replace the `mailApp()` function with this version that integrates with MongoDB:

```javascript
async function mailApp() {
  const mail = {
    isActive: 'inbox',
    mails: [],
    selectedEmail: null,
    itemsChecked: [],
    allChecked: false,
    loading: true,
    error: null,
    
    // Initialize - load emails from database
    async init() {
      try {
        this.loading = true;
        const emails = await mailClient.fetchEmails(this.isActive);
        this.mails = emails.map(email => ({
          ...email,
          time: mailClient.formatTime(email.createdAt || email.time)
        }));
        this.itemsChecked = new Array(this.mails.length).fill(false);
      } catch (err) {
        this.error = 'Failed to load emails: ' + err.message;
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    
    // Watch for filter changes and reload
    $watch('isActive', async function() {
      await this.init();
    }),
    
    // Get filtered mails
    getFilteredMails() {
      if (this.mails.length === 0) return [];
      
      return this.mails.filter(mail => {
        // Check folder
        if (this.isActive === 'inbox' && mail.folder?.includes('inbox')) return true;
        if (this.isActive === 'sent' && mail.folder?.includes('sent')) return true;
        if (this.isActive === 'drafts' && mail.folder?.includes('drafts')) return true;
        if (this.isActive === 'spam' && mail.folder?.includes('spam')) return true;
        if (this.isActive === 'trash' && mail.folder?.includes('trash')) return true;
        if (this.isActive === 'archive' && mail.folder?.includes('archive')) return true;
        
        // Check status
        if (this.isActive === 'starred' && mail.isStarred) return true;
        if (this.isActive === 'important' && mail.badge === 'Important') return true;
        
        // Check label
        if (this.isActive === 'personal' && mail.label === 'personal') return true;
        if (this.isActive === 'work' && mail.label === 'work') return true;
        if (this.isActive === 'payments' && mail.label === 'payments') return true;
        if (this.isActive === 'invoices' && mail.label === 'invoices') return true;
        
        return false;
      });
    },
    
    // Select email
    selectEmail(index) {
      const filtered = this.getFilteredMails();
      this.selectedEmail = index < filtered.length ? filtered[index] : null;
      if (this.selectedEmail && !this.selectedEmail.isRead) {
        this.markAsRead(this.selectedEmail._id);
      }
    },
    
    // Close email
    closeEmail() {
      this.selectedEmail = null;
    },
    
    // Mark email as read
    async markAsRead(emailId) {
      try {
        await mailClient.updateEmail(emailId, { isRead: true });
        const email = this.mails.find(e => e._id === emailId);
        if (email) email.isRead = true;
      } catch (err) {
        this.error = 'Failed to mark email as read';
        console.error(err);
      }
    },
    
    // Star/unstar email
    async toggleStar(emailId) {
      try {
        const email = this.mails.find(e => e._id === emailId);
        if (email) {
          email.isStarred = !email.isStarred;
          await mailClient.updateEmail(emailId, { isStarred: email.isStarred });
        }
      } catch (err) {
        this.error = 'Failed to star email';
        console.error(err);
      }
    },
    
    // Delete email
    async deleteEmail(emailId) {
      try {
        await mailClient.deleteEmail(emailId);
        this.mails = this.mails.filter(e => e._id !== emailId);
        this.selectedEmail = null;
      } catch (err) {
        this.error = 'Failed to delete email';
        console.error(err);
      }
    },
    
    // Move to folder
    async moveToFolder(emailId, folder) {
      try {
        await mailClient.updateEmail(emailId, { folder: [folder] });
        if (folder === 'trash') {
          this.mails = this.mails.filter(e => e._id !== emailId);
        }
        this.selectedEmail = null;
      } catch (err) {
        this.error = 'Failed to move email';
        console.error(err);
      }
    },
    
    // Send email
    async sendEmail(formData) {
      try {
        await mailClient.sendEmail({
          subject: formData.subject,
          sender: 'You',
          senderEmail: formData.to,
          content: formData.message.substring(0, 100) + '...',
          fullContent: formData.message,
          folder: ['sent']
        });
        
        // Reload sent folder
        await this.init();
      } catch (err) {
        this.error = 'Failed to send email: ' + err.message;
        throw err;
      }
    },
    
    // Toggle check all
    toggleAll() {
      this.allChecked = !this.allChecked;
      this.itemsChecked = this.itemsChecked.map(() => this.allChecked);
    },
    
    // Toggle individual item
    toggleItem(index) {
      this.itemsChecked[index] = !this.itemsChecked[index];
      this.allChecked = this.itemsChecked.every(v => v);
    }
  };
  
  return mail;
}
```

### 3. Update Compose Form

Modify the compose form to integrate with backend:

```html
<form class="space-y-4" @submit.prevent="sendEmail({
  subject: $el.querySelector('[placeholder=\"Email subject\"]').value,
  to: $el.querySelector('[placeholder=\"recipient@example.com\"]').value,
  message: $el.querySelector('textarea').value
}); composeOpen = false">
  <div>
    <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">To:</label>
    <input type="email" placeholder="recipient@example.com" required class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500">
  </div>
  <div>
    <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Subject:</label>
    <input type="text" placeholder="Email subject" required class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500">
  </div>
  <div>
    <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Message:</label>
    <textarea placeholder="Write your message here..." rows="6" required class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"></textarea>
  </div>
  <div class="flex gap-3 pt-4">
    <button type="submit" class="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Send</button>
    <button type="button" @click="composeOpen = false" class="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">Cancel</button>
  </div>
</form>
```

### 4. Update Email Actions

Add real-time actions to email items:

```html
<!-- In email item template -->
<template x-for="(item, index) in getFilteredMails()" :key="item._id">
  <div
    @click="selectEmail(index)"
    class="flex cursor-pointer items-center border-b border-gray-200 px-4 py-4 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/[0.03] transition-colors"
    :class="selectedEmail?._id === item._id ? 'bg-gray-100 dark:bg-white/[0.03]' : ''"
  >
    <!-- Star button -->
    <div class="mr-4">
      <button
        @click.stop="toggleStar(item._id)"
        class="text-gray-400 hover:text-yellow-500"
      >
        <svg class="w-5 h-5" :fill="item.isStarred ? 'currentColor' : 'none'" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      </button>
    </div>
    
    <!-- Email content -->
    <div class="flex-1 min-w-0">
      <!-- ... email preview ... -->
    </div>
    
    <!-- Time -->
    <div class="ml-4 text-right">
      <span class="text-sm text-gray-500">
        <span x-text="mailClient.formatTime(item.createdAt || item.time)"></span>
      </span>
    </div>
  </div>
</template>
```

### 5. Update Email Detail View

Add actions to email detail:

```html
<!-- Email Detail View -->
<div x-show="selectedEmail" class="flex flex-col h-full">
  <!-- Headers -->
  <div class="flex justify-between items-center p-4 border-b">
    <div>
      <h2 x-text="selectedEmail?.subject" class="text-xl font-bold"></h2>
      <p x-text="'From: ' + selectedEmail?.sender" class="text-sm text-gray-600"></p>
    </div>
    <button @click="closeEmail()" class="text-gray-500 hover:text-gray-700">✕</button>
  </div>
  
  <!-- Actions -->
  <div class="flex gap-2 p-4 border-b">
    <button
      @click="toggleStar(selectedEmail?._id)"
      class="px-3 py-2 text-sm rounded-lg border"
      :class="selectedEmail?.isStarred ? 'bg-yellow-100 border-yellow-300' : 'bg-white border-gray-300'"
    >
      ⭐ Star
    </button>
    <button
      @click="moveToFolder(selectedEmail?._id, 'spam')"
      class="px-3 py-2 text-sm rounded-lg bg-white border border-gray-300 hover:bg-gray-50"
    >
      🚫 Spam
    </button>
    <button
      @click="deleteEmail(selectedEmail?._id)"
      class="px-3 py-2 text-sm rounded-lg bg-red-50 border border-red-200 text-red-600"
    >
      🗑️ Delete
    </button>
  </div>
  
  <!-- Email content -->
  <div class="flex-1 overflow-y-auto p-4">
    <p x-text="selectedEmail?.fullContent" class="text-gray-700 whitespace-pre-wrap"></p>
  </div>
</div>
```

## Environment Setup

Ensure your `.env` file has:
```env
MONGODB_URI=mongodb://localhost:27017/email_system
JWT_SECRET=your_secret_key
API_BASE_URL=http://localhost:5006
```

## Testing

1. Start the server: `npm start`
2. Open inbox: `http://localhost:5006/admin-dashboard/inbox.html`
3. Test:
   - ✅ Load emails from MongoDB
   - ✅ Filter by folder/label
   - ✅ Star/unstar emails
   - ✅ Mark as read
   - ✅ Send new emails
   - ✅ Delete emails

---

Your Gmail-like mail system is now connected to MongoDB! 🚀
