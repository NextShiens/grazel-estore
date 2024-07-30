import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../../controllers/auth/AuthController";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
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
  "/login",
  [
    body("email").isEmail().withMessage("The email field is required"),
    body("password").notEmpty().withMessage("The password field is required"),
  ],
  authController.login
);


router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("The email field is required")],
  authController.forgotPassword
);

router.post(
  "/reset-password",
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
