require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./Routes/productRoutes")
const prescriptionRoutes = require("./Routes/prescriptionRoutes");
const emailController = require("./Controllers/emailController");
const checkoutRoutes = require("./Routes/checkoutRoutes");


const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());


//middleware 
app.use(express.json());
app.use(cors());
app.use("/products",router);
app.use("/prescriptions", prescriptionRoutes);
app.post("/send-prescription", emailController.sendPrescriptionEmail);
app.use("/checkout", checkoutRoutes);




// DB
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/itp_project";
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch((err) => {
    console.error("Mongo connection error", err);
    process.exit(1);
  });