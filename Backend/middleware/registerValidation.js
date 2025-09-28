// middleware/registerValidation.js
import { body, validationResult } from "express-validator";

const emailNormalizeOptions = {
  all_lowercase: true,
  gmail_remove_dots: false,
  gmail_remove_subaddress: false,
  gmail_convert_googlemaildotcom: false,
  outlookdotcom_remove_subaddress: false,
  yahoo_remove_subaddress: false,
  icloud_remove_subaddress: false,
};

export const registerValidationRules = () => {
  return [
    body("userId")
      .isMongoId()
      .withMessage("Valid userId (Mongo ObjectId) is required"),

    body("OwnerName")
      .notEmpty()
      .withMessage("Owner name is required")
      .isLength({ max: 50 })
      .withMessage("Owner name must be ≤ 50 characters"),

    // ✅ Modern email regex
    body("OwnerEmail")
      .matches(/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/)
      .withMessage("Please enter a valid email address")
      .normalizeEmail(emailNormalizeOptions),

    // ✅ Phones: exactly 10 digits
    body("OwnerPhone")
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be exactly 10 digits"),

    body("EmergencyContact")
      .matches(/^\d{10}$/)
      .withMessage("Emergency contact must be exactly 10 digits"),

    body("OwnerAddress")
      .notEmpty()
      .withMessage("Owner address is required"),

    // ✅ Pet fields
    body("PetName").notEmpty().withMessage("Pet name is required"),

    body("PetSpecies")
      .isIn(["cat", "dog"])
      .withMessage("PetSpecies must be 'cat' or 'dog'"),

    body("PetBreed").notEmpty().withMessage("Pet breed is required"),

    body("PetAge")
      .isInt({ min: 0 })
      .withMessage("PetAge must be a valid number ≥ 0"),

    body("PetWeight")
      .isFloat({ min: 0 })
      .withMessage("PetWeight must be a valid number ≥ 0"),

    body("BloodGroup")
      .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
      .withMessage("Blood group must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-"),

    body("PetGender")
      .isIn(["Male", "Female"])
      .withMessage("Pet gender must be either 'Male' or 'Female'"),
  ];
};

export const validateRegister = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const extractedErrors = {};
  errors.array().forEach((err) => {
    extractedErrors[err.param] = err.msg;
  });

  return res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: extractedErrors,
  });
};