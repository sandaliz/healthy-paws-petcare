// Controllers/AnalyticsController.js
import CareCustomer from "../Model/CareModel.js";
import CheckInOut from "../Model/CheckInOutModel.js";
import Reviews from "../Model/ReviewsModel.js";

export const getAnalytics = async (req, res) => {
  try {
    // ------------------ Reviews ------------------
    const reviews = await Reviews.find({});
    const reviewCounts = {
      good: reviews.filter(r => r.sentiment === "good").length,
      neutral: reviews.filter(r => r.sentiment === "neutral").length,
      bad: reviews.filter(r => r.sentiment === "bad").length,
    };

    // ------------------ Appointments ------------------
    const appointments = await CareCustomer.find({});
    const appointmentCounts = {
      pending: appointments.filter(a => a.status === "Pending").length,
      upcoming: appointments.filter(a => a.status === "Approved").length,
      completed: appointments.filter(a => a.status === "Completed").length,
      rejected: appointments.filter(a => a.status === "Rejected").length,
      cancelled: appointments.filter(a => a.status === "Cancelled").length,
    };

    // ------------------ Services Breakdown ------------------
    const completedAppointments = appointments.filter(a => a.status === "Completed");
    const servicesCounts = {
      grooming: completedAppointments.filter(a => a.grooming && !a.walking).length,
      walking: completedAppointments.filter(a => a.walking && !a.grooming).length,
      both: completedAppointments.filter(a => a.grooming && a.walking).length,
      none: completedAppointments.filter(a => !a.grooming && !a.walking).length,
    };

    // ------------------ Daycare Usage (last 7 days) ------------------
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return d.toISOString().split("T")[0]; // yyyy-mm-dd
    }).reverse();

    const checkIns = await CheckInOut.find({});
    const daycareUsage = last7Days.map(dateStr => {
      const count = checkIns.filter(c => {
        const checkInDate = c.checkInTime.toISOString().split("T")[0];
        return checkInDate === dateStr;
      }).length;

      return { date: dateStr, count };
    });

    // ------------------ Send Combined Payload ------------------
    res.json({
      reviews: reviewCounts,
      appointments: appointmentCounts,
      services: servicesCounts,
      daycareUsage,
    });

  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
  }
};
