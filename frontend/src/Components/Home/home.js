import React from 'react'
import {Link} from 'react-router-dom';

function home() {
  return (
    <div>
      <h1>Welcome to Pet Care</h1>
        <p>Your one-stop solution for all pet care needs.</p>
        <h2>Balla</h2>
        <h3>LOL</h3>
        <Link to = "/daycare" className = "active daycare">
        <h2>Daycare</h2>
        </Link>
        <Link to = "/dashboardDC" className = "active daycare">
        <h2>Daycare</h2>
        </Link>
    </div>
  )
}

export default home
