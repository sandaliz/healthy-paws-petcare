//azwOuFMBmc34fmEY
const express = require("express");
const mongoose = require("mongoose");
const router = require("./Routes/productRoutes")
const prescriptionRoutes = require("./Routes/prescriptionRoutes");
const emailController = require("./Controllers/emailController");

const app = express();
const cors = require("cors");

//middleware 
app.use(express.json());
app.use(cors());
app.use("/products",router);
app.use("/prescriptions", prescriptionRoutes);
app.post("/send-prescription", emailController.sendPrescriptionEmail);




mongoose.connect("mongodb+srv://admin:azwOuFMBmc34fmEY@cluster0.4s8zmoj.mongodb.net/")
.then(()=> console.log("connected to MongoDB"))
.then(() => {
    app.listen(5000);
})
.catch((err) => console.log((err)));