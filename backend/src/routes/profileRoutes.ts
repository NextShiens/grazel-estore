import express from "express";
import { body } from "express-validator";
import { ProfileController } from "../controllers/ProfileController";
import { authMiddleware } from "../middleware/authMiddleware";

import { parsing } from "../config/parseMulter";
import { AuthController } from "../controllers/auth/AuthController";

const router = express.Router();
const multer = require("multer");
const profileController = new ProfileController();
const authController = new AuthController();

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
      cb(null, "bucket/user");
    },
    filename: function (req: any, file: any, cb: any) {
      cb(null, file.fieldname + "-" + Date.now() + ".jpg");
    },
  }),
}).single("image");

const changePasswordValidator = [
  body("old_password")
    .notEmpty()
    .isString()
    .withMessage("The old password field is required"),
  body("new_password")
    .notEmpty()
    .isString()
    .withMessage("The new password field is required"),
];

router.get("/", authMiddleware, profileController.getProfile);
router.put(
  "/:id/edit",
  authMiddleware,

  upload,
  profileController.editProfile
);
router.post(
  "/change-password",
  parsing,
  authMiddleware,
  changePasswordValidator,
  profileController.changePassword
);

router.post(
  "/deactivate-account",
  authMiddleware,
  profileController.deactivateAccount
);
router.post(
  "/delete-account",
  authMiddleware,
  parsing,
  profileController.deleteAccount
);

router.post(
  "/activate-account",
  parsing,
  [
    body("email").isEmail().withMessage("The email field is required"),
    body("password").notEmpty().withMessage("The password field is required"),
  ],
  authController.activateAccount
);

export default router;
