const CareCustomer = require("../Model/CareModel");

//Data Display
const getAllDetails = async (req, res, next) => {

    let careCustomers;
    //Get all Care Customers
    try{
        careCustomers = await CareCustomer.find();
    }catch (err) {
        console.log(err);
    }
    // not found
    if(!careCustomers) {
        return res.status(404).json({message:"Details not found"});
    }

    //Display all careCutomers
    return res.status(200).json({ careCustomers });
};

// Data Insert

 const addDetails = async (req, res, next) => {

     const{
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
        agree} = req.body;

    let careCustomers;

    try{
        careCustomers = new CareCustomer({ownerName,
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
        agree});
        await careCustomers.save();
    }catch (err) {
        console.log(err);
    }
    //not insert details
    if(!careCustomers){
        return res.status(404).json({ message: "unable to add details"});
    }
    return res.status(200).json({ careCustomers });

};

//get by Id
const getById = async (req, res, next) => {
    const id = req.params.id;
    
    let careCustomers;

    try{
        careCustomers = await CareCustomer.findById(id);
        }catch (err) {
            console.log(err);
    }

     //not available users
    if(!careCustomers){
        return res.status(404).json({ message: "unable to add details"});
    }
    return res.status(200).json({ careCustomers });

};

//update user details
const updateUser = async (req, res, next) => {
    
    const id = req.params.id;
    const{
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
        agree} = req.body;

    let careCustomers;
    
    try{
        careCustomers = await CareCustomer.findByIdAndUpdate(id, {ownerName: ownerName,
         contactNumber: contactNumber,
         email: email,
         alternateContact: alternateContact,
         petName: petName,
        species: species,
        breed: breed,
        age: age,
        gender: gender,
        healthDetails: healthDetails,
        nightsStay: nightsStay,
        dropOffTime: dropOffTime,
        pickUpTime: pickUpTime,
        foodType: foodType,
        feedingTimes: feedingTimes,
        grooming: grooming,
        walking : walking,
        emergencyAction : emergencyAction,
        agree: agree});
        careCustomers = await careCustomers.save();
    }catch(err){
        console.log(err);
    }

    if(!careCustomers){
        return res.status(404).json({ message: "unable to update user details"});
    }
    return res.status(200).json({ careCustomers });

};

//delete user details
const deleteUser = async (req, res) => {
    const id = req.params.id;

    let careCustomer;

    try{
        careCustomer = await CareCustomer.findByIdAndDelete(id);
    }catch (err){
        console.log(err);
    }

    if(!careCustomer){
        return res.status(404).json({ message: "unable to delete user details"});
    }
    return res.status(200).json({ careCustomer });
}

exports.getAllDetails = getAllDetails;
exports.addDetails = addDetails;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;