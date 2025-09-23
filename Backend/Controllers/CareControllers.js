const CareCustomer = require("../Model/CareModel");

// Data Display - FIXED with proper error handling
const getAllDetails = async (req, res, next) => {
    try {
        const careCustomers = await CareCustomer.find().sort({ createdAt: -1 });
        if (!careCustomers || careCustomers.length === 0) {
            return res.status(404).json({ message: "No appointments found" });
        }
        return res.status(200).json({ careCustomers });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Data Insert - FIXED
const addDetails = async (req, res, next) => {
    try {
        const {
            ownerName, contactNumber, email, petName, species, healthDetails,
            dateStay, pickUpDate, nightsStay, dropOffTime, pickUpTime,
            foodType, feedingTimes, grooming, walking, emergencyAction, agree
        } = req.body;

        // Set default status if not provided
        const status = req.body.status || "Pending";

        const careCustomer = new CareCustomer({
            ownerName, contactNumber, email, petName, species, healthDetails,
            dateStay, pickUpDate, nightsStay, dropOffTime, pickUpTime,
            foodType, feedingTimes, grooming, walking, emergencyAction,
            status, agree
        });

        await careCustomer.save();
        return res.status(201).json({ 
            message: "Appointment created successfully", 
            careCustomer 
        });
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation error", error: err.message });
        }
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get by Id - FIXED
const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const careCustomer = await CareCustomer.findById(id);
        
        if (!careCustomer) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        
        return res.status(200).json({ careCustomer });
    } catch (err) {
        console.error(err);
        if (err.name === 'CastError') {
            return res.status(400).json({ message: "Invalid appointment ID" });
        }
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Update user details - FIXED
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Use { new: true } to return the updated document
        const careCustomer = await CareCustomer.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true } // ✅ Fixed: added options
        );

        if (!careCustomer) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        return res.status(200).json({ 
            message: "Appointment updated successfully", 
            careCustomer 
        });
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation error", error: err.message });
        }
        if (err.name === 'CastError') {
            return res.status(400).json({ message: "Invalid appointment ID" });
        }
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Delete user details - FIXED
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const careCustomer = await CareCustomer.findByIdAndDelete(id);
        
        if (!careCustomer) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        
        return res.status(200).json({ 
            message: "Appointment deleted successfully", 
            careCustomer 
        });
    } catch (err) {
        console.error(err);
        if (err.name === 'CastError') {
            return res.status(400).json({ message: "Invalid appointment ID" });
        }
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ✅ ADD THESE NEW FUNCTIONS FOR STATUS MANAGEMENT:

// Update appointment status
const updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["Pending", "Approved", "Rejected", "Checked-In", "Completed", "Cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const careCustomer = await CareCustomer.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true, runValidators: true }
        );

        if (!careCustomer) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        return res.status(200).json({ 
            message: `Status updated to ${status}`, 
            careCustomer 
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get appointments by status
const getByStatus = async (req, res, next) => {
    try {
        const { status } = req.params;
        const careCustomers = await CareCustomer.find({ status }).sort({ createdAt: -1 });
        
        if (!careCustomers || careCustomers.length === 0) {
            return res.status(404).json({ message: `No ${status} appointments found` });
        }
        
        return res.status(200).json({ careCustomers });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getAllDetails = getAllDetails;
exports.addDetails = addDetails;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.updateStatus = updateStatus; 
exports.getByStatus = getByStatus;   