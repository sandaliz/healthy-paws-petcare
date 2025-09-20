const mongoose = require("mongoose");
const Product = require("./Model/productModel");

// 1. Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://admin:azwOuFMBmc34fmEY@cluster0.4s8zmoj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ Connection error:", err));

// 2. Run Migration
async function migrate() {
  try {
    const result = await Product.updateMany(
      { totalSold: { $exists: false } },
      { $set: { totalSold: 0 } }
    );

    console.log("✅ Migration complete.");
    console.log(`${result.modifiedCount} products were updated.`);

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Migration failed:", err);
    mongoose.disconnect();
  }
}

// Run
migrate();