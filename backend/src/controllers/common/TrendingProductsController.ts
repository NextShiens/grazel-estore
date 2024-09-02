import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { UserInteractionProducts } from "../../entities/UserInteractionProducts";
import { Product } from "../../entities/Product";
import { In } from "typeorm";
import { User } from "../../entities/Users";
import { Category } from "../../entities/Category";
import { Brand } from "../../entities/Brand";
import { Profile } from "../../entities/Profiles";
import { Review } from "../../entities/Review";
import { Offer } from "../../entities/Offer";


const BASE_URL =
  process.env.IMAGE_PATH ||
  "https://api.grazle.co.in/";


export class TrendingProductsController {
  async getTrendingProducts(req: Request, res: Response) {
    try {
      const userInteractionProductsRepo = appDataSource.getRepository(
        UserInteractionProducts
      );

      // Fetch top 10 products with the most interactions
      const trendingProducts = await userInteractionProductsRepo
        .createQueryBuilder("userInteractionProducts")
        .select("userInteractionProducts.product_id")
        .addSelect(
          "COUNT(userInteractionProducts.product_id)",
          "interactionCount"
        )
        .groupBy("userInteractionProducts.product_id")
        .orderBy("interactionCount", "DESC")
        .limit(10)
        .getRawMany();

      // Extract product IDs from the trending products
      const productIds = trendingProducts.map(
        (interaction) => interaction.userInteractionProducts_product_id
      );

      // Fetch product details
      const productRepo = appDataSource.getRepository(Product);
      const products = await productRepo.find({
        where: { id: In(productIds) },
      });

      // Fetch related entities: User, Category, Brand, Profile
      const userIds = products.map((product) => product.user_id);
      const categoryIds = products.map((product) => product.category_id);
      const brandIds = products.map((product) => product.brand_id);
      const offerIds = products.map((product) => product.offer_id);

      // Fetch users, categories, brands, and profiles excluding password field
      const userRepository = appDataSource.getRepository(User);
      const categoryRepository = appDataSource.getRepository(Category);
      const brandRepository = appDataSource.getRepository(Brand);
      const profileRepository = appDataSource.getRepository(Profile);
      const reviewRepository = appDataSource.getRepository(Review);
      const offerRepository = appDataSource.getRepository(Offer);

      const [users, categories, brands, profiles, offers] = await Promise.all([
        userRepository.find({
          where: { id: In(userIds) },
          select: ["id", "username", "email", "created_at", "updated_at"],
          relations: ["profile"],
        }),
        categoryRepository.find({
          where: { id: In(categoryIds) },
        }),
        brandRepository.find({
          where: { id: In(brandIds) },
        }),
        profileRepository.find({
          where: { id: In(userIds) },
        }),
        offerRepository.find({
          where: { id: In(offerIds) },
        }),
      ]);

      // Fetch and calculate reviews for each product
      const productsWithDetails = await Promise.all(
        products.map(async (product) => {
          const reviews = await reviewRepository.find({
            where: { product_id: product.id },
          });

          const totalReviews = reviews.length;
          const averageRating =
            totalReviews > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                totalReviews
              : 0;

          const user = users.find((user) => user.id === product.user_id);
          const category = categories.find(
            (category) => category.id === product.category_id
          );
          const brand = brands.find((brand) => brand.id === product.brand_id);
          const offer = offers.find((offer) => offer.id === product.offer_id);
          const userProfile = profiles.find(
            (profile) => profile.id === product.user_id
          );

          return {
            ...product,

            featured_image: product.featured_image
            ? `${BASE_URL}${product.featured_image}`
            : null,

            rating: averageRating.toFixed(1),
            reviews: totalReviews,
            user: {
              ...user,
              profile: userProfile, // Attach profile to user object
            },
            category,
            brand,
            offer,
          };
        })
      );

      res.status(200).json({
        products: productsWithDetails,
        success: true,
        message: "Trending products fetched successfully!",
      });
    } catch (error: any) {
      console.error("Error in getTrendingProducts:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getFirstMostTrendingCategoryProduct(req: Request, res: Response) {
    try {
      const userInteractionProductsRepo = appDataSource.getRepository(
        UserInteractionProducts
      );

      // Fetch the category with the most interactions
      const trendingCategory = await userInteractionProductsRepo
        .createQueryBuilder("userInteractionProducts")
        .leftJoinAndSelect("userInteractionProducts.product", "product")
        .select("product.category_id")
        .addSelect("COUNT(userInteractionProducts.id)", "interactionCount")
        .groupBy("product.category_id")
        .orderBy("interactionCount", "DESC")
        .limit(1)
        .getRawOne();

      if (!trendingCategory) {
        return res.status(404).json({
          success: false,
          message: "No trending category found",
        });
      }

      const categoryId = trendingCategory.product_category_id;

      // Fetch the category details
      const categoryRepository = appDataSource.getRepository(Category);
      const category = await categoryRepository.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Trending category not found",
        });
      }

      // Fetch products in the trending category
      const productRepo = appDataSource.getRepository(Product);
      const products = await productRepo.find({
        where: { category_id: categoryId },
      });

      // Fetch related entities: User, Brand, Profile
      const userIds = products.map((product) => product.user_id);
      const brandIds = products.map((product) => product.brand_id);
      const categoryIds = products.map((product) => product.category_id);
      const offerIds = products.map((product) => product.offer_id);

      // Fetch users, brands, and profiles excluding password field
      const userRepository = appDataSource.getRepository(User);
      const brandRepository = appDataSource.getRepository(Brand);
      const profileRepository = appDataSource.getRepository(Profile);
      const reviewRepository = appDataSource.getRepository(Review);
      const offerRepository = appDataSource.getRepository(Offer);

      const [users, brands, categories, profiles, offers] = await Promise.all([
        userRepository.find({
          where: { id: In(userIds) },
          select: ["id", "username", "email"],
          relations: ["profile"],
        }),
        brandRepository.find({
          where: { id: In(brandIds) },
        }),
        categoryRepository.find({
          where: { id: In(categoryIds) },
        }),
        profileRepository.find({
          where: { id: In(userIds) }, // Corrected to match profile by user_id
        }),
        offerRepository.find({
          where: { id: In(offerIds) },
        }),
      ]);

      // Fetch and calculate reviews for each product
      const productsWithDetails = await Promise.all(
        products.map(async (product) => {
          const reviews = await reviewRepository.find({
            where: { product_id: product.id },
          });

          const totalReviews = reviews.length;
          const averageRating =
            totalReviews > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                totalReviews
              : 0;

          const user = users.find((user) => user.id === product.user_id);
          const brand = brands.find((brand) => brand.id === product.brand_id);
          const offer = offers.find((offer) => offer.id === product.offer_id);
          const category = categories.find(
            (category) => category.id === product.category_id
          );
          const userProfile = profiles.find(
            (profile) => profile.id === product.user_id
          );

          return {
            ...product,
            featured_image: product.featured_image
            ? `${BASE_URL}${product.featured_image}`
            : null,

            rating: averageRating.toFixed(1),
            reviews: totalReviews,
            user: {
              ...user,
              profile: userProfile,
            },
            category,
            brand,
            offer,
          };
        })
      );

      res.status(200).json({
        category: category, // Add the category details to the response
        products: productsWithDetails,
        success: true,
        message: "First most trending category products fetched successfully!",
      });
    } catch (error: any) {
      console.error("Error in getFirstMostTrendingCategoryProduct:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getSecondMostTrendingCategoryProducts(req: Request, res: Response) {
    try {
      const userInteractionProductsRepo = appDataSource.getRepository(
        UserInteractionProducts
      );

      // Fetch the top two categories with the most interactions
      const trendingCategories = await userInteractionProductsRepo
        .createQueryBuilder("userInteractionProducts")
        .leftJoinAndSelect("userInteractionProducts.product", "product")
        .select("product.category_id", "category_id")
        .addSelect("COUNT(userInteractionProducts.id)", "interactionCount")
        .groupBy("product.category_id")
        .orderBy("interactionCount", "DESC")
        .limit(2)
        .getRawMany();

      if (trendingCategories.length < 2) {
        return res.status(404).json({
          success: false,
          message: "No second most trending category found",
        });
      }

      const categoryId = trendingCategories[1].category_id;

      const categoryRepository = appDataSource.getRepository(Category);
      const category = await categoryRepository.findOne({
        where: { id: categoryId },
      });

      // Fetch products in the second trending category
      const productRepo = appDataSource.getRepository(Product);
      const products = await productRepo.find({
        where: { category_id: categoryId },
      });

      // Fetch related entities: User, Brand, Profile
      const userIds = products.map((product) => product.user_id);
      const brandIds = products.map((product) => product.brand_id);
      const categoryIds = products.map((product) => product.category_id);
      const offerIds = products.map((product) => product.offer_id);

      // Fetch users, brands, and profiles excluding password field
      const userRepository = appDataSource.getRepository(User);
      const brandRepository = appDataSource.getRepository(Brand);
      const profileRepository = appDataSource.getRepository(Profile);
      const reviewRepository = appDataSource.getRepository(Review);
      const offerRepository = appDataSource.getRepository(Offer);

      const [users, brands, categories, profiles, offers] = await Promise.all([
        userRepository.find({
          where: { id: In(userIds) },
          select: ["id", "username", "email"],
          relations: ["profile"],
        }),
        brandRepository.find({
          where: { id: In(brandIds) },
        }),
        categoryRepository.find({
          where: { id: In(categoryIds) },
        }),
        profileRepository.find({
          where: { id: In(userIds) },
        }),
        offerRepository.find({
          where: { id: In(offerIds) },
        }),
      ]);

      // Fetch and calculate reviews for each product
      const productsWithDetails = await Promise.all(
        products.map(async (product) => {
          const reviews = await reviewRepository.find({
            where: { product_id: product.id },
          });

          const totalReviews = reviews.length;
          const averageRating =
            totalReviews > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                totalReviews
              : 0;

          const user = users.find((user) => user.id === product.user_id);
          const brand = brands.find((brand) => brand.id === product.brand_id);
          const offer = offers.find((offer) => offer.id === product.offer_id);
          const category = categories.find(
            (category) => category.id === product.category_id
          );
          const userProfile = profiles.find(
            (profile) => profile.id === product.user_id
          );

          return {
            ...product,
            featured_image: product.featured_image
            ? `${BASE_URL}${product.featured_image}`
            : null,

            user: {
              ...user,
              profile: userProfile, // Attach profile to user object
            },
            brand,
            category,
            offer,
            rating: averageRating.toFixed(1),
            reviews: totalReviews,
          };
        })
      );

      res.status(200).json({
        category: category,
        products: productsWithDetails,
        success: true,
        message: "Second most trending category products fetched successfully!",
      });
    } catch (error: any) {
      console.error("Error in getSecondMostTrendingCategoryProducts:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
}
