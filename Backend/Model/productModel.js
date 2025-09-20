const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  expirationDate: { type: Date, required: true },
  cost: { type: Number, required: true },
  currantStock: { type: Number, required: true },
  minimumThreshold: { type: Number, required: true },
  category: { type: String, required: true },
  productStatus: { type: String, required: true },
  imageUrl: { type: String, required: false },
  
  // ✅ new field for insights
  totalSold: { type: Number, default: 0 }
});

module.exports = mongoose.model("Product", productSchema);