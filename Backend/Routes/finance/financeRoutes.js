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
  deleteLoyalty,
  getAllLoyalty
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
  createInvoiceFromDaycare,
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
router.get("/loyalty", getAllLoyalty);

// ========== REFUNDS ==========
router.post("/refund", createRefundRequest);
router.get("/refunds", getAllRefundRequests);
router.put("/refund/approve/:id", approveRefund);
router.put("/refund/reject/:id", rejectRefund);

// ========== FINANCE LINKS ==========
router.post("/invoice/cart", createInvoiceFromCart);
router.post("/invoice/appointment", createInvoiceFromAppointment);
router.post("/invoice/daycare", createInvoiceFromDaycare);

// ========== DASHBOARD ==========
router.get("/financial-dashboard", getFinancialManagerDashboard);

export default router;

