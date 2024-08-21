import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { User } from "../../entities/Users";
import { appDataSource } from "../../config/db";
import { Product } from "../../entities/Product";
import { Review } from "../../entities/Review";
import { ReviewImage } from "../../entities/ReviewImage";
import { paginate } from "nestjs-typeorm-paginate";


const BASE_URL =
  process.env.IMAGE_PATH ||
  "https://api.grazle.co.in/";


export class ReviewController {
  async createReview(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;

      // Validation Error Handling
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const result = errors.mapped();

        const formattedErrors: Record<string, string[]> = {};
        for (const key in result) {
          formattedErrors[key.charAt(0).toLowerCase() + key.slice(1)] = [
            result[key].msg,
          ];
        }

        const errorCount = Object.keys(result).length;
        const errorSuffix =
          errorCount > 1
            ? ` (and ${errorCount - 1} more error${errorCount > 2 ? "s" : ""})`
            : "";

        const errorResponse = {
          success: false,
          message: `${result[Object.keys(result)[0]].msg}${errorSuffix}`,
          errors: formattedErrors,
        };

        return res.status(400).json(errorResponse);
      }

      const { product_id, rating, comment } = req.body;

      const userRepository = appDataSource.getRepository(User);
      const productRepository = appDataSource.getRepository(Product);
      const reviewRepository = appDataSource.getRepository(Review);
      const reviewImageRepository = appDataSource.getRepository(ReviewImage);

      const userEntity = await userRepository.findOneBy({ id: userId });
      const productEntity = await productRepository.findOneBy({
        id: product_id,
      });

      if (!userEntity || !productEntity) {
        return res.status(400).json({ error: "User or product not found" });
      }

      const review = reviewRepository.create({
        user_id: userId,
        product_id,
        rating,
        comment,
      });

      const savedReview = await reviewRepository.save(review);
      console.log("🚀 ~ ReviewController ~ createReview ~ savedReview:", savedReview)

      // Ensure files are handled correctly
      let images: string[] = [];
      if (Array.isArray((req as any).files)) {
        images = (req as any).files.map((file: any) =>
          file.path.replace(/\\/g, "/")
        );
      } else if ((req as any).files && typeof (req as any).files === "object") {
        images = Object.values((req as any).files)
          .flat()
          .map((file: any) => file.path.replace(/\\/g, "/"));
      }

      if (images.length > 0) {
        const galleryEntries = images.map((image: string) => {
          const galleryEntry = new ReviewImage();
          galleryEntry.review_id = savedReview.id; // Correctly set the relationship
          galleryEntry.image_url = image;
          return galleryEntry;
        });

        await reviewImageRepository.save(galleryEntries);
      }

      res.status(201).json({
        success: true,
        message: "Review created successfully",
        review: savedReview,
        images: images,
      });
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  }

  async getAllReviews(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const reviewRepository = appDataSource.getRepository(Review);
      const productRepository = appDataSource.getRepository(Product);

      const queryBuilder = reviewRepository
        .createQueryBuilder("review")
        .leftJoinAndSelect("review.images", "images")
        .leftJoinAndSelect("review.product", "product")
        .orderBy("review.created_at", "DESC");

      const pagination = await paginate<Review>(queryBuilder, {
        page: Number(page),
        limit: Number(limit),
      });

      const reviewsWithProducts = await Promise.all(
        pagination.items.map(async (review) => {
          const product = await productRepository.findOne({
            where: { id: review.product_id },
          });
          return {
            ...review,
            product: product ? product : null,
          };
        })
      );

      res.status(200).json({
        success: true,
        message: "All reviews fetched successfully!",
        reviews: reviewsWithProducts,
        total: pagination.meta.totalItems,
        page: pagination.meta.currentPage,
        limit: pagination.meta.itemsPerPage,
        totalPages: pagination.meta.totalPages,
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch reviews" });
    }
  }

  async getReviewById(req: Request, res: Response) {
    try {
      const reviewRepository = appDataSource.getRepository(Review);
      const productRepository = appDataSource.getRepository(Product);

      // Find the review with related images and user
      const review = await reviewRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: ["images"],
      });

      if (!review) {
        return res
          .status(404)
          .json({ success: false, error: "Review not found" });
      }

      // Fetch the product details separately
      const product = await productRepository.findOne({
        where: { id: review.product_id },
        relations: ["gallery"],
      });

      // Include the product details in the review object
      const reviewWithProduct = {
        ...review,
        product: product ? product : null,
      };

      res.status(200).json({
        success: true,
        message: "Review detail fetched successfully!",
        review: reviewWithProduct,
      });
    } catch (error) {
      console.error("Error fetching review:", error);
      res.status(500).json({ success: false, error: "Failed to fetch review" });
    }
  }

  async updateReview(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = (req as any).user;
      const userId = user.id;

      const { rating, comment, images } = req.body;
      const reviewRepository = appDataSource.getRepository(Review);
      const reviewImageRepository = appDataSource.getRepository(ReviewImage);

      let review = await reviewRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: ["images"],
      });

      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }

      if (review.user_id !== userId) {
        return res
          .status(403)
          .json({ error: "You can only update your own reviews" });
      }

      review.rating = rating;
      review.comment = comment;
      review.updated_at = new Date();

      await reviewRepository.save(review);

      if (images && images.length > 0) {
        // Delete old images
        await reviewImageRepository.delete({ review_id: review.id });

        // Save new images
        const reviewImages = images.map((image: string) => {
          return reviewImageRepository.create({
            review_id: review.id,
            image_url: image,
          });
        });

        await reviewImageRepository.save(reviewImages);
      }

      res.status(200).json({
        success: true,
        message: "Review updated successfully",
        review,
      });
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ error: "Failed to update review" });
    }
  }

  async deleteReview(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;

      const reviewRepository = appDataSource.getRepository(Review);
      const review = await reviewRepository.findOneBy({
        id: Number(req.params.id),
      });

      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }

      if (review.user_id !== userId) {
        return res
          .status(403)
          .json({ error: "You can only delete your own reviews" });
      }

      await reviewRepository.remove(review);

      res.status(200).json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ error: "Failed to delete review" });
    }
  }
}
