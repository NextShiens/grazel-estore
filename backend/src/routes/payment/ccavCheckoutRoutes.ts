import { Router } from "express";
import PaymentController from "../../controllers/payment/ccavCheckoutController";

const router = Router();

router.post("/checkout/request", PaymentController.postRequest);
router.post("/checkout/response", PaymentController.postResponse);
router.post(
  "/checkout/response/membership-plan",
  PaymentController.postResponseMembershipPayment
);

export default router;
