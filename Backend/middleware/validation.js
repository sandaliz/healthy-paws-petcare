import { body, validationResult } from 'express-validator';
import Feedback from '../Model/Feedback.js';

// Validation rules for feedback
export const feedbackValidationRules = () => {
  return [
    // Pet owner name validation
    body('petOwnerName')
      .notEmpty()
      .withMessage('Pet owner name is required')
      .isLength({ max: 50 })
      .withMessage('Pet owner name cannot be longer than 50 characters')
      .trim()
      .escape(),
    
    // Pet name validation
    body('petName')
      .notEmpty()
      .withMessage('Pet name is required')
      .isLength({ max: 30 })
      .withMessage('Pet name cannot be longer than 30 characters')
      .trim()
      .escape(),
    
    // Email validation
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    
    // Message validation
    body('message')
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 500 })
      .withMessage('Message cannot be longer than 500 characters')
      .trim()
      .escape(),
    
    // Rating validation
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be a number between 1 and 5')
  ];
};

// Check for validation errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
  
  return res.status(422).json({
    errors: extractedErrors,
  });
};

// Middleware to check if user owns the feedback
export const checkFeedbackOwnership = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    // For simplicity, we're using email to verify ownership
    // In a real app, you'd use authentication with user IDs
    if (feedback.email !== req.body.email) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this feedback'
      });
    }
    
    req.feedback = feedback;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};