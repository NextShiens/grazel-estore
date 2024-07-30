import express from "express";
import { body, check } from "express-validator";
import { BrandController } from "../../controllers/admin/BrandController";
import { parsing } from "../../config/parseMulter";
import { CategoryController } from "../../controllers/admin/CategoryController";
import { UserController } from "../../controllers/admin/UserController";
import { adminMiddleware } from "../../middleware/adminMiddleware";
import { AdminOrderController } from "../../controllers/admin/OrderController";
import { CustomerSupportAdmin } from "../../controllers/admin/CustomerSupport";
import { BannerController } from "../../controllers/admin/BannerController";
import { CreditLimitRequestController } from "../../controllers/admin/CreditLimitRequestController";
import { FeedbackController } from "../../controllers/admin/FeedbackController";
import { AdminStatisticsController } from "../../controllers/admin/AdminStatisticsController";
import { AdminSalesController } from "../../controllers/admin/AdminSalesController";
import path from "path";
import fs from "fs";
import { MembershipPlanController } from "../../controllers/admin/MembershipPlanController";
import { StateController } from "../../controllers/admin/StateController";
import { CityController } from "../../controllers/admin/CityController";

const router = express.Router();
const multer = require("multer");

const categoryController = new CategoryController();

// Brand Routes
const brandController = new BrandController();

router.get(
  "/brands",
  adminMiddleware,
  brandController.getAll.bind(brandController)
);
router.get(
  "/brands/:slug",
  adminMiddleware,
  brandController.getBySlug.bind(brandController)
);
router.get(
  "/brands/details/:id",
  adminMiddleware,
  brandController.getById.bind(brandController)
);
router.post(
  "/brands",
  adminMiddleware,
  parsing,
  [body("name").notEmpty().withMessage("The name field is required")],
  brandController.create.bind(brandController)
);
router.put(
  "/brands/:id",
  adminMiddleware,
  parsing,
  brandController.update.bind(brandController)
);
router.delete(
  "/brands/:id",
  adminMiddleware,
  brandController.delete.bind(brandController)
);

const categoryImageDir = path.join(__dirname, "../../../bucket/category");
if (!fs.existsSync(categoryImageDir)) {
  fs.mkdirSync(categoryImageDir, { recursive: true });
  console.log("Category image directory created");
}

// Category Routes
const categoryUpload = multer({
  storage: multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
      cb(null, "bucket/category");
    },
    filename: function (req: any, file: any, cb: any) {
      cb(null, file.fieldname + "-" + Date.now() + ".jpg");
    },
  }),
}).single("image");

router.get(
  "/categories",
  adminMiddleware,
  parsing,
  categoryController.getAll.bind(categoryController)
);
router.get(
  "/categories/details/:id",
  parsing,
  categoryController.getById.bind(categoryController)
);

router.get(
  "/categories/:slug",
  adminMiddleware,
  parsing,
  categoryController.getBySlug.bind(categoryController)
);

router.post(
  "/categories",
  adminMiddleware,
  categoryUpload,

  [body("name").notEmpty().withMessage("The name field is required")],
  categoryController.create
);
router.put("/categories/:id", categoryUpload, categoryController.update);

router.delete(
  "/categories/:id",
  adminMiddleware,
  parsing,
  categoryController.delete.bind(categoryController)
);

// User Routes

const userImageDir = path.join(__dirname, "../../../bucket/user");
if (!fs.existsSync(userImageDir)) {
  fs.mkdirSync(userImageDir, { recursive: true });
  console.log("User image directory created");
}

const userUpload = multer({
  storage: multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
      cb(null, "bucket/user");
    },
    filename: function (req: any, file: any, cb: any) {
      cb(null, file.fieldname + "-" + Date.now() + ".jpg");
    },
  }),
}).single("image");

const userController = new UserController();

router.get(
  "/users",
  adminMiddleware,
  userController.getAll.bind(userController)
);
router.get(
  "/users/:id",
  adminMiddleware,
  userController.getById.bind(userController)
);

router.get(
  "/users/:id/seller",
  adminMiddleware,
  userController.getSellerDetailWithProductsById
);

router.get(
  "/seller-stores",
  adminMiddleware,
  userController.getAllSellerWithStoreDetails
);

router.get(
  "/seller-stores/:id/approval",
  adminMiddleware,
  userController.toggleSellerStoreActive
);

router.post(
  "/users",
  adminMiddleware,
  parsing,
  [
    body("username").notEmpty().withMessage("The username field is required"),
    body("email").isEmail().withMessage("The email field is required"),
    body("password")
      .notEmpty()
      .withMessage("The password field is required")
      .isLength({ min: 8 })
      .withMessage("The new password must be at least 8 characters long"),
  ],
  userController.create.bind(userController)
);

router.put(
  "/users/:id",
  adminMiddleware,
  userUpload,
  userController.update.bind(userController)
);
router.delete(
  "/users/:id",
  adminMiddleware,
  userController.delete.bind(userController)
);

// Order Routes

const orderController = new AdminOrderController();

router.get("/admin/orders", adminMiddleware, orderController.getAllOrders);
router.get("/admin/orders/:id", adminMiddleware, orderController.getOrderById);
router.get(
  "/admin/multi-orders/:ref_id",
  adminMiddleware,
  orderController.getMultiOrderByRefId
);
router.put(
  "/admin/orders/:id/status",
  adminMiddleware,
  parsing,
  orderController.updateOrderStatus
);

// Customer Support Routes

const customerSupportController = new CustomerSupportAdmin();

router.get(
  "/admin/customer-support",
  adminMiddleware,
  customerSupportController.getAll
);
router.get(
  "/admin/customer-support/:id",
  adminMiddleware,
  customerSupportController.getById
);

// Banner Routes

const bannerImageDir = path.join(__dirname, "../../../bucket/banner");
if (!fs.existsSync(bannerImageDir)) {
  fs.mkdirSync(bannerImageDir, { recursive: true });
  console.log("Banner image directory created");
}

const bannerUploader = multer({
  storage: multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
      cb(null, "bucket/banner");
    },
    filename: function (req: any, file: any, cb: any) {
      // Ensure unique filenames by appending a timestamp
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      if (file.fieldname === "banner_image") {
        // For images (assuming JPEG format)
        cb(null, "image-" + uniqueSuffix + ".jpg");
      } else if (file.fieldname === "video") {
        // For videos (assuming MP4 format)
        cb(null, "video-" + uniqueSuffix + ".mp4");
      } else {
        cb(new Error("Unexpected file fieldname"));
      }
    },
  }),
  limits: {
    fileSize: {
      // Setting a maximum file size limit (adjust as needed)
      banner_image: 5 * 1024 * 1024, // 5 MB for banner images
      video: 10 * 1024 * 1024, // 10 MB for videos
    },
  },
});

const bannerController = new BannerController();

router.get("/admin/banners", adminMiddleware, bannerController.getAllBanners);
router.delete("/admin/banners/:id", adminMiddleware, bannerController.delete);
router.put(
  "/admin/banners/:id/activate",
  adminMiddleware,
  bannerController.activateBanner
);
router.put(
  "/admin/banners/:id/deactivate",
  adminMiddleware,
  bannerController.deactivateBanner
);
router.post(
  "/admin/banners",
  adminMiddleware,
  bannerUploader.fields([
    { name: "banner_image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  [
    body("title").notEmpty().withMessage("The title field is required"),
    body("position").notEmpty().withMessage("The position field is required"),
  ],
  bannerController.create
);

const creditLimitRequestController = new CreditLimitRequestController();

router.get(
  "/admin/credit-limit-requests",
  adminMiddleware,
  creditLimitRequestController.getAll
);
router.get(
  "/admin/credit-limit-requests/:id",
  adminMiddleware,
  creditLimitRequestController.getById
);

router.put(
  "/admin/credit-limit-requests/:id",
  adminMiddleware,
  parsing,
  creditLimitRequestController.update
);

router.delete(
  "/admin/credit-limit-requests/:id",
  adminMiddleware,
  creditLimitRequestController.delete
);

// Feedback Routes

const feedbackController = new FeedbackController();

router.get("/admin/feedbacks", adminMiddleware, feedbackController.getAll);
router.get("/admin/feedbacks/:id", adminMiddleware, feedbackController.getById);

router.delete(
  "/admin/feedbacks/:id",
  adminMiddleware,
  feedbackController.delete
);

// Admin Statistics Routes

const adminStatisticsController = new AdminStatisticsController();

router.get(
  "/admin/statistics/best-sellers",
  adminMiddleware,
  adminStatisticsController.getAllBestSellers
);
router.get(
  "/admin/statistics/recent-orders",
  adminMiddleware,
  adminStatisticsController.getRecentOrders
);

router.get(
  "/admin/statistics/buyers",
  adminMiddleware,
  adminStatisticsController.getBuyerStats
);

router.get(
  "/admin/statistics/sellers",
  adminMiddleware,
  adminStatisticsController.getSellerStats
);

router.get(
  "/admin/statistics/admins",
  adminMiddleware,
  adminStatisticsController.getAdminStats
);

router.get(
  "/admin/statistics/order-analytics",
  adminMiddleware,
  adminStatisticsController.getOrderAnalytics
);
router.get(
  "/admin/statistics/revenue",
  adminMiddleware,
  adminStatisticsController.getTotalRevenueStats
);

router.get(
  "/admin/statistics/revenue-by-date",
  adminMiddleware,
  adminStatisticsController.getTotalOrdersByDate
);

// Admin Sales Routes

const adminSalesController = new AdminSalesController();

router.get(
  "/admin/sales/order-stats",
  adminMiddleware,
  adminSalesController.getTotalOrders
);
router.get(
  "/admin/sales/sale-stats",
  adminMiddleware,
  adminSalesController.getTotalSales
);

router.get(
  "/admin/sales/order-value-stats",
  adminMiddleware,
  adminSalesController.getOrderValues
);

router.get(
  "/admin/sales/trending-categories-sales",
  adminMiddleware,
  adminSalesController.getHighestCategoryOrder
);

router.get(
  "/admin/sales/all-categories-sales",
  adminMiddleware,
  adminSalesController.getAllCategoriesSales
);

router.get(
  "/admin/sales/sales-performance-data",
  adminMiddleware,
  adminSalesController.getSalesPerformanceChart
);

router.get(
  "/admin/sales/revenue-by-date",
  adminMiddleware,
  adminSalesController.getTotalOrdersByDate
);


// Membership plan Routes

const membershipPlanController = new MembershipPlanController();

router.get(
  "/admin/membership-plans",
  adminMiddleware,
  membershipPlanController.getAll
);
router.get(
  "/admin/membership-plans/:id",
  adminMiddleware,
  membershipPlanController.getById
);
router.post(
  "/admin/membership-plans",
  adminMiddleware,
  parsing,
  [
    body("name").notEmpty().withMessage("The name field is required"),
    body("price").notEmpty().withMessage("The price field is required"),
    body("duration_months")
      .notEmpty()
      .withMessage("The duration_months field is required")
      .isNumeric()
      .withMessage("Duration months must be a number"),
    body("discount")
      .notEmpty()
      .withMessage("The discount field is required")
      .isNumeric()
      .withMessage("Discount must be a number"),
  ],
  membershipPlanController.create
);
router.put(
  "/admin/membership-plans/:id",
  adminMiddleware,
  parsing,
  membershipPlanController.update
);
router.delete(
  "/admin/membership-plans/:id",
  adminMiddleware,
  membershipPlanController.delete
)
const stateController = new StateController();

// Route to create a new state
router.post(
  "/admin/states",
  adminMiddleware,
  parsing,
  [body("name").notEmpty().withMessage("The name field is required")],
  stateController.create
);

// Route to get all states
router.get("/admin/states", adminMiddleware, stateController.findAll);

// Route to get a state by ID
router.get("/admin/states/:id", adminMiddleware, stateController.findOne);

// Route to update a state
router.put(
  "/admin/states/:id",
  adminMiddleware,
  parsing,
  stateController.update
);

// Route to delete a state
router.delete("/admin/states/:id", adminMiddleware, stateController.delete);

const cityController = new CityController();

// Route to create a new city
router.post(
  "/admin/cities",
  adminMiddleware,
  parsing,
  [
    body("name").notEmpty().withMessage("The name field is required"),
    body("state_id").notEmpty().withMessage("The state_id field is required"),
  ],

  cityController.create
);

// Route to get all cities
router.get("/admin/cities", adminMiddleware, cityController.findAll);

// Route to get a single city by ID
router.get("/admin/cities/:id", adminMiddleware, cityController.findOne);

// Route to update a city
router.put(
  "/admin/cities/:id",
  adminMiddleware,
  parsing,
  cityController.update
);

// Route to delete a city
router.delete("/admin/cities/:id", adminMiddleware, cityController.delete);

// Route to get cities by state ID
router.get(
  "/admin/cities/state/:id",
  adminMiddleware,
  cityController.findByState
);

export default router;
