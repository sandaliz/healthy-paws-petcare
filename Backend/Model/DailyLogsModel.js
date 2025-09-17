const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dailyLogSchema = new Schema({
    logID: {
        type: String,
        unique: true,
        
    },
    appointment: {
        type: Schema.Types.ObjectId,
        ref: "CareCustomer",
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    feeding: {
        type: String,
        required: true
    },
    note: {
        type: String
    },
    playtime: {
        type: String
    },
    walking: {
        type: String
    },
    grooming: {
        type: String
    },
    mood: {
        type: String,
        enum: ["excellent", "good", "okay", "poor"],
        default: "good"
    },
    loggedBy: {
        type: String,
        required: true
    }

}, { timestamps: true });

dailyLogSchema.pre('save', function(next) {
    if (!this.logID) {
        this.logID = 'LOG' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    next();
});

module.exports = mongoose.model("DailyLog", dailyLogSchema);