const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DoctorSchema = new Schema({

    doctorId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: "doctor",
    },
    availabilityDays: {
        type: [String],
        required: true
    },
    availabilityHours: {
        type: [String],
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);