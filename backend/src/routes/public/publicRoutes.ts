import { Router } from "express";
import { ProductListingController } from "../../controllers/public/ProductListingController";
import { CategoryListingController } from "../../controllers/public/CategoryController";
import { BrandListingController } from "../../controllers/public/BrandController";
import { SearchController } from "../../controllers/public/SearchController";
import { StoreController } from "../../controllers/public/StoreController";
import { CustomerSupportPublic } from "../../controllers/public/CustomerSupport";
import { body } from "express-validator";
import { BannerController } from "../../controllers/public/BannerController";
import { getProductsDynamically } from "../../controllers/public/DynamicProducts";
import { StateController } from "../../controllers/admin/StateController";
import { StatesCitiesController } from "../../controllers/public/StatesCitiesController";
import { NotificationController } from "../../controllers/public/NotificationController";

const router = Router();

// Public Product Routes

const productListingController = new ProductListingController();

router.get("/products", productListingController.getAllProducts);
router.get(
  "/products-default",
  productListingController.getAllProductsWithoutPagination
);
router.get("/products/:slug", productListingController.getProductBySlug);
router.get("/products/details/:id", productListingController.getProductById);
router.get(
  "/products/reviews/:id",
  productListingController.getAllReviewForSingleProduct
);
router.get("/products-dynamic", getProductsDynamically);
router.get("/related-product", productListingController.relatedProduct);
router.get("/product-offers", productListingController.getAllProductsWithOffer);
router.get(
  "/product-offers-default",
  productListingController.getAllProductsWithOfferWithoutPagination
);
router.get(
  "/product-offers/:userId",
  productListingController.getProductsByUserIdWithOffer
);
router.get(
  "/product-by-percentage-offers/fifty",
  productListingController.getProductsWithFiftyPercentOffer
);
router.get(
  "/product-by-percentage-offers/seventy",
  productListingController.getProductsWithSeventyPercentOffer
);

router.get(
  "/products-by-offer/:offer_id",
  productListingController.getProductsByOfferId
);

router.get(
  "/discounted-products",
  productListingController.getAllProductsWithDiscounts
);
router.get("/best-products", productListingController.getBestOfAllProducts);
router.get(
  "/sponsored-products",
  productListingController.getAllSponsoredProducts
);
router.get(
  "/festival-products",
  productListingController.getAllSponsoredProducts
);

router.get(
  "/top-selected-products",
  productListingController.getTopSelectionProducts
);
router.get(
  "/season-top-products",
  productListingController.getTopSelectionProducts
);

// Public Categories Routes

const categoryListingController = new CategoryListingController();

router.get("/categories", categoryListingController.getAllCategories);
router.get("/categories/:slug", categoryListingController.getCategoryBySlug);
router.get(
  "/categories/details/:id",
  categoryListingController.getCategoryById
);

// Public Product Routes

const brandListingController = new BrandListingController();

router.get("/brands", brandListingController.getAllBrands);
router.get("/brands/:slug", brandListingController.getBrandBySlug);
router.get("/brands/details/:id", brandListingController.getBrandById);

// Search  Routes

const searchController = new SearchController();

router.get("/search-results", searchController.getSearchResults);
router.get(
  "/search-results-default",
  searchController.getSearchResultsWithoutPagination
);
router.get("/search-suggestion", searchController.getSuggestedKeywords);
router.get("/popular-searches", searchController.getPopularSearches);

// Store Routes

const storeController = new StoreController();

router.get("/store/:id/products", storeController.getStoreDetailsWithProducts);
router.get(
  "/store-default/:id/products",
  storeController.getStoreDetailsWithProductsWithoutPagination
);

// Store Routes
const customerSupportController = new CustomerSupportPublic();

router.post(
  "/customer-support",
  [
    body("name").notEmpty().withMessage("The name field is required"),
    body("email").notEmpty().withMessage("The email field is required"),
    body("message").notEmpty().withMessage("The message field is required"),
  ],
  customerSupportController.create
);

// Banner Routes

const bannerController = new BannerController();

router.get("/banners/:position/:type", bannerController.getBannersByPosition);

// States Cities Routes

const statesCitiesController = new StatesCitiesController();

router.get("/states", statesCitiesController.findAllStates);
router.get("/cities-by-state/:id", statesCitiesController.findCitiesByState);
router.get("/cities", statesCitiesController.findAllCities);
router.get("/states/:id", statesCitiesController.findOneState);
router.get("/cities/:id", statesCitiesController.findOneCity);

// Notification Routes

const notificationController = new NotificationController();

router.get(
  "/latest-notifications/:id",
  notificationController.getUserNotifications
);
router.get("/all-notifications/:id", notificationController.seeAllNotifications);

export default router;
