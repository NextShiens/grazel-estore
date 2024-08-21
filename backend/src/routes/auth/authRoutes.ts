import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../../controllers/auth/AuthController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { parsing } from "../../config/parseMulter";

const multer = require("multer");
const router = Router();
const authController = new AuthController();

// Set up storage configuration
const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    // Set the destination directory for file uploads
    cb(null, "bucket/store");
  },
  filename: function (req: any, file: any, cb: any) {
    // Set the filename for uploaded files
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Set up file filter
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and PDF files are allowed."
      ),
      false
    );
  }
};

// Set up multer with storage and file filter
const storeImageUploader = multer({
  storage: storage,
  fileFilter: fileFilter,
}).fields([
  { name: "store_image", maxCount: 1 },
  { name: "business_license", maxCount: 1 },
  { name: "tax_id", maxCount: 1 },
  { name: "proof_of_address", maxCount: 1 },
]);

router.post(
  "/register",
  parsing,
  [
    body("username").notEmpty().withMessage("The username field is required"),
    body("email").isEmail().withMessage("The email field is required"),
    body("password")
      .notEmpty()
      .withMessage("The password field is required")
      .isLength({ min: 8 })
      .withMessage("The password must be at least 8 characters long"),
    body("phone").notEmpty().withMessage("The phone field is required"),
    body("role").notEmpty().withMessage("The role field is required"),
  ],
  authController.register
);

router.post(
  "/register-seller",
  storeImageUploader,
  [
    body("username").notEmpty().withMessage("The username field is required"),
    body("email").isEmail().withMessage("The email field is required"),
    body("password")
      .notEmpty()
      .withMessage("The password field is required")
      .isLength({ min: 8 })
      .withMessage("The password must be at least 8 characters long"),
    body("phone").notEmpty().withMessage("The phone field is required"),
    body("city").notEmpty().withMessage("The city field is required"),
    body("state").notEmpty().withMessage("The state field is required"),
    body("pin_code").notEmpty().withMessage("The pin_code field is required"),
    body("store_about")
      .notEmpty()
      .withMessage("The store_about field is required"),
    body("store_name")
      .notEmpty()
      .withMessage("The store_name field is required"),
    body("gst").notEmpty().withMessage("The gst field is required"),
    body("pan").notEmpty().withMessage("The pan field is required"),
    body("store_description")
      .notEmpty()
      .withMessage("The store_description field is required"),

    body("account_name")
      .notEmpty()
      .withMessage("The account_name field is required"),
    body("account_number")
      .notEmpty()
      .withMessage("The account_number field is required"),
    body("bank_code").notEmpty().withMessage("The bank_code field is required"),
    body("bank_name").notEmpty().withMessage("The bank_name field is required"),
  ],
  authController.registerSeller
);

router.post(
  "/login",
  parsing,
  [
    body("email").isEmail().withMessage("The email field is required"),
    body("password").notEmpty().withMessage("The password field is required"),
  ],
  authController.login
);

router.post(
  "/forgot-password",
  parsing,
  [body("email").isEmail().withMessage("The email field is required")],
  authController.forgotPassword
);

router.post(
  "/reset-password",
  parsing,
  [
    body("new_password")
      .notEmpty()
      .withMessage("The new password field is required")
      .isLength({ min: 8 })
      .withMessage("The new password must be at least 8 characters long"),
  ],
  authController.resetPassword
);

router.post("/logout", authMiddleware, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully!",
  });
});

export default router;
