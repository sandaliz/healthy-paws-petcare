import Question from "../Model/Quesion.js";

// Create a new question
export const createQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ success: false, message: "Question text is required" });
    }
    
    const newQuestion = new Question({
      question,
      user: req.user.id // Get user ID from auth middleware
    });
    
    const savedQuestion = await newQuestion.save();
    
    res.status(201).json({ success: true, question: savedQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Get all questions
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate("user", "name email") // Populate user details
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json({ success: true, count: questions.length, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Get questions by user ID
export const getQuestionsByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    const questions = await Question.find({ user: userId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, count: questions.length, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Get question by ID
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("user", "name email");
    
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
    
    res.status(200).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Update question
export const updateQuestion = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const questionId = req.params.id;
    
    const existingQuestion = await Question.findById(questionId);
    
    if (!existingQuestion) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
    
    
    
    // Update fields if provided
    if (question) existingQuestion.question = question;
    if (answer !== undefined) existingQuestion.answer = answer;
    
    const updatedQuestion = await existingQuestion.save();
    
    res.status(200).json({ success: true, question: updatedQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Delete question
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
    
    // Check if user owns the question or is admin
    if (question.user.toString() !== req.user.id && 
        !["SUPER_ADMIN", "ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. You can only delete your own questions" 
      });
    }
    
    await Question.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ success: true, message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};