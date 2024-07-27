import { Between, In, Not } from "typeorm";
import { appDataSource } from "../../config/db";
import { Product } from "../../entities/Product";
import { UserInteractionProducts } from "../../entities/UserInteractionProducts";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { User } from "../../entities/Users";
import { Category } from "../../entities/Category";
import { Brand } from "../../entities/Brand";
import { Profile } from "../../entities/Profiles";
import { Review } from "../../entities/Review";
import { Offer } from "../../entities/Offer";

Profile;
export class SuggestedProductsController {
  async logProductInteraction(req: Request, res: Response) {
    try {
      const getUser = (req as any).user;

      const userId = getUser.id;

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

      const { product_id, interaction_type } = req.body;

      const UserInteractionProductRepo = appDataSource.getRepository(
        UserInteractionProducts
      );

      const productInteraction = new UserInteractionProducts();
      productInteraction.user_id = userId;
      productInteraction.product_id = product_id;
      productInteraction.interaction_type = interaction_type;

      await UserInteractionProductRepo.save(productInteraction);

      res.status(201).json({
        success: true,
        message: "Product interaction Log added successfully!",
      });
    } catch (error: any) {
      console.error("Error in ProductInteractionLog:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getSuggestedProducts(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const userInteractionProductsRepo = appDataSource.getRepository(
        UserInteractionProducts
      );

      // Fetch products the user has interacted with
      const userInteractions = await userInteractionProductsRepo.find({
        where: { user_id: userId },
        relations: ["product"],
      });

      // Validate userInteractions and ensure price values are numeric
      const validInteractions = userInteractions.filter(
        (interaction) =>
          interaction.product && typeof interaction.product.price === "string"
      );

      if (validInteractions.length === 0) {
        // Handle case where no valid interactions found
        return res.status(200).json({
          success: false,
          message: "Suggested Products Not found",
        });
      }

      if (validInteractions.length === 0) {
        // Handle case where no valid interactions found
        return res.status(200).json({
          success: false,
          message: "Suggested Products Not found",
        });
      }

      // Calculate min and max prices
      const minPrice = Math.min(
        ...validInteractions.map((interaction) => interaction.product.price)
      );
      const maxPrice = Math.max(
        ...validInteractions.map((interaction) => interaction.product.price)
      );

      const productRepo = appDataSource.getRepository(Product);

      // Fetch products that the user hasn't interacted with
      const suggestedProducts = await productRepo.find({
        where: {
          id: Not(
            In(validInteractions.map((interaction) => interaction.product.id))
          ),
          category_id: In(
            validInteractions.map(
              (interaction) => interaction.product.category_id
            )
          ),
          brand_id: In(
            validInteractions.map((interaction) => interaction.product.brand_id)
          ),
          price: Between(minPrice, maxPrice),
        },
        take: 10,
      });

      if (suggestedProducts.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No suggested products found",
          products: [],
        });
      }

      // Fetch related entities: User, Category, Brand, Profile
      const userIds = suggestedProducts.map((product) => product.user_id);
      const categoryIds = suggestedProducts.map(
        (product) => product.category_id
      );
      const brandIds = suggestedProducts.map((product) => product.brand_id);
      const offerIds = suggestedProducts.map((product) => product.offer_id);

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
          select: ["id", "username", "email"],
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

      // Map users, categories, and brands to products
      const productsWithDetails = await Promise.all(
        suggestedProducts.map(async (product) => {
          const user = users.find((user) => user.id === product.user_id);
          const category = categories.find(
            (category) => category.id === product.category_id
          );
          const brand = brands.find((brand) => brand.id === product.brand_id);
          const offer = offers.find((offer) => offer.id === product.offer_id);
          const userProfile = profiles.find(
            (profile) => profile.id === product.user_id
          );

          const reviews = await reviewRepository.find({
            where: { product_id: product.id },
          });

          const totalReviews = reviews.length;
          const averageRating =
            totalReviews > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                totalReviews
              : 0;

          return {
            ...product,
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
        message: "Suggested products fetched successfully!",
      });
    } catch (error: any) {
      console.error("Error in getSuggestedProducts:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getSuggestedProductsForGuest(req: Request, res: Response) {
    try {
      const userInteractionProductsRepo = appDataSource.getRepository(
        UserInteractionProducts
      );

      // Fetch latest 10 interactions from UserInteractionProducts
      const latestInteractions = await userInteractionProductsRepo.find({
        order: { created_at: "DESC" },
        take: 10,
        relations: ["product"],
      });

      // Extract product IDs from latest interactions
      const productIds = latestInteractions.map(
        (interaction) => interaction.product_id
      );

      // Fetch products based on the extracted product IDs
      const productRepo = appDataSource.getRepository(Product);
      const suggestedProducts = await productRepo.find({
        where: { id: In(productIds) },
      });

      // Fetch related entities: User, Category, Brand, Profile
      const userIds = suggestedProducts.map((product) => product.user_id);
      const categoryIds = suggestedProducts.map(
        (product) => product.category_id
      );
      const brandIds = suggestedProducts.map((product) => product.brand_id);
      const offerIds = suggestedProducts.map((product) => product.offer_id);

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
          select: ["id", "username", "email"],
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

      // Map users, categories, and brands to products
      const productsWithDetails = await Promise.all(
        suggestedProducts.map(async (product) => {
          const user = users.find((user) => user.id === product.user_id);
          const category = categories.find(
            (category) => category.id === product.category_id
          );
          const brand = brands.find((brand) => brand.id === product.brand_id);
          const offer = offers.find((offer) => offer.id === product.offer_id);
          const userProfile = profiles.find(
            (profile) => profile.id === product.user_id
          );

          const reviews = await reviewRepository.find({
            where: { product_id: product.id },
          });

          const totalReviews = reviews.length;
          const averageRating =
            totalReviews > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                totalReviews
              : 0;

          return {
            ...product,
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
        products: productsWithDetails,
        success: true,
        message: "Suggested products fetched for guest user successfully!",
      });
    } catch (error: any) {
      console.error("Error in getSuggestedProductsForGuest:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
}
