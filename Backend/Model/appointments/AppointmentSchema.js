const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({ 
  appointmentId:{
    type: String,
    required: true
  },
  pet: {
    type: String,
    required: true
  },
  type:{
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  contact:{
    type: String,
    required: true
  },
  doctor: {
    type: String,
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);