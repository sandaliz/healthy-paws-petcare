import React, {useState, useEffect} from 'react';
import axios from 'axios';

const URL ="http://localhost:5000/users";

const fetchHandler = async () =>{
    return await axios.get(URL).then((res) => res.data);
}

function appointmentDC() {

    const [careCustomers, setcareCustomers] = useState();
    useEffect(() => {
        fetchHandler().then((data) => setcareCustomers(data.careCustomers));
    },[])

  return (
    <div>appointmentDC</div>
  )
}

export default appointmentDC