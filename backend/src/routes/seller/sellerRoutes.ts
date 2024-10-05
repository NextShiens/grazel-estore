import express from "express";
import { body } from "express-validator";
import { ProductController } from "../../controllers/seller/ProductController";
import { sellerMiddleware } from "../../middleware/sellerMiddleware";
import { SellerOrderController } from "../../controllers/seller/OrderController";
import { parsing } from "../../config/parseMulter";
import { OfferController } from "../../controllers/seller/OfferController";
import { SellerStatisticsController } from "../../controllers/seller/SellerStatisticsController";
import { StoreProfileController } from "../../controllers/seller/StoreProfileController";
import path from "path";
import fs from "fs";
import { UserMembershipController } from "../../controllers/seller/MembershipPurchaseController";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = express.Router();
const multer = require("multer");

const storeProfileController = new StoreProfileController();

const storeImageDir = path.join(__dirname, "../../../bucket/store");
if (!fs.existsSync(storeImageDir)) {
  fs.mkdirSync(storeImageDir, { recursive: true });
  console.log("Store image directory created");
}

// Set up storage configuration
const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    // Set the destination directory for file uploads
    cb(null, "bucket/store"); // Change 'uploads/' to your desired upload directory
  },
  filename: function (req: any, file: any, cb: any) {
    // Set the filename for uploaded files
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Set up file filter
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and PDF files are allowed."
      ),
      false
    );
  }
};

// Set up multer with storage and file filter
const storeImageUploader = multer({
  storage: storage,
  fileFilter: fileFilter,
}).fields([
  { name: "store_image", maxCount: 1 },
  { name: "business_license", maxCount: 1 },
  { name: "tax_id", maxCount: 1 },
  { name: "proof_of_address", maxCount: 1 },
]);

router.get(
  "/store-profile",
  sellerMiddleware,
  storeProfileController.getProfile
);
router.put(
  "/store-profile",
  sellerMiddleware,
  storeImageUploader,
  storeProfileController.editProfile
);

const productController = new ProductController();

// Validation schema for dimensions
const dimensionsSchema = {
  "dimensions[length]": {
    in: ["body"],
    isFloat: { options: { min: 0 } },
    errorMessage: "Length must be a positive number.",
  },
  "dimensions[width]": {
    in: ["body"],
    isFloat: { options: { min: 0 } },
    errorMessage: "Width must be a positive number.",
  },
  "dimensions[height]": {
    in: ["body"],
    isFloat: { options: { min: 0 } },
    errorMessage: "Height must be a positive number.",
  },
  "dimensions[weight]": {
    in: ["body"],
    isFloat: { options: { min: 0 } },
    errorMessage: "Weight must be a positive number.",
  },
};

const productImageDir = path.join(__dirname, "../../../bucket/product");
if (!fs.existsSync(productImageDir)) {
  fs.mkdirSync(productImageDir, { recursive: true });
  console.log("Product image directory created");
}

// Multer configuration for file uploads
const uploader = multer({
  storage: multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
      cb(null, "bucket/product");
    },
    filename: function (req: any, file: any, cb: any) {
      cb(null, file.fieldname + "-" + Date.now() + ".jpg");
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB in bytes
  },
});

router.get("/vendor/products", sellerMiddleware, productController.getProducts);

router.post(
  "/vendor/products",
  sellerMiddleware,
  uploader.fields([
    { name: "featured_image", maxCount: 1 },
    { name: "gallery_images", maxCount: 8 },
  ]),
  [
    body("category_id")
      .notEmpty()
      .withMessage("The category id field is required"),
    body("title").notEmpty().withMessage("The title field is required"),
    body("price").notEmpty().withMessage("The price field is required"),
    body("dimensions.length")
      .notEmpty()
      .isFloat({ gt: 0 })
      .withMessage("Length must be a positive number"),
    body("dimensions.width")
      .notEmpty()
      .isFloat({ gt: 0 })
      .withMessage("Width must be a positive number"),
    body("dimensions.height")
      .notEmpty()
      .isFloat({ gt: 0 })
      .withMessage("Height must be a positive number"),
    body("dimensions.weight")
      .notEmpty()
      .isFloat({ gt: 0 })
      .withMessage("Weight must be a positive number"),
  ],

  productController.createProduct
);

router.get(
  "/vendor/products/:slug",
  sellerMiddleware,
  productController.getProductBySlug
);
router.put(
  "/vendor/products/:id",
  sellerMiddleware,
  uploader.fields([
    { name: "featured_image", maxCount: 1 },
    { name: "gallery_images", maxCount: 8 },
  ]),

  productController.updateProduct
);

router.put(
  "/vendor/product-festival/:id",
  sellerMiddleware,
  productController.makeProductFestival
);

router.delete(
  "/vendor/products/:id",
  sellerMiddleware,
  productController.deleteProduct
);

router.delete(
  "/vendor/products/:productId/gallery/:imageId",
  sellerMiddleware,
  productController.deleteProductImage
);

router.delete(
  "/vendor/products-faq/:productId/faqs/:faqId",
  sellerMiddleware,
  productController.deleteProductFaq
);

router.delete(
  "/vendor/products-variant/:productId/variants/:variantId",
  sellerMiddleware,
  productController.deleteProductVariant
);

const orderController = new SellerOrderController();

router.get("/seller/orders", sellerMiddleware, orderController.getAllOrders);
router.get(
  "/seller/orders/:id",
  sellerMiddleware,
  orderController.getOrderById
);
router.get(
  "/seller/multi-orders/:ref_id",
  sellerMiddleware,
  orderController.getMultiOrderByRefId
);
router.put(
  "/seller/orders/:id/status",
  sellerMiddleware,
  parsing,
  orderController.updateOrderStatus
);

const offersController = new OfferController();

router.post(
  "/vendor/create-offer",
  sellerMiddleware,
  parsing,
  [
    body("title").notEmpty().withMessage("The title field is required"),
    body("description")
      .notEmpty()
      .withMessage("The description field is required"),
    body("discount_type")
      .notEmpty()
      .withMessage("The discount_type field is required"),
    body("discount_value")
      .notEmpty()
      .withMessage("The discount_value field is required"),
    body("start_date")
      .notEmpty()
      .withMessage("The start_date field is required"),

    body("end_date").notEmpty().withMessage("The end_date field is required"),
  ],

  offersController.createOffer
);
router.get(
  "/vendor/offers",
  sellerMiddleware,
  offersController.getOffersByUser
);

router.get(
  "/vendor/offers/:id",
  sellerMiddleware,
  offersController.getSingleOfferDetails
);

router.put(
  "/vendor/offers/:id",
  sellerMiddleware,
  parsing,
  offersController.updateOffer
);

router.delete(
  "/vendor/offers/:id",
  sellerMiddleware,
  offersController.deleteOffer
);

router.post(
  "/vendor/offers/:offer_id/apply",
  sellerMiddleware,
  parsing,
  [
    body("product_id")
      .notEmpty()
      .withMessage("The product_id field is required"),
  ],
  offersController.applyOffer
);

router.post(
  "/vendor/offers/:offer_id/multi-apply",
  sellerMiddleware,
  parsing,
  [
    body("product_ids")
      .notEmpty()
      .withMessage("The product_ids field is required"),
  ],
  offersController.applyOfferMultiProducts
);

// Seller Statistics Routes

const sellerStatisticsController = new SellerStatisticsController();

router.get(
  "/seller/statistics/orders",
  sellerMiddleware,
  sellerStatisticsController.getRecentOrders
);
router.get(
  "/seller/statistics/sales",
  sellerMiddleware,
  sellerStatisticsController.sellerTotalSales
);
router.get(
  "/seller/statistics/orders-stats",
  sellerMiddleware,
  sellerStatisticsController.getTotalOrders
);

router.get(
  "/seller/statistics/lifetime-revenue",
  sellerMiddleware,
  sellerStatisticsController.sellerLifetimeRevenue
);

router.get(
  "/seller/statistics/return-stats",
  sellerMiddleware,
  sellerStatisticsController.getTotalReturnOrdersAmount
);

router.get(
  "/seller/statistics/revenue-trend",
  sellerMiddleware,
  sellerStatisticsController.getSellerRevenueTrend
);

// User Membership Plan

const userMembershipPlanController = new UserMembershipController();

router.get(
  "/membership-plans",
  authMiddleware,
  userMembershipPlanController.getAll
);
router.get(
  "/membership-plans/:id",
  authMiddleware,
  userMembershipPlanController.getById
);

router.post(
  "/purchase-membership-plan",
  authMiddleware,
  parsing,
  [
    body("membership_plan_id")
      .notEmpty()
      .withMessage("The membership_plan_id field is required"),
  ],

  userMembershipPlanController.purchaseMembership
);
router.post(
  "/confirm-plan-payment/:id",
  authMiddleware,
  parsing,
  [
    body("transaction_id")
      .notEmpty()
      .withMessage("The transaction_id field is required"),
    body("payment_status")
      .notEmpty()
      .withMessage("The payment_status field is required"),
  ],
  userMembershipPlanController.confirmPayment
);

router.get(
  "/user-membership-plan",
  authMiddleware,
  userMembershipPlanController.getUserMemberships
);

router.get(
  "/active-membership-plan",
  authMiddleware,
  userMembershipPlanController.getActiveMembershipByUserId
);

// Apply Membership Plan
router.post(
  "/apply-membership-discount",
  authMiddleware,
  parsing,
  [
    body("product_ids")
      .notEmpty()
      .withMessage("The product_ids field is required"),
    body("quantities")
      .notEmpty()
      .withMessage("The quantities field is required"),
    body("variant_ids")
      .notEmpty()
      .withMessage("The variant_ids field is required"),
  ],

  userMembershipPlanController.applyMembership
);

export default router;
