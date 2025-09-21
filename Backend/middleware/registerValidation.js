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
    // ✅ Foreign key validation for User reference
    body("userId")
      .isMongoId()
      .withMessage("Valid userId is required"),

    body("OwnerName")
      .notEmpty()
      .withMessage("Owner name is required")
      .isLength({ max: 50 }),

    body("OwnerEmail")
      .isEmail()
      .withMessage("Valid email required")
      .normalizeEmail(emailNormalizeOptions),

    body("OwnerPhone")
      .notEmpty()
      .withMessage("Phone required"),

    body("EmergencyContact")
      .notEmpty()
      .withMessage("Emergency contact required"),

    body("OwnerAddress")
      .notEmpty()
      .withMessage("Address required"),

    body("PetName")
      .notEmpty()
      .withMessage("Pet name is required"),

    body("PetSpecies")
      .isIn(["cat", "dog"])
      .withMessage("Species must be cat or dog"),

    body("PetBreed")
      .notEmpty()
      .withMessage("Pet breed required"),

    body("PetAge")
      .isInt({ min: 0 })
      .withMessage("Age must be a positive number"),

    body("PetWeight")
      .isFloat({ min: 0 })
      .withMessage("Weight must be positive"),

    body("BloodGroup")
      .isIn(["O", "O+", "B+"])
      .withMessage("Invalid blood group"),

    body("PetGender")
      .isIn(["Male", "Female"])
      .withMessage("Invalid gender"),
  ];
};

export const validateRegister = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const extractedErrors = errors.array().map((err) => ({
    [err.param]: err.msg,
  }));

  return res.status(422).json({ errors: extractedErrors });
};