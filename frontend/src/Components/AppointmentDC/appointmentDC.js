import React from 'react';

function AppointmentDC(props) {
  const {
    _id,
    ownerName,
    contactNumber,
    email,
    alternateContact,
    petName,
    species,
    breed,
    age,
    gender,
    healthDetails,
    nightsStay,
    dropOffTime,
    pickUpTime,
    foodType,
    feedingTimes,
    grooming,
    walking,
    emergencyAction,
    agree
  } = props.user;

  return (
    <div>
      <h2>Appointment Details</h2>
      <div>ID: {_id}</div>
      <div>Owner Name: {ownerName}</div>
      <div>Contact Number: {contactNumber}</div>
      <div>Email: {email}</div>
      <div>Alternate Contact: {alternateContact}</div>
      <div>Pet Name: {petName}</div>
      <div>Species: {species}</div>
      <div>Breed: {breed}</div>
      <div>Age: {age}</div>
      <div>Gender: {gender}</div>
      <div>Health Details: {healthDetails}</div>
      <div>Nights Stay: {nightsStay}</div>
      <div>Drop Off Time: {dropOffTime}</div>
      <div>Pick Up Time: {pickUpTime}</div>
      <div>Food Type: {foodType}</div>
      <div>Feeding Times: {feedingTimes}</div>
      <div>Grooming: {grooming ? 'Yes' : 'No'}</div>
      <div>Walking: {walking ? 'Yes' : 'No'}</div>
      <div>Emergency Action: {emergencyAction}</div>
      <div>Agree: {agree ? 'Yes' : 'No'}</div>
    </div>
  );
}

export default AppointmentDC;