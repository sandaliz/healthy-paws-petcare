import React from 'react';
import {Route,Routes} from 'react-router';
import './App.css';
import Home from './Components/Home/home';
import Daycare from './Components/Daycare/daycare';


function App() {
  return (
    <div>
      
      <React.Fragment>
        <Routes>
          <Route path = "/" element={<Home/>}/>
          <Route path = "/daycare" element={<Daycare/>}/>
          
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
