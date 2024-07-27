import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Order } from "../../entities/Order";
import { format } from "date-fns";
import { Address } from "../../entities/Address";
import { Product } from "../../entities/Product";
import { Category } from "../../entities/Category";
import { Brand } from "../../entities/Brand";
import { User } from "../../entities/Users";
import { IPaginationOptions, paginate } from "nestjs-typeorm-paginate";
import { sendOrderStatusUpdateEmail } from "../../services/emailService";
import { OrderStatusHistory } from "../../entities/OrderHistory";

const omitTimestamps = (order: Order) => {
  const { created_at, updated_at, ...rest } = order;
  return rest;
};

export class SellerOrderController {
  async getAllOrders(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;

      const { status, page = 1, limit = 10 } = req.query;

      const validStatuses = [
        "new",
        "in_progress",
        "shipped",
        "completed",
        "cancelled",
      ];
      if (status && !validStatuses.includes(status as string)) {
        return res.status(400).json({
          error: "Invalid status",
          success: false,
          message:
            "Status must be one of 'new', 'shipped','in_progress', 'cancelled' or 'completed'",
        });
      }

      const orderRepo = appDataSource.getRepository(Order);
      const productRepo = appDataSource.getRepository(Product);
      const userRepo = appDataSource.getRepository(User);
      const addressRepo = appDataSource.getRepository(Address);

      // Fetch products created by the seller
      const products = await productRepo.find({ where: { user_id: userId } });
      const productIds = products.map((product) => product.id);

      if (productIds.length === 0) {
        return res.status(200).json({
          orders: [],
          success: true,
          message: "No orders found for the products created by the seller",
        });
      }

      // Initialize query builder for orders
      let queryBuilder = orderRepo
        .createQueryBuilder("order")
        .innerJoinAndSelect("order.orderProducts", "orderProduct")
        .leftJoinAndSelect("orderProduct.product", "product")
        .leftJoinAndSelect("order.status_history", "statusHistory")
        .where("product.id IN (:...productIds)", { productIds })
        .orderBy("order.created_at", "DESC"); // Sorting by created_at DESC

      // Filter by status if provided
      if (status) {
        queryBuilder.andWhere("statusHistory.status = :status", { status });
      }

      // Define pagination options
      const options: IPaginationOptions = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      // Paginate orders
      const paginatedOrders = await paginate(queryBuilder, options);

      // Format orders with required details including customer/user details and product categories
      const formattedOrders = await Promise.all(
        paginatedOrders.items.map(async (order) => {
          // Fetch customer/user details
          const customer = await userRepo.findOne({
            where: { id: order.user_id },
            relations: ["profile"],
          });

          // Fetch customer address details
          const customerAddress = await addressRepo.findOne({
            where: { id: order.address_id },
          });

          return {
            id: order.id,
            reference_id: order.reference_id,
            user_id: order.user_id,
            customer: {
              username: customer?.username,
              email: customer?.email,
              image: customer?.profile?.image,
            },
            customer_address: {
              address: customerAddress?.address,
              address_label: customerAddress?.address,
              note: customerAddress?.note,
              recipient_name: customerAddress?.recipient_name,
              recipient_phone: customerAddress?.recipient_phone,
              primary_location: customerAddress?.primary_location,
            },
            address_id: order.address_id,
            payment_type: order.payment_type,
            coupon_code: order.coupon_code,
            discount: order.discount,
            date: format(new Date(order.date), "MMMM d, yyyy"),
            payment: order.payment,
            transaction_id: order.transaction_id,
            products: order.orderProducts.map((orderProduct) => ({
              id: orderProduct.product.id,
              title: orderProduct.product.title,
              category_id: orderProduct.product.category_id, // Assuming category_id is a field in Product entity
              brand_id: orderProduct.product.brand_id,
              slug: orderProduct.product.slug,
              featured_image: orderProduct.product.featured_image,
              price: orderProduct.product.price,
              description: orderProduct.product.description,
              tags: orderProduct.product.tags,
              gallery: orderProduct.product.gallery,
              quantity: orderProduct.quantity, // Add quantity here
            })),
          };
        })
      );

      res.status(200).json({
        orders: formattedOrders,
        success: true,
        message: "Orders fetched successfully for the seller",
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
        relations: ["orderProducts", "status_history", "orderProducts.product"],
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
                quantity: orderProduct.quantity,

                category: {
                  id: category.id,
                  name: category.name,
                  image: category.image,
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
            orderProducts: filteredProductsWithDetails,
            customer: {
              id: customer?.id,
              email: customer?.email,
              username: customer?.username,
              image: customer?.profile.image,
            },
            customer_address: {
              id: customer_address?.id,
              address: customer_address?.address,
              address_label: customer_address?.address_label,
              note: customer_address?.note,
              recipient_name: customer_address?.recipient_name,
              recipient_phone: customer_address?.recipient_phone,
            },
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
        relations: ["orderProducts", "status_history", "orderProducts.product"],
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
            quantity: orderProduct.quantity, // Attach quantity here
            user: {
              id: user.id,
              email: user.email,
              profile: user.profile,
            },
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
            image: customer?.profile.image,
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
      const { status, expected_delivery_date } = req.body;

      const validStatuses = [
        "new",
        "shipped",
        "in_progress",
        "completed",
        "cancelled",
        "return",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid status",
          success: false,
          message:
            "Status must be one of 'new','in_progress','shipped', 'cancelled' or 'completed'",
        });
      }

      const orderRepo = appDataSource.getRepository(Order);
      const statusHistoryRepo = appDataSource.getRepository(OrderStatusHistory);

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

      order.updated_at = new Date(); // Update the updated_at timestamp
      order.expected_delivery_date = expected_delivery_date;

      const cancelledStatusHistory = new OrderStatusHistory();
      cancelledStatusHistory.status = status;
      cancelledStatusHistory.changed_at = new Date();
      cancelledStatusHistory.order = order;

      await statusHistoryRepo.save(cancelledStatusHistory);
      await orderRepo.save(order);

      // await orderRepo.save(order);

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

      res.status(200).json({
        order: {
          id: order.id,
          reference_id: order.reference_id,
          user_id: order.user_id,
          address_id: order.address_id,
          payment_type: order.payment_type,
          coupon_code: order.coupon_code,
          discount: order.discount,
          date: order.date,
          payment: order.payment,
          transaction_id: order.transaction_id,
          // status: order.status,
        },
        success: true,
        message: "Order status updated successfully",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  }
}
