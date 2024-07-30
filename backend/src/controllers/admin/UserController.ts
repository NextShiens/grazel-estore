import { Request, Response } from "express";
import { validationResult } from "express-validator";
const bcrypt = require("bcrypt");
import fs from "fs";
import path from "path";
import { User } from "../../entities/Users";
import { appDataSource } from "../../config/db";
import { Profile } from "../../entities/Profiles";
import { paginate } from "nestjs-typeorm-paginate";
import { Product } from "../../entities/Product";
import { Category } from "../../entities/Category";
import { StoreProfile } from "../../entities/StoreProfile";
import { sendStoreProfileStatusEmail } from "../../services/emailService";
import { Order } from "../../entities/Order";
import { OrderProduct } from "../../entities/OrderProduct";

const BASE_URL =
  process.env.IMAGE_PATH ||
  "https://ecommerce-backend-api-production-84b3.up.railway.app/api/";

interface MulterRequest extends Request {
  file?: {
    path: string;
    filename: string;
  };
}

// Utility function to omit sensitive fields
const omitSensitiveFields = (user: User) => {
  const { password, created_at, updated_at, ...rest } = user;
  return rest;
};

export class UserController {
  async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, role } = req.query;

      const userRepository = appDataSource.getRepository(User);

      let queryBuilder = userRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.profile", "profile")
        .leftJoinAndSelect("user.userHasRole", "userHasRole")
        .leftJoin("userHasRole.role", "role");

      // Apply role filter if provided
      if (role === "buyer" || role === "seller") {
        queryBuilder = queryBuilder.where("role.name = :role", { role });
      }

      // Add order by created_at in descending order
      queryBuilder = queryBuilder.orderBy("user.created_at", "DESC");

      const pagination = await queryBuilder
        .take(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .getManyAndCount();

      const usersWithoutSensitiveFields = pagination[0].map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        active: user.active,
        score: user.score,
        created_at: user.created_at,
        updated_at: user.updated_at,
        profile: {
          id: user.profile.id,
          first_name: user.profile.first_name,
          last_name: user.profile.last_name,
          phone: user.profile.phone,
          country: user.profile.country,
          city: user.profile.city,
          state: user.profile.state,
          address: user.profile.address,
          active: user.profile.active,
          // Check if image exists before adding the full URL
          image: user.profile.image ? `${BASE_URL}${user.profile.image}` : null,
          created_at: user.profile.created_at,
          updated_at: user.profile.updated_at,
        },
        // Add other required fields as needed
      }));

      res.status(200).json({
        users: usersWithoutSensitiveFields,
        total: pagination[1],
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(pagination[1] / Number(limit)),
        success: true,
        message: "Users fetched successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userRepository = appDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["profile"],
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
          success: false,
          message: "User not found with the provided ID",
        });
      }

      const userWithoutSensitiveFields = {
        id: user.id,
        username: user.username,
        email: user.email,
        active: user.active,
        score: user.score,
        is_deleted: user.is_deleted,
        profile: {
          id: user.profile.id,
          first_name: user.profile.first_name,
          last_name: user.profile.last_name,
          phone: user.profile.phone,
          country: user.profile.country,
          city: user.profile.city,
          state: user.profile.state,
          address: user.profile.address,
          active: user.profile.active,
          // Check if image exists before adding the full URL
          image: user.profile.image ? `${BASE_URL}${user.profile.image}` : null,
          created_at: user.profile.created_at,
          updated_at: user.profile.updated_at,
        },
      };

      res.status(200).json({
        user: userWithoutSensitiveFields,
        success: true,
        message: "User Details fetched successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch user",
        error: error.message,
      });
    }
  }

 

  // async getSellerDetailWithProductsById(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;

  //     // Fetch the user details including the profile and store_profile
  //     const userRepository = appDataSource.getRepository(User);
  //     const user = await userRepository.findOne({
  //       where: { id: parseInt(id) },
  //       relations: ["profile", "store_profile"],
  //     });

  //     if (!user) {
  //       return res.status(404).json({
  //         error: "User not found",
  //         success: false,
  //         message: "User not found with the provided ID",
  //       });
  //     }

  //     // Fetch products associated with the user, including gallery images
  //     const productRepository = appDataSource.getRepository(Product);
  //     let products = await productRepository.find({
  //       where: { user_id: parseInt(id) },
  //       relations: ["gallery"],
  //     });

  //     // Fetch all categories
  //     const categoryRepository = appDataSource.getRepository(Category);
  //     const allCategories = await categoryRepository.find();

  //     // Fetch total orders for the seller
  //     const orderProductRepository = appDataSource.getRepository(OrderProduct);
  //     const totalOrders = await orderProductRepository
  //       .createQueryBuilder("orderProduct")
  //       .leftJoin("orderProduct.product", "product")
  //       .where("product.user_id = :userId", { userId: parseInt(id) })
  //       .getCount();

  //     // Fetch total completed orders for the seller
  //     const totalCompletedOrders = await orderProductRepository
  //       .createQueryBuilder("orderProduct")
  //       .leftJoin("orderProduct.order", "order")
  //       .leftJoin("orderProduct.product", "product")
  //       .leftJoin("order.status_history", "statusHistory")
  //       .where("product.user_id = :userId", { userId: parseInt(id) })
  //       .andWhere("statusHistory.status = :status", { status: "completed" })
  //       .getCount();

  //     // Fetch total cancelled orders for the seller
  //     const totalCancelledOrders = await orderProductRepository
  //       .createQueryBuilder("orderProduct")
  //       .leftJoin("orderProduct.order", "order")
  //       .leftJoin("orderProduct.product", "product")
  //       .leftJoin("order.status_history", "statusHistory")
  //       .where("product.user_id = :userId", { userId: parseInt(id) })
  //       .andWhere("statusHistory.status = :status", { status: "cancelled" })
  //       .getCount();

  //     // Fetch total sales for the seller
  //     const completedOrderProducts = await orderProductRepository
  //       .createQueryBuilder("orderProduct")
  //       .leftJoinAndSelect("orderProduct.order", "order")
  //       .leftJoin("orderProduct.product", "product")
  //       .leftJoin("order.status_history", "statusHistory")
  //       .where("product.user_id = :userId", { userId: parseInt(id) })
  //       .andWhere("statusHistory.status = :status", { status: "completed" })
  //       .getMany();

  //     const totalSales = completedOrderProducts.reduce(
  //       (sum, orderProduct) => sum + orderProduct.price * orderProduct.quantity,
  //       0
  //     );

  //     // Calculate cancellation rate
  //     const totalCompletedAndCancelledOrders =
  //       totalCompletedOrders + totalCancelledOrders;
  //     const cancellationRate =
  //       totalCompletedAndCancelledOrders > 0
  //         ? (totalCancelledOrders / totalCompletedAndCancelledOrders) * 100
  //         : 0;

  //     // Modify user profile image URL
  //     if (user.profile && user.profile.image) {
  //       user.profile.image = `${BASE_URL}${user.profile.image}`;
  //     }

  //     // Attach store_profile if it exists
  //     const storeProfile = user.store_profile
  //       ? {
  //           id: user.id,
  //           store_name: user.store_profile.store_name,
  //           store_image: user.store_profile.store_image
  //             ? `${BASE_URL}${user.store_profile.store_image}`
  //             : null,
  //           store_description: user.store_profile.store_description,
  //           account_name: user.store_profile.account_name,
  //           account_number: user.store_profile.account_number,
  //           bank_name: user.store_profile.bank_name,
  //           bank_code: user.store_profile.bank_code,
  //           business_license: user.store_profile.business_license
  //             ? `${BASE_URL}${user.store_profile.business_license}`
  //             : null,
  //           tax_id: user.store_profile.tax_id
  //             ? `${BASE_URL}${user.store_profile.tax_id}`
  //             : null,
  //           proof_of_address: user.store_profile.proof_of_address
  //             ? `${BASE_URL}${user.store_profile.proof_of_address}`
  //             : null,
  //           active: user.store_profile.active,
  //           created_at: user.store_profile.created_at,
  //           updated_at: user.store_profile.updated_at,
  //         }
  //       : null;

  //     // Map gallery images to products and attach baseProductImageUrl
  //     products = products.map((product) => {
  //       product.gallery = product.gallery.map((image) => ({
  //         ...image,
  //         image: `${BASE_URL}${image.image}`,
  //       }));

  //       // Attach base URL to featured_image if it exists
  //       if (product.featured_image) {
  //         product.featured_image = `${BASE_URL}${product.featured_image}`;
  //       }

  //       // Find category details and attach baseCategoryImageUrl
  //       const category = allCategories.find(
  //         (cat) => cat.id === product.category_id
  //       );

  //       return {
  //         ...product,
  //         category: category
  //           ? {
  //               id: category?.id,
  //               name: category?.name,
  //               slug: category?.slug,
  //               image: category?.image ? `${BASE_URL}${category?.image}` : null,
  //               description: category?.description,
  //               active: category?.active,
  //               created_at: category?.created_at,
  //               updated_at: category?.updated_at,
  //             }
  //           : null,
  //       };
  //     });

  //     // Omit sensitive fields from user if needed
  //     const userWithoutSensitiveFields = omitSensitiveFields(user);

  //     res.status(200).json({
  //       user: {
  //         ...userWithoutSensitiveFields,
  //         store_profile: storeProfile,
  //       },
  //       products: products,
  //       analytics: {
  //         total_orders: totalOrders,
  //         // total_completed_orders: totalCompletedOrders,
  //         // total_cancelled_orders: totalCancelledOrders,
  //         total_sales: totalSales,
  //         return_rate: `${cancellationRate}%`,
  //       },
  //       success: true,
  //       message: "Seller details with products fetched successfully",
  //     });
  //   } catch (error: any) {
  //     res.status(500).json({
  //       success: false,
  //       message: "Failed to fetch seller with products",
  //       error: error.message,
  //     });
  //   }
  // }

  async getSellerDetailWithProductsById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Fetch the user details including the profile and store_profile
      const userRepository = appDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["profile", "store_profile"],
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
          success: false,
          message: "User not found with the provided ID",
        });
      }

      // Fetch products associated with the user, including gallery images
      const productRepository = appDataSource.getRepository(Product);
      let products = await productRepository.find({
        where: { user_id: parseInt(id) },
        relations: ["gallery", "reviews"],
      });

      // Fetch all categories
      const categoryRepository = appDataSource.getRepository(Category);
      const allCategories = await categoryRepository.find();

      // Fetch total orders for the seller
      const orderProductRepository = appDataSource.getRepository(OrderProduct);
      const totalOrders = await orderProductRepository
        .createQueryBuilder("orderProduct")
        .leftJoin("orderProduct.product", "product")
        .where("product.user_id = :userId", { userId: parseInt(id) })
        .getCount();

      // Fetch total completed orders for the seller
      const totalCompletedOrders = await orderProductRepository
        .createQueryBuilder("orderProduct")
        .leftJoin("orderProduct.order", "order")
        .leftJoin("orderProduct.product", "product")
        .leftJoin("order.status_history", "statusHistory")
        .where("product.user_id = :userId", { userId: parseInt(id) })
        .andWhere("statusHistory.status = :status", { status: "completed" })
        .getCount();

      // Fetch total cancelled orders for the seller
      const totalCancelledOrders = await orderProductRepository
        .createQueryBuilder("orderProduct")
        .leftJoin("orderProduct.order", "order")
        .leftJoin("orderProduct.product", "product")
        .leftJoin("order.status_history", "statusHistory")
        .where("product.user_id = :userId", { userId: parseInt(id) })
        .andWhere("statusHistory.status = :status", { status: "cancelled" })
        .getCount();

      // Fetch total sales for the seller
      const completedOrderProducts = await orderProductRepository
        .createQueryBuilder("orderProduct")
        .leftJoinAndSelect("orderProduct.order", "order")
        .leftJoin("orderProduct.product", "product")
        .leftJoin("order.status_history", "statusHistory")
        .where("product.user_id = :userId", { userId: parseInt(id) })
        .andWhere("statusHistory.status = :status", { status: "completed" })
        .getMany();

      const totalSales = completedOrderProducts.reduce(
        (sum, orderProduct) => sum + orderProduct.price * orderProduct.quantity,
        0
      );

      // Calculate cancellation rate
      const totalCompletedAndCancelledOrders =
        totalCompletedOrders + totalCancelledOrders;
      const cancellationRate =
        totalCompletedAndCancelledOrders > 0
          ? (totalCancelledOrders / totalCompletedAndCancelledOrders) * 100
          : 0;

      // Calculate total_rating and total_reviews
      let totalRating = 0;
      let totalReviews = 0;

      products.forEach(product => {
        product.reviews.forEach(review => {
          totalRating += review.rating;
        });
        totalReviews += product.reviews.length;
      });

      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      // Modify user profile image URL
      if (user.profile && user.profile.image) {
        user.profile.image = `${BASE_URL}${user.profile.image}`;
      }

      // Attach store_profile if it exists
      const storeProfile = user.store_profile
        ? {
            id: user.id,
            store_name: user.store_profile.store_name,
            store_image: user.store_profile.store_image
              ? `${BASE_URL}${user.store_profile.store_image}`
              : null,
            store_description: user.store_profile.store_description,
            account_name: user.store_profile.account_name,
            account_number: user.store_profile.account_number,
            bank_name: user.store_profile.bank_name,
            bank_code: user.store_profile.bank_code,
            business_license: user.store_profile.business_license
              ? `${BASE_URL}${user.store_profile.business_license}`
              : null,
            tax_id: user.store_profile.tax_id
              ? `${BASE_URL}${user.store_profile.tax_id}`
              : null,
            proof_of_address: user.store_profile.proof_of_address
              ? `${BASE_URL}${user.store_profile.proof_of_address}`
              : null,
            active: user.store_profile.active,
            created_at: user.store_profile.created_at,
            updated_at: user.store_profile.updated_at,
          }
        : null;

      // Map gallery images to products and attach baseProductImageUrl
      products = products.map((product) => {
        product.gallery = product.gallery.map((image) => ({
          ...image,
          image: `${BASE_URL}${image.image}`,
        }));

        // Attach base URL to featured_image if it exists
        if (product.featured_image) {
          product.featured_image = `${BASE_URL}${product.featured_image}`;
        }

        // Find category details and attach baseCategoryImageUrl
        const category = allCategories.find(
          (cat) => cat.id === product.category_id
        );

        return {
          ...product,
          category: category
            ? {
                id: category?.id,
                name: category?.name,
                slug: category?.slug,
                image: category?.image ? `${BASE_URL}${category?.image}` : null,
                description: category?.description,
                active: category?.active,
                created_at: category?.created_at,
                updated_at: category?.updated_at,
              }
            : null,
        };
      });

      // Omit sensitive fields from user if needed
      const userWithoutSensitiveFields = omitSensitiveFields(user);

      res.status(200).json({
        user: {
          ...userWithoutSensitiveFields,
          store_profile: storeProfile,
        },
        products: products,
        analytics: {
          total_orders: totalOrders,
          total_sales: totalSales,
          return_rate: `${cancellationRate}%`,
          total_rating: totalRating,
          total_reviews: totalReviews,
          average_rating: averageRating.toFixed(2),
        },
        success: true,
        message: "Seller details with products fetched successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch seller with products",
        error: error.message,
      });
    }
  }


  async create(req: Request, res: Response) {
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

      const { username, email, password } = req.body;
      const userRepository = appDataSource.getRepository(User);

      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "This email is already registered!",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User();
      newUser.username = username;
      newUser.email = email;
      newUser.password = hashedPassword;

      newUser.profile = new Profile();

      const user = await userRepository.save(newUser);

      const userWithoutSensitiveFields = omitSensitiveFields(user);

      res.status(201).json({
        user: userWithoutSensitiveFields,
        success: true,
        message: "User created successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to create user",
        error: error.message,
      });
    }
  }

  async update(req: MulterRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { username, email, ...profileFields } = req.body;
      const profileImage = req.file
        ? `/bucket/user/${req.file.filename}`
        : null;

      const updatedUserFields: Partial<User> = {};
      if (username) updatedUserFields.username = username;
      if (email) updatedUserFields.email = email;

      const userRepository = appDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["profile"],
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
          success: false,
          message: "User not found with the provided ID",
        });
      }

      Object.assign(user, updatedUserFields);

      if (Object.keys(profileFields).length > 0 && user.profile) {
        Object.assign(user.profile, profileFields);
      }

      if (profileImage) {
        if (user.profile.image) {
          const oldImagePath = path.join(
            __dirname,
            "../../bucket/user",
            path.basename(user.profile.image)
          );
          try {
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
              console.log("Old image deleted successfully");
            } else {
              console.log("Old image does not exist");
            }
          } catch (err) {
            console.error("Failed to delete old image:", err);
          }
        }
        user.profile.image = profileImage;
      }

      await userRepository.save(user);

      const userWithoutSensitiveFields = omitSensitiveFields(user);

      res.status(201).json({
        user: userWithoutSensitiveFields,
        success: true,
        message: "User updated successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to update user",
        error: error.message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userRepository = appDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: parseInt(id) },
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
          success: false,
          message: "User not found with the provided ID",
        });
      }

      await userRepository.remove(user);
      const userWithoutSensitiveFields = omitSensitiveFields(user);

      res.status(201).json({
        user: userWithoutSensitiveFields,
        success: true,
        message: "User deleted successfully!",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to delete user",
        error: error.message,
      });
    }
  }

  async getAllSellerWithStoreDetails(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, active } = req.query;

      const userRepository = appDataSource.getRepository(User);

      let queryBuilder = userRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.profile", "profile")
        .leftJoinAndSelect("user.userHasRole", "userHasRole")
        .leftJoinAndSelect("userHasRole.role", "role")
        .leftJoinAndSelect("user.store_profile", "store_profile")
        .where("role.name = :role", { role: "seller" });

      // Apply active filter if provided
      if (active !== undefined) {
        queryBuilder = queryBuilder.andWhere("store_profile.active = :active", {
          active: active,
        });
      }

      queryBuilder = queryBuilder.orderBy("user.created_at", "DESC");

      const [users, total] = await queryBuilder
        .take(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .getManyAndCount();

      const usersWithoutSensitiveFields = users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        active: user.active,
        score: user.score,
        created_at: user.created_at,
        updated_at: user.updated_at,
        profile: {
          id: user.profile.id,
          first_name: user.profile.first_name,
          last_name: user.profile.last_name,
          phone: user.profile.phone,
          country: user.profile.country,
          city: user.profile.city,
          state: user.profile.state,
          address: user.profile.address,
          active: user.profile.active,
          image: user.profile.image ? `${BASE_URL}${user.profile.image}` : null,
          created_at: user.profile.created_at,
          updated_at: user.profile.updated_at,
        },
        store_profile: user.store_profile
          ? {
              id: user.id,
              store_name: user.store_profile.store_name,
              store_image: user.store_profile.store_image
                ? `${BASE_URL}${user.store_profile.store_image}`
                : null,
              store_description: user.store_profile.store_description,
              account_name: user.store_profile.account_name,
              account_number: user.store_profile.account_number,
              bank_name: user.store_profile.bank_name,
              bank_code: user.store_profile.bank_code,
              active: user.store_profile.active,
              created_at: user.store_profile.created_at,
              updated_at: user.store_profile.updated_at,
            }
          : null,
      }));

      res.status(200).json({
        sellers: usersWithoutSensitiveFields,
        total: total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
        success: true,
        message: "Sellers fetched successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch sellers",
        error: error.message,
      });
    }
  }

  async toggleSellerStoreActive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Log when the function is called
      console.log(`toggleSellerStoreActive called for user ID: ${id}`);

      const userRepository = appDataSource.getRepository(User);
      const storeProfileRepository = appDataSource.getRepository(StoreProfile);

      // Fetch the user and related store profile
      const user = await userRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["store_profile"],
      });

      // Check if the user and store profile exist
      if (!user || !user.store_profile) {
        return res.status(404).json({
          success: false,
          message: "User or store profile not found",
        });
      }

      // Toggle the active status
      user.store_profile.active = !user.store_profile.active;

      // Save the updated store profile
      const updatedStoreProfile = await storeProfileRepository.save(
        user.store_profile
      );
      // Send email notification to user
      await sendStoreProfileStatusEmail(user.email, updatedStoreProfile.active);
      console.log(
        `Store profile status email sent successfully to ${user.email}`
      );

      res.status(200).json({
        success: true,
        message: `Seller's store profile ${
          updatedStoreProfile.active ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to toggle seller's store profile active/inactive",
      });
    }
  }
}
