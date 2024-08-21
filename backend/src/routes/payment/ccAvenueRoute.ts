import { Router } from "express";
import {
  handlePaymentResponse,
  initiatePayment,
} from "../../controllers/payment/ccAvenueController";
import PaymentController from "../../controllers/payment/ccavCheckoutController";

import { parsing } from "../../config/parseMulter";
import { body } from "express-validator";

const router = Router();

router.post("/initiate-payment", parsing, initiatePayment);
router.post("/handle-payment-response", parsing, handlePaymentResponse);

router.post(
  "/checkout/request",
  parsing,
  [
    body("order_id").notEmpty().withMessage("The order_id field is required"),
    body("currency").notEmpty().withMessage("The currency field is required"),
    body("amount").notEmpty().withMessage("The amount field is required"),
    body("redirect_url")
      .notEmpty()
      .withMessage("The redirect_url field is required"),
    body("cancel_url")
      .notEmpty()
      .withMessage("The cancel_url field is required"),
  ],
  PaymentController.postRequest
);
router.post(
  "/checkout/response",
  parsing,
  [body("encResp").notEmpty().withMessage("The encResp field is required")],

  PaymentController.postResponse
);

router.post(
  "/checkout/response/membership-plan",
  parsing,
  [body("encResp").notEmpty().withMessage("The encResp field is required")],

  PaymentController.postResponseMembershipPayment
);

export default router;
