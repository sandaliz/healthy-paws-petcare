// Necessary libraries and modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Dotenv configuration and Express app initialization
require('dotenv').config();
const app = express();

// Import routes
const UserRoutes = require('./Routes/User/UserRoutes');
const DoctorRoutes = require('./Routes/Doctor/DoctorRoutes');
const AppointmentRoutes = require('./Routes/Appointment/AppointmentRoutes');
const PostRoutes = require('./Routes/Post/PostRoutes'); // Import the new Post routes

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/users', UserRoutes);
app.use('/doctors', DoctorRoutes);
app.use('/appointments', AppointmentRoutes);
app.use('/posts', PostRoutes); // Add the new Post routes

// Database connection
// uri - "mongodb+srv://admin:azwOuFMBmc34fmEY@cluster0.4s8zmoj.mongodb.net/"
mongoose
  .connect("mongodb+srv://admin:azwOuFMBmc34fmEY@cluster0.4s8zmoj.mongodb.net/")
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(5000, () => {
      console.log('Server running on port:', 5000);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });