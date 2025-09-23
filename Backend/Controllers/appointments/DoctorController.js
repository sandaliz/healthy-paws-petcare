const DoctorSchema = require('../../Models/Doctor/DoctorModel');

const getAllDoctors = async (req, res)=>{
    try {
        const doctors = await DoctorSchema.find().sort({createdAt: -1})
        res.status(200).json(doctors)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const getDoctorById = async (req, res)=>{
    try {
        const {id} = req.params
        const doctor = await DoctorSchema.findById({_id:id})
        if(!doctor){
            return res.status(404).json({message: 'Doctor not found'})
        }
        res.status(200).json(doctor)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const createNewDoctor = async (req, res)=>{
    try {
        const newDoctor = new DoctorSchema(req.body)
        await newDoctor.save()
        res.status(201).json(newDoctor)
    } catch (error) {
        res.status(500).json({message: error.message})
    }   
}

const deleteDoctorById = async (req, res)=>{
    try {
        const {id} = req.params
        const deletedDoctor = await DoctorSchema.findByIdAndDelete({_id:id})
        if(!deletedDoctor){ 
            return res.status(404).json({message: 'Doctor not found'})
        }
        res.status(200).json(deletedDoctor)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const updateDoctorById = async (req, res)=>{
    try {
        const {id} = req.params
        const updatedDoctor = await DoctorSchema.findByIdAndUpdate({_id:id},{...req.body})
        if(!updatedDoctor){
            return res.status(404).json({message: 'Doctor not found'})
        }
        res.status(200).json(updatedDoctor)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}
        


module.exports = {
    getAllDoctors,
    getDoctorById,
    createNewDoctor,
    deleteDoctorById,
    updateDoctorById
}