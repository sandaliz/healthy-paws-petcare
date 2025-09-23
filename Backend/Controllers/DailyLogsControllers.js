const mongoose = require("mongoose");
const DailyLog = require("../Model/DailyLogsModel");
const CareCustomer = require("../Model/CareModel");

// Create a new daily log
const createDailyLog = async (req, res) => {
    try {
        const {
            appointment,
            date,
            feeding,
            note,
            playtime,
            walking,
            grooming,
            mood,
            loggedBy
        } = req.body;

        // Validate required fields
        if (!appointment || !feeding || !loggedBy) {
            return res.status(400).json({
                message: "Appointment ID, feeding details, and loggedBy are required"
            });
        }

        // Check if appointment exists
        const existingAppointment = await CareCustomer.findById(appointment);
        if (!existingAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        const dailyLog = new DailyLog({
            appointment,
            date: date || new Date(),
            feeding,
            note,
            playtime,
            walking,
            grooming,
            mood: mood || "good",
            loggedBy
        });

        await dailyLog.save();
        
        // Populate appointment details in the response
        await dailyLog.populate('appointment');

        res.status(201).json({
            message: "Daily log created successfully",
            dailyLog
        });

    } catch (error) {
        console.error("Error creating daily log:", error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({ message: "Validation error", errors });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid appointment ID format" });
        }
        
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all daily logs
const getAllDailyLogs = async (req, res) => {
    try {
        const dailyLogs = await DailyLog.find()
            .populate('appointment')
            .sort({ date: -1, createdAt: -1 });

        res.status(200).json({
            message: "Daily logs retrieved successfully",
            count: dailyLogs.length,
            dailyLogs
        });

    } catch (error) {
        console.error("Error fetching daily logs:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get daily logs by appointment ID
const getLogsByAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        // Validate appointment ID format
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: "Invalid appointment ID format" });
        }

        const dailyLogs = await DailyLog.find({ appointment: appointmentId })
            .populate('appointment')
            .sort({ date: -1, createdAt: -1 });

        if (dailyLogs.length === 0) {
            return res.status(404).json({ 
                message: "No daily logs found for this appointment" 
            });
        }

        res.status(200).json({
            message: "Daily logs retrieved successfully",
            count: dailyLogs.length,
            dailyLogs
        });

    } catch (error) {
        console.error("Error fetching daily logs by appointment:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get daily log by ID
const getDailyLogById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid log ID format" });
        }

        const dailyLog = await DailyLog.findById(id).populate('appointment');

        if (!dailyLog) {
            return res.status(404).json({ message: "Daily log not found" });
        }

        res.status(200).json({
            message: "Daily log retrieved successfully",
            dailyLog
        });

    } catch (error) {
        console.error("Error fetching daily log:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid log ID format" });
        }
        
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update daily log
const updateDailyLog = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid log ID format" });
        }

        // Check if log exists
        const existingLog = await DailyLog.findById(id);
        if (!existingLog) {
            return res.status(404).json({ message: "Daily log not found" });
        }

        // If appointment is being updated, validate it exists
        if (updateData.appointment) {
            const appointmentExists = await CareCustomer.findById(updateData.appointment);
            if (!appointmentExists) {
                return res.status(404).json({ message: "Appointment not found" });
            }
        }

        const dailyLog = await DailyLog.findByIdAndUpdate(
            id,
            updateData,
            { 
                new: true, 
                runValidators: true 
            }
        ).populate('appointment');

        res.status(200).json({
            message: "Daily log updated successfully",
            dailyLog
        });

    } catch (error) {
        console.error("Error updating daily log:", error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({ message: "Validation error", errors });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete daily log
const deleteDailyLog = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid log ID format" });
        }

        const dailyLog = await DailyLog.findByIdAndDelete(id);

        if (!dailyLog) {
            return res.status(404).json({ message: "Daily log not found" });
        }

        res.status(200).json({
            message: "Daily log deleted successfully",
            dailyLog
        });

    } catch (error) {
        console.error("Error deleting daily log:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid log ID format" });
        }
        
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get daily logs by date range
const getLogsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ 
                message: "Start date and end date are required" 
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include entire end date

        const dailyLogs = await DailyLog.find({
            date: {
                $gte: start,
                $lte: end
            }
        })
        .populate('appointment')
        .sort({ date: -1, createdAt: -1 });

        res.status(200).json({
            message: "Daily logs retrieved successfully",
            count: dailyLogs.length,
            dailyLogs
        });

    } catch (error) {
        console.error("Error fetching daily logs by date range:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get today's logs
const getTodaysLogs = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dailyLogs = await DailyLog.find({
            date: {
                $gte: today,
                $lt: tomorrow
            }
        })
        .populate('appointment')
        .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Today's daily logs retrieved successfully",
            count: dailyLogs.length,
            dailyLogs
        });

    } catch (error) {
        console.error("Error fetching today's daily logs:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.createDailyLog = createDailyLog;
exports.getAllDailyLogs = getAllDailyLogs;
exports.getLogsByAppointment = getLogsByAppointment;
exports.getDailyLogById = getDailyLogById;
exports.updateDailyLog = updateDailyLog;
exports.deleteDailyLog = deleteDailyLog;
exports.getLogsByDateRange = getLogsByDateRange;
exports.getTodaysLogs = getTodaysLogs;