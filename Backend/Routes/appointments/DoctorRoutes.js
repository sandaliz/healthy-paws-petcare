const express = require('express');
const router = express.Router();

const { 
    getAllDoctors, 
    getDoctorById, 
    createNewDoctor, 
    deleteDoctorById, 
    updateDoctorById } = require('../../Controllers/Docotor/DoctorController');


//get all doctors...
router.get('/', getAllDoctors);

//get doctor by id
router.get('/:id', getDoctorById);

//create new doctor
router.post('/', createNewDoctor);

//delete doctor by id
router.delete('/:id', deleteDoctorById);

//update doctor by id
router.patch('/:id', updateDoctorById);

module.exports = router;

