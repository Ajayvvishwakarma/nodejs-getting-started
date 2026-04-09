const mongoose = require("mongoose");
const Email = require("./models/Email");

const TEST_USER_ID = "66666666666666666666cccc";

mongoose.connect("mongodb://127.0.0.1:27017/email_system").then(async () => {
  const folders = await Email.aggregate([
    { $match: { userId: TEST_USER_ID } },
    { $unwind: "$folder" },
    { $group: { _id: "$folder", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  
  console.log("\n📂 Folder Breakdown:");
  folders.forEach(f => console.log(`   ${f._id}: ${f.count} emails`));
  console.log("\n✅ Test emails ready! Switch folders in the UI to see them.\n");
  
  process.exit(0);
}).catch(e => { 
  console.error("Error:", e.message);
  process.exit(1); 
});
