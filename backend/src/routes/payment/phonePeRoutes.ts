import { Router } from "express";
import {
  initiatePayment,
  handleCallback,
  checkTransactionStatus,
} from "../../controllers/payment/PhonePeController";
import { body, param } from "express-validator";
import { parsing } from "../../config/parseMulter";

const router = Router();

router.post(
  "/initiate-payment",
  parsing, 
  [
    body("user_id").notEmpty().withMessage("The user_id field is required"),
    body("amount").notEmpty().withMessage("The amount field is required"),
    body("redirect_url")
      .notEmpty()
      .withMessage("The redirect_url field is required"),
    body("redirect_mode")
      .notEmpty()
      .withMessage("The redirect_mode field is required"),
  ],
  initiatePayment
);

// Route to handle the callback from PhonePe
router.post("/callback",
  
  handleCallback);
router.get(
  "/check-transaction-status/:merchantTransactionId",
  [
    param("merchantTransactionId")
      .notEmpty()
      .withMessage("The merchantTransactionId parameter is required"),
  ],
  checkTransactionStatus
);

export default router;
