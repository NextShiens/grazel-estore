import express from "express";
import { body } from "express-validator";
import { adminMiddleware } from "../../../middleware/adminMiddleware";
import { ProductController } from "../../../controllers/admin/ProductController";

const router = express.Router();
const multer = require("multer");

const productController = new ProductController();

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
});

router.get("/admin/products", adminMiddleware, productController.getProducts);

router.post(
  "/admin/products",
  adminMiddleware,
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
  ],
  productController.createProduct
  // productController.createProduct
);

router.get(
  "/admin/products/:slug",
  adminMiddleware,
  productController.getProductBySlug
);
router.put(
  "/admin/products/:id",
  adminMiddleware,
  uploader.fields([
    { name: "featured_image", maxCount: 1 },
    { name: "gallery_images", maxCount: 8 },
  ]),

  productController.updateProduct
);

router.put(
  "/admin/product-sponsored/:id",
  adminMiddleware,
  productController.makeProductSponsored
);
router.put(
  "/admin/product-festival/:id",
  adminMiddleware,
  productController.makeProductFestival
);

router.delete(
  "/admin/products/:id",
  adminMiddleware,
  productController.deleteProduct
);

router.delete(
  "/admin/products/:productId/gallery/:imageId",
  adminMiddleware,
  productController.deleteProductImage
);


router.delete(
  "/admin/products-faq/:productId/faqs/:faqId",
  adminMiddleware,
  productController.deleteProductFaq
);

router.delete(
  "/admin/products-variant/:productId/variants/:variantId",
  adminMiddleware,
  productController.deleteProductVariant
);

export default router;
