import User from "../../Model/userModel.js";

/**
 * Resolve the owner document for a given invoice/payment pair.
 * Ensures we always return an object with at least { name, email } when possible.
 */
export async function resolveOwnerDoc({ invoice, payment }) {
  if (invoice?.userID && typeof invoice.userID === "object" && (invoice.userID.name || invoice.userID.email)) {
    return invoice.userID;
  }

  if (payment?.userID && typeof payment.userID === "object" && (payment.userID.name || payment.userID.email)) {
    return payment.userID;
  }

  const id =
    (invoice?.userID && (invoice.userID._id || invoice.userID)) ||
    (payment?.userID && (payment.userID._id || payment.userID)) ||
    null;

  if (id) {
    try {
      const doc = await User.findById(id).select("name email").lean();
      if (doc) return doc;
    } catch (_) {
      // suppress lookup errors and continue
    }
  }

  return null;
}
