const mongoose = require("mongoose");
const Email = require("./models/Email");

const TEST_USER_ID = "66666666666666666666cccc";

mongoose.connect("mongodb://127.0.0.1:27017/email_system").then(async () => {
  const emails = await Email.find({ userId: TEST_USER_ID }).select("subject folder");
  
  console.log("\n📧 Emails in Database:");
  emails.forEach(e => console.log(`   ${e.subject} → ${JSON.stringify(e.folder)}`));
  
  // Count by folder
  const folders = {};
  emails.forEach(e => {
    if (e.folder && Array.isArray(e.folder)) {
      e.folder.forEach(f => {
        folders[f] = (folders[f] || 0) + 1;
      });
    }
  });
  
  console.log("\n📂 Folder Breakdown:");
  Object.entries(folders).sort().forEach(([folder, count]) => {
    console.log(`   ${folder}: ${count} emails`);
  });
  
  console.log("\n✅ Loaded! Refresh your inbox in the browser.\n");
  
  process.exit(0);
}).catch(e => { 
  console.error("Error:", e.message);
  process.exit(1); 
});
