import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  petOwnerName: {
    type: String,
    required: [true, 'Please provide pet owner name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  petName: {
    type: String,
    required: [true, 'Please provide pet name'],
    trim: true,
    maxlength: [30, 'Pet name cannot be more than 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  ratingType: {
    type: String,
    enum: ['good', 'bad'],
    default: 'good'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Set ratingType based on rating before saving
feedbackSchema.pre('save', function(next) {
  if (this.rating >= 3) {
    this.ratingType = 'good';
  } else {
    this.ratingType = 'bad';
  }
  this.updatedAt = Date.now();
  next();
});

// Update ratingType when rating is updated
feedbackSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.rating) {
    update.ratingType = update.rating >= 3 ? 'good' : 'bad';
  }
  update.updatedAt = Date.now();
  next();
});

export default mongoose.model('Feedback', feedbackSchema);