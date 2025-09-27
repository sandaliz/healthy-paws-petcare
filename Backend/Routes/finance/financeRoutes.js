// routes/financeRoutes.js
import express from "express";
const router = express.Router();

import {
  createInvoice,
  getInvoiceList,
  getInvoiceById,
  getInvoiceByBusinessId,
  updateInvoice,
  deleteInvoice
} from "../../Controllers/finance/invoiceController.js";

import {
  processOfflinePayment,
  confirmOfflinePayment,
  createStripePayment,
  confirmStripePayment,
  getAllPayments
} from "../../Controllers/finance/paymentController.js";

import {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  claimCoupon,
  getUserAvailableCoupons,
  validateUserCoupon
} from "../../Controllers/finance/couponController.js";

import {
  createSalary,
  getSalaries,
  updateSalary,
  deleteSalary
} from "../../Controllers/finance/salaryController.js";

import {
  getUserLoyalty,
  addLoyaltyPoints,
  updateLoyaltyTier,
  deleteLoyalty
} from "../../Controllers/finance/loyaltyController.js";

import { getFinancialManagerDashboard } from "../../Controllers/finance/dashboardController.js";
import {
  createRefundRequest,
  getAllRefundRequests,
  approveRefund,
  rejectRefund
} from "../../Controllers/finance/refundController.js";

import {
  createInvoiceFromCart,
  createInvoiceFromAppointment,
} from "../../Controllers/finance/financeLinkController.js";

// ========== INVOICES ==========
router.post("/invoice", createInvoice);
router.get("/invoices", getInvoiceList);
router.get("/invoice/:id", getInvoiceById);
router.get("/invoice/by-no/:no", getInvoiceByBusinessId);
router.put("/invoice/:id", updateInvoice);
router.delete("/invoice/:id", deleteInvoice);

// ========== PAYMENTS ==========
router.post("/payment/offline", processOfflinePayment);
router.put("/payment/offline/confirm/:id", confirmOfflinePayment);
router.post("/payment/stripe", createStripePayment);
router.post("/payment/stripe/confirm", confirmStripePayment);
router.get("/payments", getAllPayments);

// ========== COUPONS ==========
router.post("/coupon", createCoupon);
router.get("/coupons", getCoupons);
router.put("/coupon/:id", updateCoupon);
router.delete("/coupon/:id", deleteCoupon);
router.post("/coupon/validate", validateCoupon);
router.post("/coupon/claim", claimCoupon);
router.get("/coupon/user-available", getUserAvailableCoupons);
router.post("/coupon/validate-user", validateUserCoupon);

// ========== SALARY ==========
router.post("/salary", createSalary);
router.get("/salaries", getSalaries);
router.put("/salary/:id", updateSalary);
router.delete("/salary/:id", deleteSalary);

// ========== LOYALTY ==========
router.get("/loyalty/:userID", getUserLoyalty);    // Pet owner fetch loyalty
router.post("/loyalty/add-points", addLoyaltyPoints); // Add points (auto after payment)
router.put("/loyalty/update-tier/:id", updateLoyaltyTier); // Admin override if needed
router.delete("/loyalty/:id", deleteLoyalty);

// ========== REFUNDS ==========
router.post("/refund", createRefundRequest);
router.get("/refunds", getAllRefundRequests);
router.put("/refund/approve/:id", approveRefund);
router.put("/refund/reject/:id", rejectRefund);

// ========== FINANCE LINKS ==========
router.post("/invoice/cart", createInvoiceFromCart);
router.post("/invoice/appointment", createInvoiceFromAppointment);

// ========== DASHBOARD ==========
router.get("/financial-dashboard", getFinancialManagerDashboard);

export default router;

// // routes/financeRoutes.js
// import express from "express";
// const router = express.Router();

// import {
//   createInvoice,
//   getInvoiceList,
//   getInvoiceById,
//   getInvoiceByBusinessId,
//   updateInvoice,
//   deleteInvoice
// } from "../../Controllers/finance/invoiceController.js";

// import {
//   processOfflinePayment,
//   confirmOfflinePayment,
//   createStripePayment,
//   confirmStripePayment,
//   getAllPayments
// } from "../../Controllers/finance/paymentController.js";

// import {
//   createCoupon,
//   getCoupons,
//   updateCoupon,
//   deleteCoupon,
//   validateCoupon,
//   claimCoupon,
//   getUserAvailableCoupons,
//   validateUserCoupon
// } from "../../Controllers/finance/couponController.js";

// import {
//   createSalary,
//   getSalaries,
//   updateSalary,
//   deleteSalary
// } from "../../Controllers/finance/salaryController.js";

// import {
//   getAllLoyalty,
//   addLoyaltyPoints,
//   updateLoyaltyTier,
//   deleteLoyalty
// } from "../../Controllers/finance/loyaltyController.js";

// import { getFinancialManagerDashboard } from "../../Controllers/finance/dashboardController.js";

// import {
//   createRefundRequest,
//   getAllRefundRequests,
//   approveRefund,
//   rejectRefund
// } from "../../Controllers/finance/refundController.js";

// import {
//   createInvoiceFromCart,
//   createInvoiceFromAppointment,
// } from "../../Controllers/finance/financeLinkController.js";

// import requireRole from "../../middleware/finance/auth.js";
// import validate from "../../middleware/finance/validate.js";
// import { body } from "express-validator";

// // ----- Invoice Routes -----
// router.post(
//   "/invoice",
//   requireRole("Billing", "Admin"),
//   [
//     body("userID").isMongoId(),
//     body("lineItems").isArray({ min: 1 }),
//     body("lineItems.*.description").isString().trim().notEmpty(),
//     body("lineItems.*.quantity").isFloat({ gt: 0 }),
//     body("lineItems.*.unitPrice").isFloat({ gte: 0 }),
//   ],
//   validate,
//   createInvoice
// );
// router.get("/invoices", getInvoiceList);
// router.get("/invoice/:id", getInvoiceById);
// router.get("/invoice/by-no/:no", getInvoiceByBusinessId);
// router.put("/invoice/:id", requireRole("Billing", "Admin"), updateInvoice);
// router.delete("/invoice/:id", requireRole("Billing", "Admin"), deleteInvoice);

// // ----- Payment Routes -----
// router.post(
//   "/payment/offline",
//   requireRole("Owner", "Billing", "Admin", "Receptionist"),
//   [
//     body("invoiceID").isMongoId(),
//     body("userID").isMongoId(),
//     body("method").isIn(["Cash", "Card", "BankTransfer"]),
//     body("couponId").optional().isMongoId(),
//     body("couponCode").optional().isString(),
//   ],
//   validate,
//   processOfflinePayment
// );
// router.put("/payment/offline/confirm/:id", requireRole("Billing", "Admin"), confirmOfflinePayment);

// router.post(
//   "/payment/stripe",
//   requireRole("Owner", "Billing", "Admin", "Receptionist"),
//   [
//     body("invoiceID").isMongoId(),
//     body("userID").isMongoId(),
//     body("couponId").optional().isMongoId(),
//     body("couponCode").optional().isString(),
//     body("currency").optional().isString(),
//   ],
//   validate,
//   createStripePayment
// );
// router.post(
//   "/payment/stripe/confirm",
//   requireRole("Owner", "Billing", "Admin", "Receptionist"),
//   [body("paymentIntentId").isString().notEmpty(), body("email").optional().isEmail()],
//   validate,
//   confirmStripePayment
// );
// router.get("/payments", getAllPayments);

// // ----- Coupon Routes -----
// router.post(
//   "/coupon",
//   requireRole("Billing", "Admin"),
//   [
//     body("code").isString().trim().notEmpty(),
//     body("discountType").isIn(["Percentage", "Fixed"]),
//     body("discountValue").isFloat({ gt: 0 }),
//     body("minInvoiceAmount").optional().isFloat({ gte: 0 }),
//     body("usageLimit").optional().isInt({ min: 0 }),
//     body("expiryDate").isISO8601().toDate(),
//     body("description").optional().isString(),
//   ],
//   validate,
//   createCoupon
// );
// router.get("/coupons", getCoupons);
// router.put("/coupon/:id", requireRole("Billing", "Admin"), updateCoupon);
// router.delete("/coupon/:id", requireRole("Billing", "Admin"), deleteCoupon);
// router.post("/coupon/validate", validateCoupon);
// router.post("/coupon/claim", requireRole("Owner", "Billing", "Admin", "Receptionist"), claimCoupon);
// router.get("/coupon/user-available", getUserAvailableCoupons);
// router.post("/coupon/validate-user", validateUserCoupon);

// // ----- Salary Routes -----
// router.post("/salary", requireRole("Billing", "Admin", "HR"), createSalary);
// router.get("/salaries", requireRole("Billing", "Admin", "HR"), getSalaries);
// router.put("/salary/:id", requireRole("Billing", "Admin", "HR"), updateSalary);
// router.delete("/salary/:id", requireRole("Billing", "Admin", "HR"), deleteSalary);

// // ----- Loyalty Routes -----
// router.get("/loyalty/:userID", getUserLoyalty);
// router.post("/loyalty/add-points", addLoyaltyPoints);
// router.put("/loyalty/update-tier/:id", requireRole("Billing", "Admin"), updateLoyaltyTier);
// router.delete("/loyalty/:id", requireRole("Billing", "Admin"), deleteLoyalty);

// // ----- Refund Routes -----
// router.post(
//   "/refund",
//   requireRole("Owner", "Billing", "Admin", "Receptionist"),
//   [
//     body("paymentID").notEmpty(),
//     body("userID").isMongoId(),
//     body("reason").isString().trim().notEmpty(),
//     body("amount").optional().isFloat({ gt: 0 }),
//   ],
//   validate,
//   createRefundRequest
// );
// router.get("/refunds", requireRole("Billing", "Admin", "Receptionist", "Owner"), getAllRefundRequests);
// router.put("/refund/approve/:id", requireRole("Billing", "Admin"), approveRefund);
// router.put("/refund/reject/:id", requireRole("Billing", "Admin"), rejectRefund);

// // POST → from Cart checkout
// router.post("/invoice/cart", createInvoiceFromCart);

// // POST → from Appointment booking
// router.post("/invoice/appointment", createInvoiceFromAppointment);

// // ----- Dashboard -----
// router.get("/financial-dashboard", requireRole("Billing", "Admin"), getFinancialManagerDashboard);

// export default router;
