const express = require("express");
const router = express.Router();

const invoiceCtrl = require("../../Controllers/finance/invoiceController");
const paymentCtrl = require("../../Controllers/finance/paymentController");
const couponCtrl = require("../../Controllers/finance/couponController");
const salaryCtrl = require("../../Controllers/finance/salaryController");
const loyaltyCtrl = require("../../Controllers/finance/loyaltyController");
const dashboardCtrl = require("../../Controllers/finance/dashboardController");
const refundCtrl = require("../../Controllers/finance/refundController");

// Invoice
router.post("/invoice", invoiceCtrl.createInvoice);
router.get("/invoices", invoiceCtrl.getInvoiceList);
router.get("/invoice/:id", invoiceCtrl.getInvoiceById);
router.put("/invoice/:id", invoiceCtrl.updateInvoice);
router.delete("/invoice/:id", invoiceCtrl.deleteInvoice);

// Payment
router.post("/payment/offline", paymentCtrl.processOfflinePayment);
router.put("/payment/offline/confirm/:id", paymentCtrl.confirmOfflinePayment);
router.post("/payment/stripe", paymentCtrl.createStripePayment);
router.post("/payment/stripe/confirm", paymentCtrl.confirmStripePayment);
router.get("/payments", paymentCtrl.getAllPayments);

// Coupon
router.post("/coupon", couponCtrl.createCoupon);
router.get("/coupons", couponCtrl.getCoupons);
router.put("/coupon/:id", couponCtrl.updateCoupon);
router.delete("/coupon/:id", couponCtrl.deleteCoupon);
router.post("/coupon/validate", couponCtrl.validateCoupon); // NEW

// Salary
router.post("/salary", salaryCtrl.createSalary);
router.get("/salaries", salaryCtrl.getSalaries);
router.put("/salary/:id", salaryCtrl.updateSalary);
router.delete("/salary/:id", salaryCtrl.deleteSalary);

// Loyalty
router.get("/loyalty", loyaltyCtrl.getAllLoyalty);
router.post("/loyalty/add-points", loyaltyCtrl.addLoyaltyPoints);
router.put("/loyalty/update-tier/:id", loyaltyCtrl.updateLoyaltyTier);
router.delete("/loyalty/:id", loyaltyCtrl.deleteLoyalty);

// Refund
router.post("/refund", refundCtrl.createRefundRequest);
router.get("/refunds", refundCtrl.getAllRefundRequests);
router.put("/refund/approve/:id", refundCtrl.approveRefund);
router.put("/refund/reject/:id", refundCtrl.rejectRefund);

// Dashboard
router.get("/financial-dashboard", dashboardCtrl.getFinancialManagerDashboard);

module.exports = router;