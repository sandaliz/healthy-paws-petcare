const mongoose = require("mongoose");
const CheckInOut = require("../Model/CheckInOutModel");
const CareCustomer = require("../Model/CareModel");

// Check-in a pet
const checkInPet = async (req, res) => {
    try {
        const {
            appointment,
            checkInTime,
            checkedInBy
        } = req.body;

        // Validate required fields
        if (!appointment || !checkedInBy) {
            return res.status(400).json({
                message: "Appointment ID and checkedInBy are required"
            });
        }

        // Validate appointment ID format
        if (!mongoose.Types.ObjectId.isValid(appointment)) {
            return res.status(400).json({ message: "Invalid appointment ID format" });
        }

        // Check if appointment exists
        const existingAppointment = await CareCustomer.findById(appointment);
        if (!existingAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Check if pet is already checked in (no check-out time)
        const existingCheckIn = await CheckInOut.findOne({
            appointment,
            checkOutTime: { $exists: false }
        });

        if (existingCheckIn) {
            return res.status(400).json({ 
                message: "Pet is already checked in. Please check out first." 
            });
        }

        const checkInOut = new CheckInOut({
            appointment,
            checkInTime: checkInTime || new Date(),
            checkedInBy
        });

        await checkInOut.save();
        
        // Update appointment status to "Checked-In"
        await CareCustomer.findByIdAndUpdate(
            appointment,
            { status: "Checked-In" },
            { new: true }
        );

        // Populate appointment details
        await checkInOut.populate('appointment');

        res.status(201).json({
            message: "Pet checked in successfully",
            checkInOut
        });

    } catch (error) {
        console.error("Error during check-in:", error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({ message: "Validation error", errors });
        }
        
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Check-out a pet
const checkOutPet = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkOutTime, checkedOutBy, notes } = req.body;

        // Validate checkInOut ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid check-in record ID format" });
        }

        // Find the check-in record
        const checkInRecord = await CheckInOut.findById(id).populate('appointment');
        
        if (!checkInRecord) {
            return res.status(404).json({ message: "Check-in record not found" });
        }

        if (checkInRecord.checkOutTime) {
            return res.status(400).json({ message: "Pet is already checked out" });
        }

        // Update check-out details
        checkInRecord.checkOutTime = checkOutTime || new Date();
        if (checkedOutBy) checkInRecord.checkedOutBy = checkedOutBy;
        if (notes) checkInRecord.notes = notes;

        await checkInRecord.save();

        // Update appointment status to "Completed"
        await CareCustomer.findByIdAndUpdate(
            checkInRecord.appointment._id,
            { status: "Completed" },
            { new: true }
        );

        res.status(200).json({
            message: "Pet checked out successfully",
            checkInOut: checkInRecord
        });

    } catch (error) {
        console.error("Error during check-out:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all check-in/out records
const getAllCheckInOutRecords = async (req, res) => {
    try {
        const checkInOutRecords = await CheckInOut.find()
            .populate('appointment')
            .sort({ checkInTime: -1 });

        res.status(200).json({
            message: "Check-in/out records retrieved successfully",
            count: checkInOutRecords.length,
            checkInOutRecords
        });

    } catch (error) {
        console.error("Error fetching check-in/out records:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get check-in/out records by appointment ID
const getRecordsByAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: "Invalid appointment ID format" });
        }

        const checkInOutRecords = await CheckInOut.find({ appointment: appointmentId })
            .populate('appointment')
            .sort({ checkInTime: -1 });

        res.status(200).json({
            message: "Check-in/out records retrieved successfully",
            count: checkInOutRecords.length,
            checkInOutRecords
        });

    } catch (error) {
        console.error("Error fetching check-in/out records by appointment:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get current checked-in pets (no check-out time)
const getCurrentCheckedInPets = async (req, res) => {
    try {
        const checkedInPets = await CheckInOut.find({
            checkOutTime: { $exists: false }
        })
        .populate('appointment')
        .sort({ checkInTime: -1 });

        res.status(200).json({
            message: "Current checked-in pets retrieved successfully",
            count: checkedInPets.length,
            checkedInPets
        });

    } catch (error) {
        console.error("Error fetching current checked-in pets:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get check-in/out record by ID
const getCheckInOutById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid check-in record ID format" });
        }

        const checkInOutRecord = await CheckInOut.findById(id).populate('appointment');

        if (!checkInOutRecord) {
            return res.status(404).json({ message: "Check-in/out record not found" });
        }

        res.status(200).json({
            message: "Check-in/out record retrieved successfully",
            checkInOutRecord
        });

    } catch (error) {
        console.error("Error fetching check-in/out record:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update check-in/out record
const updateCheckInOutRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid check-in record ID format" });
        }

        // If appointment is being updated, validate it exists
        if (updateData.appointment) {
            const appointmentExists = await CareCustomer.findById(updateData.appointment);
            if (!appointmentExists) {
                return res.status(404).json({ message: "Appointment not found" });
            }
        }

        const checkInOutRecord = await CheckInOut.findByIdAndUpdate(
            id,
            updateData,
            { 
                new: true, 
                runValidators: true 
            }
        ).populate('appointment');

        if (!checkInOutRecord) {
            return res.status(404).json({ message: "Check-in/out record not found" });
        }

        res.status(200).json({
            message: "Check-in/out record updated successfully",
            checkInOutRecord
        });

    } catch (error) {
        console.error("Error updating check-in/out record:", error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({ message: "Validation error", errors });
        }
        
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete check-in/out record
const deleteCheckInOutRecord = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid check-in record ID format" });
        }

        const checkInOutRecord = await CheckInOut.findByIdAndDelete(id);

        if (!checkInOutRecord) {
            return res.status(404).json({ message: "Check-in/out record not found" });
        }

        res.status(200).json({
            message: "Check-in/out record deleted successfully",
            checkInOutRecord
        });

    } catch (error) {
        console.error("Error deleting check-in/out record:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.checkInPet = checkInPet;
exports.checkOutPet = checkOutPet;
exports.getAllCheckInOutRecords = getAllCheckInOutRecords;
exports.getRecordsByAppointment = getRecordsByAppointment;
exports.getCurrentCheckedInPets = getCurrentCheckedInPets;
exports.getCheckInOutById = getCheckInOutById;
exports.updateCheckInOutRecord = updateCheckInOutRecord;
exports.deleteCheckInOutRecord = deleteCheckInOutRecord;

