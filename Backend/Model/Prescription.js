const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const prescriptionSchema = new Schema({
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  items: [
    {
      productMongoId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      cost: { type: Number, required: true }
    }
  ],
  status: { 
    type: String, 
    enum: ["pending", "paid"], 
    default: "pending" 
  }
});


module.exports = mongoose.model("Prescription", prescriptionSchema);