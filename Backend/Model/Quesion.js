import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: true 
  },
  answer: { 
    type: String, 
    default: null 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }
}, 
{ 
  timestamps: true 
});

const Question = mongoose.model("Question", questionSchema);

export default Question;