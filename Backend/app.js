//azwOuFMBmc34fmEY
const express = require("express");
const mongoose = require("mongoose");
const router = require("./Routes/CareRoutes");
const reviewRouter = require("./Routes/ReviewsRoutes");
const dailyLogsRouter = require("./Routes/DailyLogsRoutes");
const checkInOutRouter = require("./Routes/CheckInOutRoutes"); 


const app = express();
const cors = require("cors");

//middleware 
app.use(express.json());
app.use(cors());
app.use("/careCustomers", router);
app.use("/reviews", reviewRouter);
app.use("/dailyLogs", dailyLogsRouter);
app.use("/checkinout", checkInOutRouter);


mongoose.connect("mongodb+srv://admin:azwOuFMBmc34fmEY@cluster0.4s8zmoj.mongodb.net/")
.then(()=> console.log("connected to MongoDB"))
.then(() => {
    app.listen(5000);
})
.catch((err) => console.log((err)));