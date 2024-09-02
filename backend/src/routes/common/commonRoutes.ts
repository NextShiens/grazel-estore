import { Router } from "express";
import { body } from "express-validator";
import { authMiddleware } from "../../middleware/authMiddleware";
import { ProfileController } from "../../controllers/common/ProfileController";
import { parsing } from "../../config/parseMulter";
import { RecentlyViewedController } from "../../controllers/common/RecentlyViewedProductsController";
import { SuggestedProductsController } from "../../controllers/common/SuggestedProductsController";
import { TrendingProductsController } from "../../controllers/common/TrendingProductsController";
import { FavoriteProductController } from "../../controllers/common/FavoriteProductController";
import { ReviewController } from "../../controllers/common/ReviewsController";
import { CreditLimitRequestController } from "../../controllers/seller/CreditLimitRequestController";
import { FeedbackController } from "../../controllers/public/FeedbackController";
import { NotificationController } from "../../controllers/common/NotificationController";
import path from "path";
import fs from "fs";

const multer = require("multer");
const router = Router();

const reviewImageDir = path.join(__dirname, "../../../bucket/review");
if (!fs.existsSync(reviewImageDir)) {
  fs.mkdirSync(reviewImageDir, { recursive: true });
  console.log("Review image directory created");
}

// Multer configuration for file uploads
const uploader = multer({
  storage: multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
      cb(null, "bucket/review");
    },
    filename: function (req: any, file: any, cb: any) {
      cb(null, file.fieldname + "-" + Date.now() + ".jpg");
    },
  }),
});

const recentlyViewedProducts = new RecentlyViewedController();

router.post(
  "/recently-viewed",
  authMiddleware,

  parsing,
  [
    body("product_id")
      .notEmpty()
      .withMessage("The product_id field is required"),
  ],
  recentlyViewedProducts.logProductView
);

router.get(
  "/recently-viewed",
  authMiddleware,
  recentlyViewedProducts.getRecentlyViewed
);
router.post(
  "/recently-viewed-by-guest",
  parsing,
  [
    body("product_ids")
      .notEmpty()
      .withMessage("The product_id field is required"),
  ],
  recentlyViewedProducts.getProductsByIds
);

// Suggested Products Routes

const suggestedProductsController = new SuggestedProductsController();

router.post(
  "/suggested-products",
  authMiddleware,
  parsing,
  [
    body("product_id")
      .notEmpty()
      .withMessage("The product_id field is required"),
    body("interaction_type")
      .notEmpty()
      .withMessage("The interaction_type field is required"),
  ],

  suggestedProductsController.logProductInteraction
);
router.get(
  "/suggested-products",
  authMiddleware,
  suggestedProductsController.getSuggestedProducts
);
router.get(
  "/suggested-products-for-guest",
  suggestedProductsController.getSuggestedProductsForGuest
);

// Trending Products Routes

const trendingProductsController = new TrendingProductsController();

router.get(
  "/trending-products",
  trendingProductsController.getTrendingProducts
);
router.get(
  "/trending-products-by-first-category",
  trendingProductsController.getFirstMostTrendingCategoryProduct
);
router.get(
  "/trending-products-by-second-category",
  trendingProductsController.getSecondMostTrendingCategoryProducts
);

// Favorite Products Routes
const favoriteProductsController = new FavoriteProductController();

router.get(
  "/favorite-products",
  authMiddleware,
  favoriteProductsController.getFavoriteProducts
);

router.get(
  "/favorite-products/ids",
  authMiddleware,
  favoriteProductsController.getFavoriteProductsIds
);
router.post(
  "/favorite-product",
  authMiddleware,
  parsing,
  [
    body("product_id")
      .notEmpty()
      .withMessage("The product_id field is required"),
  ],
  favoriteProductsController.toggleProductFavorite
);

// Reviews Routes

const reviewsController = new ReviewController();

router.post(
  "/reviews",
  authMiddleware,
  uploader.fields([{ name: "images", maxCount: 8 }]),
  [
    body("product_id")
      .notEmpty()
      .withMessage("The product_id field is required"),
    body("rating").notEmpty().withMessage("The rating field is required"),
    body("comment").notEmpty().withMessage("The comment field is required"),
  ],
  reviewsController.createReview
);
router.get("/reviews", authMiddleware, reviewsController.getAllReviews);
router.get("/reviews/:id", authMiddleware, reviewsController.getReviewById);
router.put(
  "/reviews/:id",
  authMiddleware,
  uploader.fields([{ name: "images", maxCount: 8 }]),
  reviewsController.updateReview
);
router.delete("/reviews/:id", authMiddleware, reviewsController.deleteReview);

// Credit Limit Request Routes

const creditLimitRequest = new CreditLimitRequestController();

router.post(
  "/create-credit-limit-request",
  parsing,
  [
    body("shop_name").notEmpty().withMessage("The shop_name field is required"),
    body("phone_number")
      .notEmpty()
      .withMessage("The phone_number field is required"),
    body("email").notEmpty().withMessage("The email field is required"),
    body("shop_address")
      .notEmpty()
      .withMessage("The shop_address field is required"),
    body("aadhar_card")
      .notEmpty()
      .withMessage("The aadhar_card field is required"),
    body("pin_card_number")
      .notEmpty()
      .withMessage("The pin_card_number field is required"),
  ],
  creditLimitRequest.create
);

// Feedbacks Routes

const feedbackController = new FeedbackController();

router.post("/give-feedback", parsing, feedbackController.create);

// Notifications Routes

const notificationController = new NotificationController();

router.put(
  "/notifications/:id",
  parsing,
  notificationController.updateUserNotificationSettings
);
router.get(
  "/notifications/:id",
  notificationController.getUserNotificationSettings
);

// User Device Token Routes

import { TokenController } from "../../controllers/common/UserDeviceTokenController";

// Route to save or update device token
router.post(
  "/save-device-token",
  parsing,
  [
    body("user_id").notEmpty().withMessage("The user_id field is required"),
    body("token").notEmpty().withMessage("The token field is required"),
  ],
  TokenController.saveDeviceToken
);

// Route to get device token
router.get("/get-device-token/:user_id", TokenController.getDeviceToken);

export default router;
