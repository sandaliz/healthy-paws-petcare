let hasRun = false;

const REQUIRED_ENV = [
  {
    key: "STRIPE_SECRET",
    message: "Stripe refunds will fail without STRIPE_SECRET. Set it in your environment or .env file.",
  },
  {
    key: "FM_EMAIL_USER",
    message: "Refund/Payment emails need FM_EMAIL_USER (sender address).",
  },
  {
    key: "FM_EMAIL_PASS",
    message: "Refund/Payment emails need FM_EMAIL_PASS (app password).",
  },
];

const RECOMMENDED_ENV = [
  {
    key: "REFUND_WINDOW_DAYS",
    validate: (value) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) && parsed > 0;
    },
    fallback: "7",
    message: "REFUND_WINDOW_DAYS should be a positive integer. Falling back to default of 7 days.",
  },
];

export function validateFinanceConfig() {
  if (hasRun) return;
  hasRun = true;

  const missing = [];
  REQUIRED_ENV.forEach(({ key, message }) => {
    if (!process.env[key]) {
      missing.push({ key, message });
    }
  });

  if (missing.length > 0) {
    console.error("\n❌ Finance configuration error:");
    missing.forEach(({ key, message }) => {
      console.error(`  - ${key}: ${message}`);
    });
    console.error("  Finance features may not work correctly until these values are provided.\n");
  }

  RECOMMENDED_ENV.forEach(({ key, validate, fallback, message }) => {
    const value = process.env[key];
    if (value == null || value === "") {
      process.env[key] = fallback;
      console.warn(`⚠️ ${key} not set. Using default value ${fallback}.`);
      return;
    }
    if (validate && !validate(value)) {
      process.env[key] = fallback;
      console.warn(`⚠️ ${message}`);
    }
  });
}
