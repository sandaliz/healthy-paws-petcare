const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const checkInOutSchema = new Schema({
    checkInOutID: {
        type: String,
        unique: true,
        
    },
    appointment: {
        type: Schema.Types.ObjectId,
        ref: "CareCustomer",
        required: true
    },
    checkInTime: {
        type: Date,
        required: true
    },
    checkOutTime: {
        type: Date
    },
    checkedInBy: {
        type: String,
        required: true
    },
    checkedOutBy: {
        type: String
    },
}, { timestamps: true });

checkInOutSchema.pre('save', function(next) {
    if (!this.checkInOutID) {
        this.checkInOutID = 'CIO' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    next();
});

module.exports = mongoose.model("CheckInOut", checkInOutSchema);