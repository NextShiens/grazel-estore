import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Product } from "../../entities/Product";
import { paginate } from "nestjs-typeorm-paginate";
import { Review } from "../../entities/Review";
import { User } from "../../entities/Users";

const BASE_URL = process.env.IMAGE_PATH || "https://api.grazle.co.in/";

export class StoreController {
  async getStoreDetailsWithProducts(req: Request, res: Response) {
    try {
      const { id: userId } = req.params;
      const {
        page = 1,
        limit = 10,
        latest_arrival,
        price,
        top_rated,
        popular,
        more_suitable,
        discount,
      } = req.query;

      // Validate userId parameter
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID parameter is required",
        });
      }

      // Convert userId to number
      const userIdNumber = Number(userId);

      // Check if userId is a valid number
      if (isNaN(userIdNumber)) {
        return res.status(400).json({
          success: false,
          message: "User ID must be a valid number",
        });
      }

      // Fetch products created by the user with pagination
      const productRepository = appDataSource.getRepository(Product);
      let queryBuilder = productRepository
        .createQueryBuilder("product")
        .where("product.user_id = :userId", { userId: userIdNumber })
        .leftJoin("product.reviews", "review")
        .addSelect("COUNT(review.id)", "reviewCount")
        .orderBy("product.created_at", "DESC")
        .groupBy("product.id");

      // Sorting based on latest_arrival parameter
      if (latest_arrival) {
        queryBuilder = queryBuilder.addOrderBy(
          "product.created_at",
          latest_arrival === "desc" ? "DESC" : "ASC"
        );
      }

      // Sorting based on price parameter
      if (price) {
        queryBuilder = queryBuilder.addOrderBy(
          "product.price",
          price === "highest" ? "DESC" : "ASC"
        );
      }

      // Apply discount filter
      if (discount === "discount") {
        queryBuilder = queryBuilder.andWhere(
          "product.discount IS NOT NULL AND product.discount > 0"
        );
        queryBuilder = queryBuilder.addOrderBy("product.discount", "DESC");
      }

      // Filtering based on top_rated parameter
      if (top_rated === "top") {
        queryBuilder = queryBuilder
          .leftJoin("product.reviews", "review")
          .groupBy("product.id")
          .having("AVG(review.rating) = 5");
      }

      // Sorting based on popular parameter (number of reviews)
      if (popular === "popular") {
        queryBuilder = queryBuilder
          .leftJoin("product.reviews", "review")
          .groupBy("product.id")
          .addOrderBy("COUNT(review.id)", "DESC");
      }

      // Apply more_suitable=suitable filter
      if (more_suitable === "suitable") {
        // Apply combination of discount and popular
        queryBuilder = queryBuilder
          .andWhere("product.discount IS NOT NULL AND product.discount > 0") // Assuming discount is a column in the product entity
          .addOrderBy("reviewCount", "DESC"); // Sort by popularity
      }

      const pagination = await paginate<Product>(queryBuilder, {
        page: Number(page),
        limit: Number(limit),
      });

      // Fetch user's profile
      const profileRepository = appDataSource.getRepository(User);
      const userProfile = await profileRepository.findOne({
        where: { id: userIdNumber },
        relations: ["profile", "store_profile"],
      });

      // Fetch all reviews for each product in pagination
      const reviewRepository = appDataSource.getRepository(Review);
      const productsWithReviews = await Promise.all(
        pagination.items.map(async (product) => {
          // Fetch all reviews for the current product
          const productReviews = await reviewRepository.find({
            where: { product_id: product.id },
          });

          // Calculate average rating for the product
          let totalRating = 0;
          productReviews.forEach((review) => {
            totalRating += review.rating;
          });
          const averageRating =
            productReviews.length > 0 ? totalRating / productReviews.length : 0;

          // Attach BASE_URL to the featured_image
          const updatedProduct = {
            ...product,
            featured_image: product.featured_image
              ? `${BASE_URL}${product.featured_image}`
              : null,
            rating: averageRating.toFixed(1), // Format average rating to one decimal place
            reviews: productReviews.length,
          };

          return updatedProduct;
        })
      );

      // Calculate store rating and total reviews
      let totalStoreRating = 0;
      let totalStoreReviews = 0;
      productsWithReviews.forEach((product) => {
        totalStoreRating += parseFloat(product.rating); // Parse rating to float for summing
        totalStoreReviews += product.reviews;
      });

      const storeRating =
        productsWithReviews.length > 0
          ? (totalStoreRating / productsWithReviews.length).toFixed(1)
          : "0.0";

      res.status(200).json({
        success: true,
        message: "Products retrieved successfully",
        store: {
          store_id: userProfile?.id || null,
          store_name: userProfile?.store_profile?.store_name || null,
          image: userProfile?.store_profile
            ? `${BASE_URL}${userProfile?.store_profile?.store_image}`
            : null,
          store_products: pagination.items.length,
          store_rating: storeRating,
          store_reviews: totalStoreReviews,
        },
        products: productsWithReviews,
        meta: {
          totalItems: pagination.meta.totalItems,
          currentPage: pagination.meta.currentPage,
          itemsPerPage: pagination.meta.itemsPerPage,
          totalPages: pagination.meta.totalPages,
        },
      });
    } catch (error: any) {
      console.error("Error fetching products:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve products",
        error: error.message,
      });
    }
  }

  async getStoreDetailsWithProductsWithoutPagination(
    req: Request,
    res: Response
  ) {
    try {
      const { id: userId } = req.params;
      const {
        latest_arrival,
        price,
        discount,
        top_rated,
        popular,
        more_suitable,
      } = req.query;

      // Validate userId parameter
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID parameter is required",
        });
      }

      // Convert userId to number
      const userIdNumber = Number(userId);

      // Check if userId is a valid number
      if (isNaN(userIdNumber)) {
        return res.status(400).json({
          success: false,
          message: "User ID must be a valid number",
        });
      }

      // Fetch products created by the user
      const productRepository = appDataSource.getRepository(Product);
      let queryBuilder = productRepository
        .createQueryBuilder("product")
        .where("product.user_id = :userId", { userId: userIdNumber })
        .leftJoin("product.reviews", "review")
        .addSelect("COUNT(review.id)", "reviewCount")
        .orderBy("product.created_at", "DESC")
        .groupBy("product.id");

      // Sorting based on latest_arrival parameter
      if (latest_arrival) {
        queryBuilder = queryBuilder.addOrderBy(
          "product.created_at",
          latest_arrival === "desc" ? "DESC" : "ASC"
        );
      }

      // Sorting based on price parameter
      if (price) {
        queryBuilder = queryBuilder.addOrderBy(
          "product.price",
          price === "highest" ? "DESC" : "ASC"
        );
      }

      // Filtering based on top_rated parameter
      if (top_rated === "top") {
        queryBuilder = queryBuilder
          .leftJoin("product.reviews", "review")
          .groupBy("product.id")
          .having("AVG(review.rating) = 5");
      }

      // Sorting based on popular parameter (number of reviews)
      if (popular === "popular") {
        queryBuilder = queryBuilder
          .leftJoin("product.reviews", "review")
          .groupBy("product.id")
          .addOrderBy("COUNT(review.id)", "DESC");
      }

      // Apply more_suitable=suitable filter
      if (more_suitable === "suitable") {
        // Apply combination of discount and popular
        queryBuilder = queryBuilder
          .andWhere("product.discount IS NOT NULL AND product.discount > 0") // Assuming discount is a column in the product entity
          .addOrderBy("reviewCount", "DESC"); // Sort by popularity
      }

      // Apply discount filter
      if (discount === "discount") {
        queryBuilder = queryBuilder.andWhere(
          "product.discount IS NOT NULL AND product.discount > 0"
        );
        queryBuilder = queryBuilder.addOrderBy("product.discount", "DESC");
      }

      const products = await queryBuilder.getMany();

      // Fetch user's profile
      const profileRepository = appDataSource.getRepository(User);
      const userProfile = await profileRepository.findOne({
        where: { id: userIdNumber },
        relations: ["profile", "store_profile"],
      });

      // Fetch all reviews for each product
      const reviewRepository = appDataSource.getRepository(Review);
      const productsWithReviews = await Promise.all(
        products.map(async (product) => {
          // Fetch all reviews for the current product
          const productReviews = await reviewRepository.find({
            where: { product_id: product.id },
          });

          // Calculate average rating for the product
          let totalRating = 0;
          productReviews.forEach((review) => {
            totalRating += review.rating;
          });
          const averageRating =
            productReviews.length > 0 ? totalRating / productReviews.length : 0;

          // Attach BASE_URL to the featured_image
          const updatedProduct = {
            ...product,
            featured_image: product.featured_image
              ? `${BASE_URL}${product.featured_image}`
              : null,
            rating: averageRating.toFixed(1), // Format average rating to one decimal place
            reviews: productReviews.length,
          };

          return updatedProduct;
        })
      );

      // Calculate store rating and total reviews
      let totalStoreRating = 0;
      let totalStoreReviews = 0;
      productsWithReviews.forEach((product) => {
        totalStoreRating += parseFloat(product.rating); // Parse rating to float for summing
        totalStoreReviews += product.reviews;
      });

      const storeRating =
        productsWithReviews.length > 0
          ? (totalStoreRating / productsWithReviews.length).toFixed(1)
          : "0.0";

      res.status(200).json({
        success: true,
        message: "Products retrieved successfully",
        store: {
          store_id: userProfile?.id || null,
          store_name: userProfile?.store_profile?.store_name || null,
          image: userProfile?.store_profile
            ? `${BASE_URL}${userProfile?.store_profile?.store_image}`
            : null,
          store_products: productsWithReviews.length,
          store_rating: storeRating,
          store_reviews: totalStoreReviews,
        },
        products: productsWithReviews,
      });
    } catch (error: any) {
      console.error("Error fetching products:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve products",
        error: error.message,
      });
    }
  }
}
