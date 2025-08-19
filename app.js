//azwOuFMBmc34fmEY
const express = require("express");
const mongoose = require("mongoose");

const app = express();

//middleware 
app.use("/",(req, res, next) => {
    res.send("Welcome to the User API"); 
})

mongoose.connect("mongodb+srv://admin:azwOuFMBmc34fmEY@cluster0.4s8zmoj.mongodb.net/")
.then(()=> console.log("connected to MongoDB"))
.then(() => {
    app.listen(5000);
})
.catch((err) => console.log((err)));