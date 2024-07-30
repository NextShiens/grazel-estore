import { Router } from "express";

import { parsing } from "../../config/parseMulter";
import { body } from "express-validator";
import { ReferralRankingController } from "../../controllers/common/ReferralRankingController";

const router = Router();

const referralController = new ReferralRankingController();

router.post(
  "/create-referral",
  parsing,
  [
    body("sender_user_id")
      .notEmpty()
      .withMessage("The sender_user_id field is required"),
  ],
  referralController.createReferral
);
router.post(
  "/joined-referral",
  parsing,
  [
    body("receiver_id")
      .notEmpty()
      .withMessage("The receiver_id field is required"),
    body("referral_code")
      .notEmpty()
      .withMessage("The referral_code field is required"),
  ],
  referralController.updateReferral
);
router.get("/referral/:id", referralController.getReferralById);

router.get(
  "/referrals/:sender_user_id",
  referralController.getReferralsBySender
);

router.get("/top-referrals", referralController.getTopUsersByScore);

export default router;
