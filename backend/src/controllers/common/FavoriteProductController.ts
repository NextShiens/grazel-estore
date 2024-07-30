import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Product } from "../../entities/Product";
import { User } from "../../entities/Users";
import { FavoriteProduct } from "../../entities/FavoriteProducts";
import { validationResult } from "express-validator";
import { Brand } from "../../entities/Brand";
import { Category } from "../../entities/Category";
import { ProductsGallery } from "../../entities/productGallery";
import { Review } from "../../entities/Review";
import { Offer } from "../../entities/Offer";

const BASE_URL =
  process.env.IMAGE_PATH ||
  "https://ecommerce-backend-api-production-84b3.up.railway.app/api/";

export class FavoriteProductController {
  async toggleProductFavorite(req: Request, res: Response) {
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

      const { product_id } = req.body;

      const userRepository = appDataSource.getRepository(User);
      const productRepository = appDataSource.getRepository(Product);
      const favoriteProductRepository =
        appDataSource.getRepository(FavoriteProduct);

      const userEntity = await userRepository.findOne({
        where: { id: userId },
      });
      const productEntity = await productRepository.findOne({
        where: { id: product_id },
      });

      if (!userEntity || !productEntity) {
        return res.status(404).json({
          success: false,
          message: "User or Product not found",
        });
      }

      // Using findOne with where clause to explicitly match user and product IDs
      const existingFavorite = await favoriteProductRepository.findOne({
        where: {
          user: { id: userEntity.id },
          product: { id: productEntity.id },
        },
      });

      if (existingFavorite) {
        // If the product is already a favorite, remove it
        await favoriteProductRepository.remove(existingFavorite);
        return res.status(200).json({
          success: true,
          message: "Product removed from favorites",
        });
      } else {
        // If the product is not a favorite, add it
        const favoriteProduct = favoriteProductRepository.create({
          user: userEntity,
          product: productEntity,
        });

        await favoriteProductRepository.save(favoriteProduct);
        return res.status(201).json({
          success: true,
          message: "Product marked as favorite",
        });
      }
    } catch (error: any) {
      console.error("Error toggling product favorite:", error.message);
      res.status(500).json({ error: "Failed to toggle product favorite" });
    }
  }

  async getFavoriteProducts(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;

      const favoriteProductRepository =
        appDataSource.getRepository(FavoriteProduct);
      const userRepository = appDataSource.getRepository(User);
      const brandRepository = appDataSource.getRepository(Brand);
      const categoryRepository = appDataSource.getRepository(Category);
      const productGalleryRepository =
        appDataSource.getRepository(ProductsGallery);
      const reviewRepository = appDataSource.getRepository(Review);
      const offerRepository = appDataSource.getRepository(Offer);

      const favoriteProducts = await favoriteProductRepository.find({
        where: { user: { id: userId } },
        relations: ["product"],
        order: {
          created_at: "DESC",
        },
      });

      const productsWithDetails = await Promise.all(
        favoriteProducts.map(async (fav) => {
          const product = fav.product;

          const userEntity = await userRepository.findOne({
            where: { id: product.user_id },
            relations: ["profile"],
          });
          const brandEntity = await brandRepository.findOne({
            where: { id: product.brand_id },
          });
          const categoryEntity = await categoryRepository.findOne({
            where: { id: product.category_id },
          });
          const offerEntity = await offerRepository.findOne({
            where: { id: product.offer_id },
          });
          const productGalleries = await productGalleryRepository.find({
            where: { product: { id: product.id } },
          });

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
            featured_image: product.featured_image
              ? `${BASE_URL}${product.featured_image}`
              : null,

            rating: averageRating.toFixed(1),
            reviews: totalReviews,
            user: userEntity
              ? {
                  id: userEntity.id,
                  username: userEntity.username,
                  email: userEntity.email,
                  active: userEntity.active,
                  profile: userEntity.profile ? userEntity.profile : null,
                }
              : null,
            brand: brandEntity
              ? {
                  id: brandEntity.id,
                  name: brandEntity.name,
                  slug: brandEntity.slug,
                  active: brandEntity.active,
                }
              : null,
            category: categoryEntity
              ? {
                  id: categoryEntity.id,
                  name: categoryEntity.name,
                  slug: categoryEntity.slug,
                  image: categoryEntity.image
                    ? `${BASE_URL}${categoryEntity.image}`
                    : null,
                  description: categoryEntity.description,
                  active: categoryEntity.active,
                }
              : null,

            offer: offerEntity ? offerEntity : null,
            gallery: productGalleries.map((gallery) => ({
              id: gallery.id,
              image: `${BASE_URL}${gallery.image}`,
            })),
          };
        })
      );

      res.status(200).json({
        products: productsWithDetails,
        success: true,
        message: "All favorite products fetched successfully!",
      });
    } catch (error: any) {
      console.error("Error fetching favorite products:", error.message);
      res.status(500).json({ error: "Failed to fetch favorite products" });
    }
  }

  async getFavoriteProductsIds(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;

      const favoriteProductRepository =
        appDataSource.getRepository(FavoriteProduct);

      const favoriteProducts = await favoriteProductRepository.find({
        where: { user: { id: userId } },
        relations: ["product"],
        order: {
          created_at: "DESC",
        },
      });

      // Extract product IDs from favoriteProducts array
      const productIds = favoriteProducts.map(
        (favorite) => favorite.product.id
      );

      res.status(200).json({
        productIds: productIds,
        success: true,
        message: "Favorite product IDs fetched successfully!",
      });
    } catch (error: any) {
      console.error("Error fetching favorite product IDs:", error.message);
      res.status(500).json({ error: "Failed to fetch favorite product IDs" });
    }
  }
}
