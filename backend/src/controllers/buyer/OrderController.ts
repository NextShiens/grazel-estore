import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Order } from "../../entities/Order";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import { Product } from "../../entities/Product";
import { Address } from "../../entities/Address";
import { format } from "date-fns";
import { Category } from "../../entities/Category";
import { Brand } from "../../entities/Brand";
import { User } from "../../entities/Users";
import { IPaginationOptions, paginate } from "nestjs-typeorm-paginate";
import { sendOrderCancellationEmailToSeller } from "../../services/emailService";
import { OrderProduct } from "../../entities/OrderProduct";
import { OrderStatusHistory } from "../../entities/OrderHistory";

const omitTimestamps = (order: Order) => {
  const { created_at, updated_at, ...rest } = order;
  return rest;
};

const BASE_URL =
  process.env.IMAGE_PATH ||
  "https://ecommerce-backend-api-production-84b3.up.railway.app/api/";

const omitSensitiveUserInfo = (order: any) => {
  // Create a shallow copy of the order object
  const orderCopy = { ...order };

  // Check if the 'user' property exists and remove sensitive fields if present
  if (orderCopy.user) {
    delete orderCopy.user.password;
    delete orderCopy.user.created_at;
    delete orderCopy.user.updated_at;
  }

  return orderCopy;
};

function generateTrackingId(): string {
  const uuid = uuidv4();
  // Take the first 8 characters of the UUID
  const truncatedUuid = uuid.replace(/-/g, "").substring(0, 8);
  return `TRK-${truncatedUuid}`;
}

export class OrderController {
  // async createOrder(req: Request, res: Response) {
  //   const user = (req as any).user;
  //   const userId = user.id;

  //   // Validation Error Handling
  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
  //     const result = errors.mapped();

  //     const formattedErrors: Record<string, string[]> = {};
  //     for (const key in result) {
  //       formattedErrors[key.charAt(0).toLowerCase() + key.slice(1)] = [
  //         result[key].msg,
  //       ];
  //     }

  //     const errorCount = Object.keys(result).length;
  //     const errorSuffix =
  //       errorCount > 1
  //         ? ` (and ${errorCount - 1} more error${errorCount > 2 ? "s" : ""})`
  //         : "";

  //     const errorResponse = {
  //       success: false,
  //       message: `${result[Object.keys(result)[0]].msg}${errorSuffix}`,
  //       errors: formattedErrors,
  //     };

  //     return res.status(400).json(errorResponse);
  //   }

  //   const {
  //     address_id,
  //     payment_type,
  //     quantities,
  //     coupon_code,
  //     discount,
  //     status = "new",
  //     payment,
  //     transaction_id,
  //     product_ids,
  //   } = req.body;

  //   const referenceId = uuidv4();
  //   const date = new Date();
  //   const trackingId = generateTrackingId();

  //   try {
  //     // Create a new order instance
  //     const orderRepository = appDataSource.getRepository(Order);
  //     const order = new Order();
  //     order.user_id = userId;
  //     order.date = date;
  //     order.address_id = address_id;
  //     order.reference_id = referenceId;
  //     order.payment_type = payment_type;
  //     order.coupon_code = coupon_code || null;
  //     order.discount = discount || null;
  //     order.tracking_id = trackingId;
  //     order.payment = payment;
  //     order.transaction_id = transaction_id;

  //     // Save the order to get the generated order id
  //     await orderRepository.save(order);

  //     // Create initial order status history
  //     const statusHistoryRepository =
  //       appDataSource.getRepository(OrderStatusHistory);
  //     const statusHistory = new OrderStatusHistory();
  //     statusHistory.status = status;
  //     statusHistory.order = order;
  //     await statusHistoryRepository.save(statusHistory);

  //     // Handle order products
  //     const orderProducts: OrderProduct[] = [];

  //     // Split product_ids and quantities into arrays
  //     const productIdArray = product_ids
  //       .split(",")
  //       .map((id: string) => parseInt(id.trim(), 10));
  //     const quantityArray = quantities
  //       .split(",")
  //       .map((qty: string) => parseInt(qty.trim(), 10));

  //     // Fetch products from the database and create OrderProduct entries
  //     const productRepository = appDataSource.getRepository(Product);

  //     for (let i = 0; i < productIdArray.length; i++) {
  //       const productId = productIdArray[i];
  //       const quantity = quantityArray[i];

  //       // Fetch product by productId
  //       const product = await productRepository.findOne({
  //         where: { id: productId },
  //       });

  //       if (!product) {
  //         return res
  //           .status(404)
  //           .json({ message: `Product with id ${productId} not found` });
  //       }

  //       const orderProduct = new OrderProduct();
  //       orderProduct.order = order;
  //       orderProduct.product = product;
  //       orderProduct.quantity = quantity;
  //       orderProduct.price = product.price;

  //       orderProducts.push(orderProduct);
  //     }

  //     // Save all order products
  //     const orderProductRepository = appDataSource.getRepository(OrderProduct);
  //     await orderProductRepository.save(orderProducts);

  //     // Fetch the order with its related order products
  //     const savedOrder = await orderRepository.findOne({
  //       where: { id: order.id },
  //       relations: ["orderProducts", "orderProducts.product", "status_history"],
  //     });

  //     // Respond with the created order
  //     res.status(201).json({
  //       success: true,
  //       message: "Order Placed Successfully",
  //       order: savedOrder,
  //     });
  //   } catch (error) {
  //     console.error("Error creating order:", error);
  //     res.status(500).json({ message: "Failed to create order" });
  //   }
  // }

  async createOrder(req: Request, res: Response) {
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

    const {
      address_id,
      payment_type,
      quantities,
      prices,
      coupon_code,
      discount,
      status = "new",
      payment,
      transaction_id,
      product_ids,
    } = req.body;

    // Ensure product_ids and quantities are present
    if (!product_ids || !quantities) {
      return res.status(400).json({
        success: false,
        message: "product_ids and quantities are required",
      });
    }

    const referenceId = uuidv4();
    const date = new Date();
    const trackingId = generateTrackingId();

    try {
      // Create a new order instance
      const orderRepository = appDataSource.getRepository(Order);
      const order = new Order();
      order.user_id = userId;
      order.date = date;
      order.address_id = address_id;
      order.reference_id = referenceId;
      order.payment_type = payment_type;
      order.coupon_code = coupon_code || null;
      order.discount = discount || null;
      order.tracking_id = trackingId;
      order.payment = payment;
      order.transaction_id = transaction_id;

      // Save the order to get the generated order id
      await orderRepository.save(order);

      // Create initial order status history
      const statusHistoryRepository =
        appDataSource.getRepository(OrderStatusHistory);
      const statusHistory = new OrderStatusHistory();
      statusHistory.status = status;
      statusHistory.order = order;
      await statusHistoryRepository.save(statusHistory);

      // Handle order products
      const orderProducts: OrderProduct[] = [];

      // Split product_ids and quantities into arrays
      const productIdArray = product_ids
        .split(",")
        .map((id: string) => parseInt(id.trim(), 10));
      const quantityArray = quantities
        .split(",")
        .map((qty: string) => parseInt(qty.trim(), 10));
      const priceArray = prices
        .split(",")
        .map((qty: string) => parseInt(qty.trim(), 10));

      // Fetch products from the database and create OrderProduct entries
      const productRepository = appDataSource.getRepository(Product);

      for (let i = 0; i < productIdArray.length; i++) {
        const productId = productIdArray[i];
        const quantity = quantityArray[i];
        const price = priceArray[i];

        // Fetch product by productId
        const product = await productRepository.findOne({
          where: { id: productId },
        });

        if (!product) {
          return res
            .status(404)
            .json({ message: `Product with id ${productId} not found` });
        }

        const orderProduct = new OrderProduct();
        orderProduct.order = order;
        orderProduct.product = product;
        orderProduct.quantity = quantity;
        orderProduct.price = price;

        orderProducts.push(orderProduct);
      }

      // Save all order products
      const orderProductRepository = appDataSource.getRepository(OrderProduct);
      await orderProductRepository.save(orderProducts);

      // Fetch the order with its related order products
      const savedOrder = await orderRepository.findOne({
        where: { id: order.id },
        relations: ["orderProducts", "orderProducts.product", "status_history"],
      });

      // Respond with the created order
      res.status(201).json({
        success: true,
        message: "Order Placed Successfully",
        order: savedOrder,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "internal server error" });
    }
  }

  async getAllOrders(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;

      const { page = 1, limit = 10, status } = req.query; // Retrieve page, limit, and status query parameters

      const orderRepo = appDataSource.getRepository(Order);

      // Create query builder for fetching orders
      let queryBuilder = orderRepo
        .createQueryBuilder("order")
        .leftJoinAndSelect("order.orderProducts", "orderProduct")
        .leftJoinAndSelect("orderProduct.product", "product")
        .leftJoinAndSelect("order.status_history", "statusHistory")
        .where("order.user_id = :userId", { userId })
        .orderBy("order.created_at", "DESC");

      // Apply status filter if status is provided and valid
      const validStatuses = [
        "new",
        "in_progress",
        "shipped",
        "completed",
        "cancelled",
      ];
      if (status && validStatuses.includes(status as string)) {
        queryBuilder.andWhere("statusHistory.status = :status", { status });
        // queryBuilder = queryBuilder.andWhere("order.status = :status", {  status, });
      }

      // Define pagination options
      const options: IPaginationOptions = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      // Apply pagination
      const paginatedOrders = await paginate(queryBuilder, options);

      // Process and group orders
      const groupedOrders: Record<string, any> = {};

      // Store user and category information to avoid multiple queries for the same entities
      const userCache: Record<string, User> = {};
      const categoryCache: Record<string, Category> = {};
      const brandCache: Record<string, Brand> = {};

      for (const order of paginatedOrders.items) {
        if (!groupedOrders[order.reference_id]) {
          groupedOrders[order.reference_id] = {
            id: order.id,
            reference_id: order.reference_id,
            user_id: order.user_id,
            address_id: order.address_id,
            payment_type: order.payment_type,
            coupon_code: order.coupon_code,
            discount: order.discount,
            date: format(new Date(order.date), "MMMM d, yyyy"),
            payment: order.payment,
            transaction_id: order.transaction_id,
            products: [],
          };
        }

        for (const orderProduct of order.orderProducts) {
          const product = orderProduct.product;
          if (product) {
            // Fetch the user information if not already cached
            if (!userCache[product.user_id]) {
              const userRepo = appDataSource.getRepository(User);
              const fetchedUser = await userRepo.findOne({
                where: { id: product.user_id },
                relations: ["profile", "store_profile"],
              });
              if (fetchedUser) {
                userCache[product.user_id] = fetchedUser;
              }
            }

            // Fetch the category information if not already cached
            if (!categoryCache[product.category_id]) {
              const categoryRepo = appDataSource.getRepository(Category);
              const fetchedCategory = await categoryRepo.findOne({
                where: { id: product.category_id },
              });
              if (fetchedCategory) {
                categoryCache[product.category_id] = fetchedCategory;
              }
            }

            // Fetch the category information if not already cached
            if (!brandCache[product.brand_id]) {
              const brandRepo = appDataSource.getRepository(Brand);
              const fetchedBrand = await brandRepo.findOne({
                where: { id: product.brand_id },
              });
              if (fetchedBrand) {
                brandCache[product.brand_id] = fetchedBrand;
              }
            }

            const productUser = userCache[product.user_id];
            const productCategory = categoryCache[product.category_id];
            const productBrand = brandCache[product.brand_id];

            groupedOrders[order.reference_id].products.push({
              id: product.id,
              title: product.title,
              category_id: product.category_id,
              brand_id: product.brand_id,
              slug: product.slug,
              featured_image: product.featured_image
                ? `${BASE_URL}${product.featured_image}`
                : null,
              price: product.price,
              description: product.description,
              tags: product.tags,
              gallery: product.gallery,
              quantity: orderProduct.quantity,
              user: {
                id: productUser?.id,
                name: productUser?.username,
                email: productUser?.email,
                store_name: productUser?.store_profile
                  ? productUser?.store_profile?.store_name
                  : null,
                store_image: productUser?.store_profile
                  ? `${BASE_URL}${productUser?.store_profile?.store_image}`
                  : null,
                // store: productUser?.profile.store_name,
                // image: productUser?.profile.image,
              },
              category: {
                id: productCategory?.id,
                name: productCategory?.name,
                slug: productCategory?.slug,
                image: productCategory?.image
                  ? `${BASE_URL}${productCategory?.image}`
                  : null,
                description: productCategory?.description,
              },

              brand: {
                id: productBrand?.id,
                name: productBrand?.name,
                slug: productBrand?.slug,
              },
            });
          }
        }
      }

      // Convert groupedOrders object into an array
      const groupedOrdersArray = Object.values(groupedOrders);

      res.status(200).json({
        orders: groupedOrdersArray,
        success: true,
        message: "Orders fetched successfully for the user",
        meta: paginatedOrders.meta, // Pagination metadata
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  }

  async getMultiOrderByRefId(req: Request, res: Response) {
    try {
      const { ref_id } = req.params;
      const orderRepo = appDataSource.getRepository(Order);

      // Fetch all orders with the provided reference_id
      const orders = await orderRepo.find({
        where: { reference_id: ref_id },
        relations: ["orderProducts", "orderProducts.product", "status_history"],
      });

      if (!orders || orders.length === 0) {
        return res.status(404).json({
          error: "Orders not found",
          success: false,
          message: "No orders found with the provided reference ID",
        });
      }

      const addressRepo = appDataSource.getRepository(Address);
      const categoryRepo = appDataSource.getRepository(Category);
      const brandRepo = appDataSource.getRepository(Brand);
      const userRepo = appDataSource.getRepository(User);

      // Format the date for all orders and fetch related entities
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const address = await addressRepo.findOne({
            where: { id: order.address_id },
          });

          const orderProductsWithDetails = await Promise.all(
            order.orderProducts.map(async (orderProduct) => {
              const product = orderProduct.product;

              if (!product) {
                console.error(`Product not found for order ID: ${order.id}`);
                return null;
              }

              const category = await categoryRepo.findOne({
                where: { id: product.category_id },
              });

              const brand = await brandRepo.findOne({
                where: { id: product.brand_id },
              });

              const user = await userRepo.findOne({
                where: { id: product.user_id },
                relations: ["profile", "store_profile"],
              });

              if (!category || !brand || !user) {
                console.error(
                  `Missing related entity for product ID: ${product.id}`
                );
                return null;
              }

              return {
                ...product,
                featured_image: product.featured_image
                  ? `${BASE_URL}${product.featured_image}`
                  : null,
                user: {
                  id: user.id,
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
                },
                store_profile: user.store_profile
                  ? {
                      store_id: user?.store_profile.id,
                      store_name: user.store_profile.store_name,
                      store_image: user.store_profile.store_image
                        ? `${BASE_URL}${user.store_profile.store_image}`
                        : null,
                    }
                  : null,
                category: {
                  id: category.id,
                  name: category.name,
                  image: category.image,
                  description: category.description,
                },
                brand: {
                  id: brand.id,
                  name: brand.name,
                },
              };
            })
          );

          // Filter out any null entries (errors)
          const filteredProductsWithDetails = orderProductsWithDetails.filter(
            (product) => product !== null
          );

          // Format the date to "June 14, 2024"
          const formattedDate = format(new Date(order.date), "MMMM d, yyyy");

          return {
            ...omitTimestamps(order),
            date: formattedDate,
            address,
            orderProducts: filteredProductsWithDetails,
          };
        })
      );

      // Filter out any null entries (errors)
      const filteredOrdersWithDetails = ordersWithDetails.filter(
        (order) => order !== null
      );

      res.status(200).json({
        orders: filteredOrdersWithDetails,
        success: true,
        message: "Orders fetched successfully by reference ID",
      });
    } catch (error: any) {
      console.error("Error fetching orders:", error.message);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  }

  async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);

      const orderRepo = appDataSource.getRepository(Order);
      const order = await orderRepo.findOne({
        where: { id: parsedId },
        relations: ["orderProducts", "orderProducts.product", "status_history"],
      });

      if (!order) {
        return res.status(404).json({
          error: "Order not found",
          success: false,
          message: "Order not found with the provided ID",
        });
      }

      const addressRepo = appDataSource.getRepository(Address);
      const address = await addressRepo.findOne({
        where: { id: order.address_id },
      });

      const productRepo = appDataSource.getRepository(Product);
      const userRepo = appDataSource.getRepository(User);
      const categoryRepo = appDataSource.getRepository(Category);
      const brandRepo = appDataSource.getRepository(Brand);

      // Fetch and format orderProducts details
      const orderProductsWithDetails = await Promise.all(
        order.orderProducts.map(async (orderProduct) => {
          const product = orderProduct.product;

          if (!product) {
            console.error(
              `Product not found for orderProduct ID: ${orderProduct.id}`
            );
            return null;
          }

          const user = await userRepo.findOne({
            where: { id: product.user_id },
            relations: ["profile", "store_profile"],
          });

          const category = await categoryRepo.findOne({
            where: { id: product.category_id },
          });

          const brand = await brandRepo.findOne({
            where: { id: product.brand_id },
          });

          if (!user || !category || !brand) {
            console.error(
              `Missing related entity for product ID: ${product.id}`
            );
            return null;
          }

          return {
            ...product,
            user: {
              id: user.id,
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
            },
            store_profile: user.store_profile
              ? {
                  store_id: user?.store_profile.id,
                  store_name: user.store_profile.store_name,
                  store_image: user.store_profile.store_image
                    ? `${BASE_URL}${user.store_profile.store_image}`
                    : null,
                }
              : null,

            category: {
              id: category.id,
              name: category.name,
              image: category.image,
              description: category.description,
            },
            brand: {
              id: brand.id,
              name: brand.name,
            },
          };
        })
      );

      // Filter out any null entries (errors)
      const filteredProductsWithDetails = orderProductsWithDetails.filter(
        (product) => product !== null
      );

      // Format the date to "MMMM d, yyyy"
      const formattedDate = format(new Date(order.date), "MMMM d, yyyy");

      res.status(200).json({
        order: {
          ...omitTimestamps(order),
          date: formattedDate,
          address,
          orderProducts: filteredProductsWithDetails,
        },
        success: true,
        message: "Order details fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  }

  async cancelOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const orderRepo = appDataSource.getRepository(Order);
      const statusHistoryRepo = appDataSource.getRepository(OrderStatusHistory);

      // Fetch the order to update
      const order = await orderRepo.findOne({
        where: { id: parseInt(id, 10) },
      });

      const userRepo = appDataSource.getRepository(User);
      const status = "cancelled";

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found with the provided ID",
        });
      }

      order.updated_at = new Date(); // Update the updated_at timestamp

      const cancelledStatusHistory = new OrderStatusHistory();
      cancelledStatusHistory.status = status;
      cancelledStatusHistory.changed_at = new Date();
      cancelledStatusHistory.order = order;

      await statusHistoryRepo.save(cancelledStatusHistory);
      await orderRepo.save(order);

      // Find the user by ID
      const user = await userRepo.findOne({
        where: { id: order.user_id },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found for the provided order",
        });
      }

      // Send email notification to seller about order cancellation
      if (user.email) {
        await sendOrderCancellationEmailToSeller(
          user.email,
          order.reference_id
        );
      }

      res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to cancel order" });
    }
  }

  async trackOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);

      const orderRepo = appDataSource.getRepository(Order);
      const order = await orderRepo.findOne({
        where: { id: parsedId },
        relations: ["status_history", "orderProducts", "orderProducts.product"],
      });

      if (!order) {
        return res.status(404).json({
          error: "Order not found",
          success: false,
          message: "Order not found with the provided ID",
        });
      }

      const addressRepo = appDataSource.getRepository(Address);
      const address = await addressRepo.findOne({
        where: { id: order.address_id },
      });

      const productRepo = appDataSource.getRepository(Product);
      const userRepo = appDataSource.getRepository(User);
      const categoryRepo = appDataSource.getRepository(Category);
      const brandRepo = appDataSource.getRepository(Brand);

      // Fetch and format orderProducts details
      const orderProductsWithDetails = await Promise.all(
        order.orderProducts.map(async (orderProduct) => {
          const product = orderProduct.product;

          if (!product) {
            console.error(
              `Product not found for orderProduct ID: ${orderProduct.id}`
            );
            return null;
          }

          const user = await userRepo.findOne({
            where: { id: product.user_id },
            relations: ["profile", "store_profile"],
          });

          const category = await categoryRepo.findOne({
            where: { id: product.category_id },
          });

          const brand = await brandRepo.findOne({
            where: { id: product.brand_id },
          });

          if (!user || !category || !brand) {
            console.error(
              `Missing related entity for product ID: ${product.id}`
            );
            return null;
          }

          return {
            ...product,

            user: {
              id: user.id,
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
            },
            store_profile: user.store_profile
              ? {
                  store_id: user?.store_profile.id,
                  store_name: user.store_profile.store_name,
                  store_image: user.store_profile.store_image
                    ? `${BASE_URL}${user.store_profile.store_image}`
                    : null,
                }
              : null,
            category: {
              id: category.id,
              name: category.name,
              image: category.image ? `${BASE_URL}${category.image}` : null,
              description: category.description,
            },
            brand: {
              id: brand.id,
              name: brand.name,
            },
          };
        })
      );

      // Filter out any null entries (errors)
      const filteredProductsWithDetails = orderProductsWithDetails.filter(
        (product) => product !== null
      );

      // Format the date to "MMMM d, yyyy"
      const formattedDate = format(new Date(order.date), "MMMM d, yyyy");

      res.status(200).json({
        order: {
          ...omitTimestamps(order),
          date: formattedDate,

          // address,
          orderProducts: filteredProductsWithDetails,
        },
        success: true,
        message: "Order track details fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "internal server error" });
    }
  }

  async updateOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const orderRepo = appDataSource.getRepository(Order);
      let order = await orderRepo.findOne({ where: { id: parsedId } });

      if (!order) {
        return res.status(404).json({
          error: "Order not found",
          success: false,
          message: "Order not found with the provided ID",
        });
      }

      orderRepo.merge(order, req.body);
      const updatedOrder = await orderRepo.save(order);

      res.status(200).json({
        order: omitTimestamps(updatedOrder),
        success: true,
        message: "Order updated successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  }

  async updatePaymentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { payment_status } = req.body;

      const validStatuses = ["paid", "notpaid"];
      if (!validStatuses.includes(payment_status)) {
        return res.status(400).json({
          error: "Invalid status",
          success: false,
          message: "Status must be one of 'paid', 'notpaid'",
        });
      }

      const orderRepo = appDataSource.getRepository(Order);

      // Fetch the order to update
      let order = await orderRepo.findOne({
        where: { id: parseInt(id, 10) },
      });

      if (!order) {
        return res.status(404).json({
          error: "Order not found",
          success: false,
          message: "Order not found with the provided ID",
        });
      }

      // Update the payment status and timestamp
      order.payment = payment_status;
      order.updated_at = new Date();

      // Save the updated order
      const updatedOrder = await orderRepo.save(order);

      res.status(200).json({
        // order: updatedOrder,
        success: true,
        message: "Order payment status updated successfully",
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  }

  async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      const orderRepo = appDataSource.getRepository(Order);
      const result = await orderRepo.delete(parsedId);

      if (result.affected === 0) {
        return res.status(404).json({
          error: "Order not found",
          success: false,
          message: "Order not found with the provided ID",
        });
      }

      res.status(200).json({
        success: true,
        message: "Order deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete order" });
    }
  }
}
