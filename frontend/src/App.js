import React from 'react';
import {Route,Routes} from 'react-router';
import './App.css';
import Home from './Components/Home/home';
import Daycare from './Components/Daycare/daycare';
import AppointmentDCs from './Components/AppointmentDCs/AppointmentDCs'
import AddAppointmentDC from './Components/AddAppointmentDC/AddAppointmentDC';


function App() {
  return (
    <div>
      
      <React.Fragment>
        <Routes>
          <Route path = "/" element={<Home/>}/>
          <Route path = "/daycare" element={<Daycare/>}/>
          <Route path = "/appointmentDC" element={<AppointmentDCs/>}/>
          <Route path = "/addappointmentDC" element={<AddAppointmentDC/>}/>
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
