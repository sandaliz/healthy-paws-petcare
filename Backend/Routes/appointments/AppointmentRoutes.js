const express = require('express');
const router = express.Router();
const { 
    getAllAppointments, 
    getAppointmentById,
    getAppointmentByStatus, 
    createAppointment, 
    deleteAppointment, 
    updateAppointment,
    getAppointmentByUsername } = require('../../Controllers/Appointment/AppointmentController');


//get all appointments
router.get('/', getAllAppointments);

//get appointment by id
router.get('/:id', getAppointmentById);

//get appointment by id
router.get('/status/:status', getAppointmentByStatus);

//get appointment by user name
router.get('/user/:user', getAppointmentByUsername);

//create new appointment
router.post('/', createAppointment);

//delete appointment by id
router.delete('/:id', deleteAppointment);

//update appointment by id
router.patch('/:id', updateAppointment);

module.exports = router;