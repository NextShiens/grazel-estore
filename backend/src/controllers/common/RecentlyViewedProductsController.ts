import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Product } from "../../entities/Product";
import { RecentlyViewed } from "../../entities/RecentlyViewed";
import { validationResult } from "express-validator";
import { In } from "typeorm";
import { User } from "../../entities/Users";
import { Brand } from "../../entities/Brand";
import { Category } from "../../entities/Category";

const BASE_URL =
  process.env.IMAGE_PATH ||
  "https://ecommerce-backend-api-production-84b3.up.railway.app/api/";

export class RecentlyViewedController {
  async logProductView(req: Request, res: Response) {
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

      const { product_id } = req.body;

      const recentlyViewedRepo = appDataSource.getRepository(RecentlyViewed);

      const recentlyViewed = new RecentlyViewed();
      recentlyViewed.user_id = userId;
      recentlyViewed.product_id = product_id;

      await recentlyViewedRepo.save(recentlyViewed);

      res.status(201).json({
        success: true,
        message: "Recent Viewed Log added successfully!",
      });
    } catch (error: any) {
      console.error("Error in logProductView:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getRecentlyViewed(req: Request, res: Response) {
    try {
      const getUser = (req as any).user;
      const userId = getUser.id;
      const recentlyViewedRepo = appDataSource.getRepository(RecentlyViewed);

      // Fetch recently viewed products with their associated user_ids, category_ids, and brand_ids
      const recentlyViewed = await recentlyViewedRepo.find({
        where: { user: { id: userId } },
        relations: ["product"],
        order: { created_at: "DESC" },
        take: 10, // Limit to the last 10 viewed products
      });

      // Extract unique product IDs from recently viewed products using a Set
      const productIds = Array.from(
        new Set(recentlyViewed.map((view) => view.product_id))
      );

      // Check if there are any productIds
      if (productIds.length === 0) {
        return res.status(200).json({
          products: [],
          success: true,
          message: "No recently viewed products found!",
        });
      }

      // Fetch products based on product IDs
      const productRepo = appDataSource.getRepository(Product);
      const products = await productRepo.find({
        where: { id: In(productIds) },
      });

      // Extract unique user IDs, category IDs, and brand IDs from products
      const userIds = Array.from(
        new Set(products.map((product) => product.user_id))
      );
      const categoryIds = Array.from(
        new Set(products.map((product) => product.category_id))
      );
      const brandIds = Array.from(
        new Set(products.map((product) => product.brand_id))
      );

      // Fetch users, categories, and brands based on their IDs
      const userRepo = appDataSource.getRepository(User);
      const categoryRepo = appDataSource.getRepository(Category);
      const brandRepo = appDataSource.getRepository(Brand);

      const users = await userRepo
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.profile", "profile")
        .where("user.id IN (:...userIds)", { userIds })
        .getMany();

      const categories = await categoryRepo.find({
        where: { id: In(categoryIds) },
      });

      const brands = await brandRepo.find({
        where: { id: In(brandIds) },
      });

      // Map recently viewed products with their associated user, category, and brand details
      const RecentViewedProducts = products.map((product) => {
        const user = users.find((u) => u.id === product.user_id);
        const category = categories.find((c) => c.id === product.category_id);
        const brand = brands.find((b) => b.id === product.brand_id);

        return {
          ...product,
          featured_image: `${BASE_URL}${product.featured_image}`,
          gallery: product.gallery.map((image) => ({
            ...image,
            image: `${BASE_URL}${image.image}`,
          })),
          user: user
            ? {
                id: user.id,
                username: user.username,
                email: user.email,
                profile: user.profile
                  ? {
                      id: user.profile.id,
                      first_name: user.profile.first_name,
                      last_name: user.profile.last_name,
                      phone: user.profile.phone,
                      country: user.profile.country,
                      city: user.profile.city,
                      state: user.profile.state,
                      address: user.profile.address,
                      active: user.profile.active,
                      image: user.profile.image
                        ? `${BASE_URL}${user.profile.image}`
                        : null,
                      created_at: user.profile.created_at,
                      updated_at: user.profile.updated_at,
                    }
                  : null,
              }
            : null,
          brand: brand,
          category: {
            id: category?.id,
            name: category?.name,
            slug: category?.slug,
            image: category?.image ? `${BASE_URL}${category?.image}` : null,
            description: category?.description,
          },
        };
      });

      res.status(200).json({
        products: RecentViewedProducts,
        success: true,
        message: "Recently viewed products fetched successfully!",
      });
    } catch (error: any) {
      console.error("Error in getRecentlyViewed:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getProductsByIds(req: Request, res: Response) {
    try {
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

      let { product_ids } = req.body;

      // Check if product_ids is a string (from form-data) and convert it to an array
      if (typeof product_ids === "string") {
        product_ids = product_ids
          .split(",")
          .map((id) => parseInt(id.trim(), 10));
      }

      // Check if product_ids is an array and contains only numbers
      if (!Array.isArray(product_ids) || product_ids.some(isNaN)) {
        return res
          .status(400)
          .json({ message: "Product IDs should be an array of numbers" });
      }

      const productRepo = appDataSource.getRepository(Product);
      const products = await productRepo.find({
        where: { id: In(product_ids) },
      });

      const userIds = products.map((product) => product.user_id);
      const userRepo = appDataSource.getRepository(User);

      // Fetch users with profiles
      const users = await userRepo
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.profile", "profile")
        .where("user.id IN (:...userIds)", { userIds })
        .getMany();

      // Fetch brands and categories based on product data
      const brandIds = products.map((product) => product.brand_id);
      const categoryIds = products.map((product) => product.category_id);

      const brandRepo = appDataSource.getRepository(Brand);
      const categoryRepo = appDataSource.getRepository(Category);

      const brands = await brandRepo.find({
        where: { id: In(brandIds) },
      });

      const categories = await categoryRepo.find({
        where: { id: In(categoryIds) },
      });

      // Map products with associated user, brand, and category information
      const productsWithDetails = products.map((product) => {
        const user = users.find((user) => user.id === product.user_id);
        const brand = brands.find((brand) => brand.id === product.brand_id);
        const category = categories.find(
          (category) => category.id === product.category_id
        );

        return {
          ...product,
          user: user
            ? {
                id: user.id,
                username: user.username,
                email: user.email,
                profile: user.profile,
              }
            : null,
          brand: brand,
          category: category,
        };
      });

      res.status(200).json({
        products: productsWithDetails,
        success: true,
        message: "Recently viewed products by guest user fetched successfully!",
      });
    } catch (error: any) {
      console.error("Error in getProductsByIds:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
}
