import axios from 'axios'

const BASE_URI = 'http://localhost:4000/doctors';

class DoctorServices {

    static async getDoctors(){
        try{
            const response = await axios.get(BASE_URI);
            if(!response || response.status !== 200){
                throw new Error('Could not fetch the doctors');
            }
            return response.data;
        }catch(error){
            console.error('Error fetching doctors:', error);
            throw error;
        }
    }

}

export default DoctorServices;