import { Router } from "express";
import adminRoutes from "./admin/adminRoutes";
import authRoutes from "./auth/authRoutes";
import buyerRoutes from "./buyer/buyerRoutes";
import sellerRoutes from "./seller/sellerRoutes";
import commonRoutes from "./common/commonRoutes";
import publicRoutes from "./public/publicRoutes";
import productRoutes from "./admin/productRoutes/productRoutes";
import paymentRoutes from "./payment/paymentRoute";
import profileRoutes from "./profileRoutes";
import referralRoute from "./referral/referralRoute";
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
router.use("/payment", paymentRoutes);
// For Referral Ranking
router.use("/", referralRoute);

export default router;
