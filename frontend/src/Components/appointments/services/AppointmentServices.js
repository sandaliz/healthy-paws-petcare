import axios from 'axios';

const BASE_URI = 'http://localhost:4000/appointments'

class AppointmentServices{

    static async createAppointment(appointmentData){
        try{
            const response = await axios.post(BASE_URI, appointmentData);
            return response.data;
        }catch(error){
            console.error('failed to create appointment', error);
            throw error;
        }
    }

    static async getAppointment(){
        try {
            const response = await axios.get(BASE_URI);
            return response.data;
        } catch (error) {
            console.error('Error fetching appointment by status:', error);
            throw error;
        }
    }

    static async getUserAppointments(username){
        try {
            const response = await axios.get(`${BASE_URI}/user/${username}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user appointments:', error);
            throw error;
        }
    }

    static async deleteAppointment(appointmentId){
        try {
            const response = await axios.delete(`${BASE_URI}/${appointmentId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    }

}

export default AppointmentServices;