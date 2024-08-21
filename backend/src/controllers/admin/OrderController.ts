import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Order } from "../../entities/Order";
import { Product } from "../../entities/Product";
import { Address } from "../../entities/Address";
import { format } from "date-fns";
import { Category } from "../../entities/Category";
import { Brand } from "../../entities/Brand";
import { User } from "../../entities/Users";
import { IPaginationOptions, paginate } from "nestjs-typeorm-paginate";
import { sendOrderStatusUpdateEmail } from "../../services/emailService";
import { OrderStatusHistory } from "../../entities/OrderHistory";
import { sendPushNotification } from "../../services/notificationService";
import { UserDeviceToken } from "../../entities/UserDeviceToken";

const omitSensitiveUserInfo = (user: any) => {
  const userCopy = { ...user };
  delete userCopy.password;
  delete userCopy.created_at;
  delete userCopy.updated_at;
  if (userCopy.profile) {
    delete userCopy.profile.created_at;
    delete userCopy.profile.updated_at;
  }
  return userCopy;
};

const omitTimestamps = (order: Order) => {
  const { created_at, updated_at, ...rest } = order;
  return rest;
};

const BASE_URL = process.env.IMAGE_PATH || "https://api.grazle.co.in/";

export class AdminOrderController {
  async getAllOrders(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status } = req.query;

      const orderRepo = appDataSource.getRepository(Order);

      let queryBuilder = orderRepo
        .createQueryBuilder("order")
        .leftJoinAndSelect("order.orderProducts", "orderProduct")
        .leftJoinAndSelect("orderProduct.product", "product")
        .leftJoinAndSelect("order.status_history", "statusHistory")
        .orderBy("order.created_at", "DESC");

      const validStatuses = [
        "new",
        "in_progress",
        "shipped",
        "completed",
        "cancelled",
      ];
      if (status && validStatuses.includes(status as string)) {
        queryBuilder.andWhere("statusHistory.status = :status", { status });
      }

      const options: IPaginationOptions = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      const paginatedOrders = await paginate(queryBuilder, options);

      const groupedOrders: any[] = [];

      for (const order of paginatedOrders.items) {
        const userRepo = appDataSource.getRepository(User);
        const user = await userRepo.findOne({
          where: {
            id: order.user_id,
          },
          relations: ["profile", "store_profile"],
        });
        if (!user) {
          continue;
        }

        const groupedOrder: any = {
          id: order.id,
          reference_id: order.reference_id,
          customer: {
            id: user.id,
            name: user.username,
            email: user.email,
            image: user.profile?.image
              ? `${BASE_URL}${user.profile.image}`
              : null,
          },
          customer_address: null,
          payment_type: order.payment_type,
          coupon_code: order.coupon_code,
          discount: order.discount,
          date: format(new Date(order.date), "MMMM d, yyyy"),
          payment: order.payment,
          transaction_id: order.transaction_id,
          products: [],
        };

        const addressRepo = appDataSource.getRepository(Address);
        const customer_address = await addressRepo.findOne({
          where: {
            id: order.address_id,
          },
        });

        if (customer_address) {
          groupedOrder.customer_address = {
            id: customer_address?.id,
            address: customer_address?.address,
            address_label: customer_address?.address_label,
            recipient_name: customer_address?.recipient_name,
            recipient_phone: customer_address?.recipient_phone,
          };
        }

        for (const orderProduct of order.orderProducts) {
          const product = orderProduct.product;

          if (product) {
            const userRepo = appDataSource.getRepository(User);
            const user = await userRepo.findOne({
              where: {
                id: product.user_id,
              },
              relations: ["profile"],
            });

            const categoryRepo = appDataSource.getRepository(Category);
            const category = await categoryRepo.findOne({
              where: {
                id: product.category_id,
              },
            });

            const brandRepo = appDataSource.getRepository(Brand);
            const brand = await brandRepo.findOne({
              where: {
                id: product.brand_id,
              },
            });

            groupedOrder.products.push({
              id: product.id,
              title: product.title,
              user_id: product.user_id,
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
              seller: {
                id: user?.id,
                name: user?.username,
                email: user?.email,
                store_name: user?.store_profile
                  ? user?.store_profile.store_name
                  : null,
                store_image: user?.store_profile
                  ? `${BASE_URL}${user.store_profile.store_image}`
                  : null,
              },
              category: {
                id: category?.id,
                name: category?.name,
                slug: category?.slug,
                image: category?.image ? `${BASE_URL}${category.image}` : null,
                description: category?.description,
              },
              brand: {
                id: brand?.id,
                name: brand?.name,
                slug: brand?.slug,
              },
            });
          }
        }

        groupedOrders.push(groupedOrder);
      }

      res.status(200).json({
        orders: groupedOrders,
        success: true,
        message: "Orders fetched successfully for the user",
        meta: paginatedOrders.meta,
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
        relations: ["orderProducts", "orderProducts.product"],
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
      const productRepo = appDataSource.getRepository(Product);
      const userRepo = appDataSource.getRepository(User);

      // Format the date for all orders and fetch related entities
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const orderProductsWithDetails = await Promise.all(
            order.orderProducts.map(async (orderProduct) => {
              const product = orderProduct.product;

              if (!product) {
                console.error(`Product not found for order ID: ${order.id}`);
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

              if (!category || !brand) {
                console.error(
                  `Missing related entity for product ID: ${product.id}`
                );
                return null;
              }

              return {
                ...product,
                featured_image: product.featured_image
                  ? BASE_URL + product.featured_image // Add BASE_URL to featured_image
                  : null,
                seller: {
                  id: user?.id,
                  name: user?.username,
                  email: user?.email,
                  store_name: user?.store_profile
                    ? user?.store_profile?.store_name
                    : null,
                  store_image: user?.store_profile
                    ? BASE_URL + user?.store_profile?.store_image // Add BASE_URL to store_image
                    : null,
                },
                category: {
                  id: category.id,
                  name: category.name,
                  image: category.image
                    ? BASE_URL + category.image // Add BASE_URL to category image
                    : null,
                  slug: category.slug,
                  description: category.description,
                },
                brand: {
                  id: brand.id,
                  name: brand.name,
                  slug: brand.slug,
                },
              };
            })
          );

          // Filter out any null entries (errors)
          const filteredProductsWithDetails = orderProductsWithDetails.filter(
            (product) => product !== null
          );

          // Fetch customer (user) details
          const customer = await userRepo.findOne({
            where: { id: order.user_id },
            relations: ["profile"],
          });

          const customer_address = await addressRepo.findOne({
            where: { id: order.address_id },
          });

          // Format the date to "June 14, 2024"
          const formattedDate = format(new Date(order.date), "MMMM d, yyyy");

          return {
            ...omitTimestamps(order),
            date: formattedDate,
            customer: {
              id: customer?.id,
              email: customer?.email,
              username: customer?.username,
              image: customer?.profile?.image
                ? BASE_URL + customer?.profile?.image
                : null, // Add BASE_URL to customer image
            },
            customer_address: {
              id: customer_address?.id,
              address: customer_address?.address,
              address_label: customer_address?.address_label,
              note: customer_address?.note,
              recipient_name: customer_address?.recipient_name,
              recipient_phone: customer_address?.recipient_phone,
            },
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
        relations: ["orderProducts", "orderProducts.product"],
      });

      if (!order) {
        return res.status(404).json({
          error: "Order not found",
          success: false,
          message: "Order not found with the provided ID",
        });
      }

      const addressRepo = appDataSource.getRepository(Address);
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
            relations: ["profile"],
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
            featured_image: product.featured_image
              ? BASE_URL + product.featured_image // Add BASE_URL to featured_image
              : null,
            seller: {
              id: user?.id,
              name: user?.username,
              email: user?.email,
              store_name: user?.store_profile
                ? user?.store_profile?.store_name
                : null,
              store_image: user?.store_profile
                ? BASE_URL + user?.store_profile?.store_image // Add BASE_URL to store_image
                : null,
            },
            category: {
              id: category.id,
              name: category.name,
              image: category.image
                ? BASE_URL + category.image // Add BASE_URL to category image
                : null,
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

      // Fetch customer (user) details
      const customer = await userRepo.findOne({
        where: { id: order.user_id },
        relations: ["profile"],
      });

      const customer_address = await addressRepo.findOne({
        where: { id: order.address_id },
      });

      // Format the date to "MMMM d, yyyy"
      const formattedDate = format(new Date(order.date), "MMMM d, yyyy");

      res.status(200).json({
        order: {
          ...omitTimestamps(order),
          date: formattedDate,
          customer: {
            id: customer?.id,
            email: customer?.email,
            username: customer?.username,
            image: customer?.profile.image
              ? BASE_URL + customer?.profile.image
              : null, // Add BASE_URL to customer image
          },
          customer_address: {
            id: customer_address?.id,
            address: customer_address?.address,
            address_label: customer_address?.address_label,
            note: customer_address?.note,
            recipient_name: customer_address?.recipient_name,
            recipient_phone: customer_address?.recipient_phone,
          },
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

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = [
        "new",
        "in_progress",
        "shipped",
        "completed",
        "cancelled",
        "return",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid status",
          success: false,
          message:
            "Status must be one of 'new', 'shipped','in_progress', 'cancelled' or 'completed'",
        });
      }

      const orderRepo = appDataSource.getRepository(Order);
      const statusHistoryRepo = appDataSource.getRepository(OrderStatusHistory);
      const deviceTokenRepo = appDataSource.getRepository(UserDeviceToken);

      // Fetch the order to update
      const order = await orderRepo.findOne({
        where: { id: parseInt(id, 10) },
      });

      if (!order) {
        return res.status(404).json({
          error: "Order not found",
          success: false,
          message: "Order not found with the provided ID",
        });
      }

      // Update the status of the order
      // order.status = status;
      // await orderRepo.save(order);

      order.updated_at = new Date(); // Update the updated_at timestamp

      const cancelledStatusHistory = new OrderStatusHistory();
      cancelledStatusHistory.status = status;
      cancelledStatusHistory.changed_at = new Date();
      cancelledStatusHistory.order = order;

      await statusHistoryRepo.save(cancelledStatusHistory);
      await orderRepo.save(order);

      // Send email notification
      const userRepo = appDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: order.user_id } });
      if (user && user.email) {
        await sendOrderStatusUpdateEmail(
          user.email,
          order.reference_id,
          status
        );
      }

      // Convert user_id to string if necessary
      const userId = user?.id?.toString();

      if (userId) {
        // Find the device token for the user
        const deviceTokenRecord = await deviceTokenRepo.findOne({
          where: { user_id: userId },
        });

        if (deviceTokenRecord) {
          const token = deviceTokenRecord.device_token;

          // Determine push notification message based on status
          let notificationTitle = "Order Status Update";
          let notificationMessage = "";

          switch (status) {
            case "new":
              notificationMessage = `Your order with ID ${order.tracking_id} has been placed successfully.`;
              break;
            case "shipped":
              notificationMessage = `Your order with ID ${order.tracking_id} has been shipped.`;
              break;
            case "in_progress":
              notificationMessage = `Your order with ID ${order.tracking_id} is currently in progress.`;
              break;
            case "completed":
              notificationMessage = `Your order with ID ${order.tracking_id} has been completed.`;
              break;
            case "cancelled":
              notificationMessage = `Your order with ID ${order.tracking_id} has been cancelled.`;
              break;
            case "return":
              notificationMessage = `Your order with ID ${order.tracking_id} is being returned.`;
              break;
            default:
              notificationMessage = `Your order with ID ${order.tracking_id} has been updated.`;
          }

          // Send push notification
          await sendPushNotification(
            token,
            notificationTitle,
            notificationMessage,
            { orderId: order.tracking_id }
          );
        } else {
          // No device token found
          console.log("No device token found for user:", userId);
        }
      }

      res.status(200).json({
        order: omitTimestamps(order),
        success: true,
        message: "Order status updated successfully",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  }
}
