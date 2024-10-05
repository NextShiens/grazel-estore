import { Router } from "express";
import adminRoutes from "./admin/adminRoutes";
import authRoutes from "./auth/authRoutes";
import buyerRoutes from "./buyer/buyerRoutes";
import sellerRoutes from "./seller/sellerRoutes";
import commonRoutes from "./common/commonRoutes";
import publicRoutes from "./public/publicRoutes";
import productRoutes from "./admin/productRoutes/productRoutes";
import phonePeRoutes from "./payment/phonePeRoutes";
import ccavenueRoutes from "./payment/ccAvenueRoute";

import profileRoutes from "./profileRoutes";
import referralRoute from "./referral/referralRoute";
import shippingRoute from "./shipping/shippingRoutes";
import { parsing } from "../config/parseMulter";

const router = Router();

router.use("/auth", authRoutes);
router.use("/global", parsing, publicRoutes);
router.use("/", adminRoutes);
router.use("/", buyerRoutes);
router.use("/", sellerRoutes);
router.use("/profile", profileRoutes);
router.use("/", commonRoutes);
// For Admin
router.use("/", productRoutes);

// For Payment Gateway
// router.use("/payment", paymentRoutes);
router.use("/phonepe", phonePeRoutes);
router.use("/ccavenue", ccavenueRoutes);

// For Referral Ranking
router.use("/", referralRoute);

// For Shipping
router.use("/shipping", shippingRoute);

export default router;
