import { Router } from "express";
import { PaymentController } from "../../controllers/payment/PaymentController";
import { parsing } from "../../config/parseMulter";
import { body } from "express-validator";

const router = Router();

const paymentController = new PaymentController();

router.post(
  "/ccavenue-billing-page",
  parsing,
  [
    body("order_id").notEmpty().withMessage("The order_id field is required"),
    body("amount").notEmpty().withMessage("The amount field is required"),
    body("name").notEmpty().withMessage("The name field is required"),
    body("address").notEmpty().withMessage("The address field is required"),
  ],

  paymentController.ccavenueBillingPage
);

router.post(
  "/ccavenue-iframe-checkout",
  parsing,
  [
    body("order_id").notEmpty().withMessage("The order_id field is required"),
    body("amount").notEmpty().withMessage("The amount field is required"),
    body("name").notEmpty().withMessage("The name field is required"),
    body("address").notEmpty().withMessage("The address field is required"),
  ],
  paymentController.ccavenueIframeCheckout
);

router.post(
  "/ccavenue-custom-checkout",
  parsing,
  [
    body("order_id").notEmpty().withMessage("The order_id field is required"),
    body("amount").notEmpty().withMessage("The amount field is required"),
    body("name").notEmpty().withMessage("The name field is required"),
    body("address").notEmpty().withMessage("The address field is required"),
    body("payment_option")
      .notEmpty()
      .withMessage("The payment_option field is required"),
    body("card_type").notEmpty().withMessage("The card_type field is required"),
    body("card_name").notEmpty().withMessage("The card_name field is required"),
    body("card_number")
      .notEmpty()
      .withMessage("The card_number field is required"),
    body("expiry_month")
      .notEmpty()
      .withMessage("The expiry_month field is required"),
    body("expiry_year")
      .notEmpty()
      .withMessage("The expiry_year field is required"),
    body("cvv_number")
      .notEmpty()
      .withMessage("The cvv_number field is required"),
  ],
  paymentController.ccavenueCustomCheckout
);

router.post(
  "/ccav-response-handler",
  parsing,

  [body("enc_resp").notEmpty().withMessage("The enc_resp field is required")],

  paymentController.ccavResponseHandler
);


export default router;
