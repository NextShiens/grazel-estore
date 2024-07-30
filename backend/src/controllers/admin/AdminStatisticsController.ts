import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { User } from "../../entities/Users";
import { Order } from "../../entities/Order";
import { Role } from "../../entities/Roles";
import { UserHasRole } from "../../entities/UserHasRoles";
import { Between } from "typeorm";
import { OrderProduct } from "../../entities/OrderProduct";
import { Product } from "../../entities/Product";
import { OrderStatusHistory } from "../../entities/OrderHistory";
import { Profile } from "../../entities/Profiles";

export class AdminStatisticsController {
  async getAllBestSellers(req: Request, res: Response) {
    try {
      const userRepo = appDataSource.getRepository(User);

      // Fetching sellers with the count of completed orders against their created products, ordered by the count of orders
      const sellers = await userRepo
        .createQueryBuilder("user")
        .innerJoin(Product, "product", "product.user_id = user.id")
        .innerJoin(
          OrderProduct,
          "orderProduct",
          "orderProduct.product_id = product.id"
        )
        .innerJoin(
          OrderStatusHistory,
          "orderStatusHistory",
          "orderStatusHistory.order_id = orderProduct.order_id AND orderStatusHistory.status = :status",
          { status: "completed" }
        )
        .leftJoin(Profile, "profile", "profile.id = user.id") // Adjust the join condition based on your database schema
        .select([
          "user.id AS seller_id",
          "user.username AS seller_name",
          "user.email AS seller_email",
          "profile.store_name AS seller_store",
          "profile.image AS store_image",
        ])
        .addSelect("COUNT(orderProduct.id)", "sales") // Change alias to 'sales'
        .groupBy("user.id")
        .orderBy("sales", "DESC") // Order by 'sales'
        .take(10) // Limit to 10 sellers
        .getRawMany();

      res.status(200).json({
        success: true,
        data: sellers,
      });
    } catch (error: any) {
      console.error("Error fetching sellers with completed orders:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getRecentOrders(req: Request, res: Response) {
    try {
      const recentOrders = await appDataSource
        .getRepository(Order)
        .createQueryBuilder("order")
        .leftJoinAndSelect("order.user", "user")
        .leftJoinAndSelect("order.orderProducts", "orderProduct")
        .leftJoinAndSelect("orderProduct.product", "product")
        .leftJoinAndSelect("order.status_history", "statusHistory")
        .orderBy("order.created_at", "DESC")
        .limit(10)
        .getMany();

      const ordersWithSellerDetails = await Promise.all(
        recentOrders.map(async (order) => {
          const orderProductsWithSellers = await Promise.all(
            order.orderProducts.map(async (orderProduct) => {
              const seller = await appDataSource
                .getRepository(User)
                .createQueryBuilder("user")
                .innerJoinAndSelect("user.profile", "profile" )
                .innerJoinAndSelect("user.store_profile" , "store_profile")
                .where("user.id = :userId", {
                  userId: orderProduct.product.user_id,
                })
                .getOne();

              return {
                ...orderProduct,
                product: {
                  ...orderProduct.product,
                  seller: seller
                    ? {
                        id: seller.id,
                        first_name: seller.profile.first_name,
                        last_name: seller.profile.last_name,
                        store_name: seller?.store_profile ? seller?.store_profile?.store_name : null,
                        store_image: seller?.store_profile ? seller?.store_profile?.store_image : null,
                        // store_name: seller.profile.store_name,
                      }
                    : null,
                },
              };
            })
          );

          return {
            ...order,
            orderProducts: orderProductsWithSellers,
          };
        })
      );

      return res.status(200).json({
        success: true,
        message: "List of recent orders fetched successfully",
        data: ordersWithSellerDetails,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error fetching recent orders",
        error: error.message,
      });
    }
  }

  async getBuyerStats(req: Request, res: Response) {
    try {
      const roleRepo = appDataSource.getRepository(Role);
      const userRepo = appDataSource.getRepository(User);
      const userHasRoleRepo = appDataSource.getRepository(UserHasRole);

      // Fetch the role with the name "buyer"
      const buyerRole = await roleRepo.findOne({ where: { name: "buyer" } });

      if (!buyerRole) {
        return res.status(404).json({
          success: false,
          message: "Role 'buyer' not found",
        });
      }

      // Count the number of users with the "buyer" role
      const buyerCount = await userHasRoleRepo.count({
        where: { role: { id: buyerRole.id } },
      });

      // Total number of users
      const totalUsersCount = await userRepo.count({
        where: { is_deleted: false },
      });

      // Calculate the percentage of buyers in all users
      const buyerPercentage = (buyerCount / totalUsersCount) * 100;

      // Calculate the number and percentage of new users added in the last 30 days
      const currentDate = new Date();
      const pastDate = new Date();
      pastDate.setDate(currentDate.getDate() - 30);

      const newUsersCount = await userRepo.count({
        where: {
          created_at: Between(pastDate, currentDate),
          is_deleted: false,
        },
      });

      const newUserPercentage = (newUsersCount / totalUsersCount) * 100;

      res.status(200).json({
        success: true,
        total_buyers: buyerCount,
        buyer_percentage: buyerPercentage.toFixed(2),
        last_thirty_days_buyer_percentage: newUserPercentage.toFixed(2),
        message: "Buyer statistics fetched successfully!",
      });
    } catch (error: any) {
      console.error("Error in getBuyerStats:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getSellerStats(req: Request, res: Response) {
    try {
      const roleRepo = appDataSource.getRepository(Role);
      const userRepo = appDataSource.getRepository(User);
      const userHasRoleRepo = appDataSource.getRepository(UserHasRole);

      // Fetch the role with the name "buyer"
      const sellerRole = await roleRepo.findOne({ where: { name: "seller" } });

      if (!sellerRole) {
        return res.status(404).json({
          success: false,
          message: "Role 'seller' not found",
        });
      }

      // Count the number of users with the "buyer" role
      const sellerCount = await userHasRoleRepo.count({
        where: { role: { id: sellerRole.id } },
      });

      // Total number of users
      const totalUsersCount = await userRepo.count({
        where: { is_deleted: false },
      });

      // Calculate the percentage of buyers in all users
      const sellerPercentage = (sellerCount / totalUsersCount) * 100;

      // Calculate the number and percentage of new users added in the last 30 days
      const currentDate = new Date();
      const pastDate = new Date();
      pastDate.setDate(currentDate.getDate() - 30);

      const newUsersCount = await userRepo.count({
        where: {
          created_at: Between(pastDate, currentDate),
          is_deleted: false,
        },
      });

      const newUserPercentage = (newUsersCount / totalUsersCount) * 100;

      res.status(200).json({
        success: true,
        total_sellers: sellerCount,
        seller_Percentage: sellerPercentage.toFixed(2),
        last_thirty_days_seller_percentage: newUserPercentage.toFixed(2),
        message: "Seller statistics fetched successfully!",
      });
    } catch (error: any) {
      console.error("Error in getSellerStats:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getAdminStats(req: Request, res: Response) {
    try {
      const roleRepo = appDataSource.getRepository(Role);
      const userRepo = appDataSource.getRepository(User);
      const userHasRoleRepo = appDataSource.getRepository(UserHasRole);

      // Fetch the role with the name "buyer"
      const adminRole = await roleRepo.findOne({ where: { name: "admin" } });

      if (!adminRole) {
        return res.status(404).json({
          success: false,
          message: "Role 'admin' not found",
        });
      }

      // Count the number of users with the "buyer" role
      const adminCount = await userHasRoleRepo.count({
        where: { role: { id: adminRole.id } },
      });

      // Total number of users
      const totalUsersCount = await userRepo.count({
        where: { is_deleted: false },
      });

      // Calculate the percentage of buyers in all users
      const adminPercentage = (adminCount / totalUsersCount) * 100;

      // Calculate the number and percentage of new users added in the last 30 days
      const currentDate = new Date();
      const pastDate = new Date();
      pastDate.setDate(currentDate.getDate() - 30);

      const newUsersCount = await userRepo.count({
        where: {
          created_at: Between(pastDate, currentDate),
          is_deleted: false,
        },
      });

      const newUserPercentage = (newUsersCount / totalUsersCount) * 100;

      res.status(200).json({
        success: true,
        total_admins: adminCount,
        admin_Percentage: adminPercentage.toFixed(2),
        newUserPercentage: newUserPercentage.toFixed(2),
        message: "Admin statistics fetched successfully!",
      });
    } catch (error: any) {
      console.error("Error in getAdminStats:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getOrderAnalytics(req: Request, res: Response) {
    try {
      // Calculate date range for the last 12 months
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1); // Start from 12 months ago
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // End with the last day of the current month

      // Get completed orders count by month
      const completedOrdersQuery = await appDataSource
        .getRepository(Order)
        .createQueryBuilder("order")
        .select("COUNT(order.id)", "orderCount")
        .addSelect('DATE_FORMAT(order.date, "%M") AS month')
        .innerJoin(
          OrderStatusHistory,
          "status_history",
          "status_history.order.id = order.id"
        )
        .where("order.date BETWEEN :startDate AND :endDate", {
          startDate,
          endDate,
        })
        .andWhere("status_history.status = :completedStatus", {
          completedStatus: "completed",
        })
        .groupBy("MONTH(order.date)")
        .addGroupBy("month") // Ensure DATE_FORMAT is included in the GROUP BY clause
        .orderBy("MONTH(order.date)", "ASC") // Order by the grouped month
        .getRawMany();

      // Get cancelled orders count by month
      const cancelledOrdersQuery = await appDataSource
        .getRepository(Order)
        .createQueryBuilder("order")
        .select("COUNT(order.id)", "orderCount")
        .addSelect('DATE_FORMAT(order.date, "%M") AS month')
        .innerJoin(
          OrderStatusHistory,
          "status_history",
          "status_history.order.id = order.id"
        )
        .where("order.date BETWEEN :startDate AND :endDate", {
          startDate,
          endDate,
        })
        .andWhere("status_history.status = :cancelledStatus", {
          cancelledStatus: "cancelled",
        })
        .groupBy("MONTH(order.date)")
        .addGroupBy("month") // Ensure DATE_FORMAT is included in the GROUP BY clause
        .orderBy("MONTH(order.date)", "ASC") // Order by the grouped month
        .getRawMany();

      // Format the data for completed orders
      const completedOrdersData = completedOrdersQuery.map((row) => ({
        month: row.month,
        order_count: parseInt(row.orderCount),
      }));

      // Format the data for cancelled orders
      const cancelledOrdersData = cancelledOrdersQuery.map((row) => ({
        month: row.month,
        order_count: parseInt(row.orderCount),
      }));

      // Combine both datasets into a structured response
      const analyticsData = {
        completed_orders: completedOrdersData,
        cancelled_orders: cancelledOrdersData,
      };

      res.json({ success: true, data: analyticsData });
    } catch (error) {
      console.error("Error fetching order analytics:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }

  async getTotalRevenueStats(req: Request, res: Response) {
    try {
      const completedRevenue = await appDataSource
        .getRepository(OrderProduct)
        .createQueryBuilder("orderProduct")
        .innerJoin("orderProduct.order", "order")
        .innerJoin("order.status_history", "statusHistory")
        .where("statusHistory.status = :status", { status: "completed" })
        .select(
          "SUM(orderProduct.price * orderProduct.quantity)",
          "totalRevenue"
        )
        .getRawOne();

      const cancelledRevenue = await appDataSource
        .getRepository(OrderProduct)
        .createQueryBuilder("orderProduct")
        .innerJoin("orderProduct.order", "order")
        .innerJoin("order.status_history", "statusHistory")
        .where("statusHistory.status = :status", { status: "cancelled" })
        .select(
          "SUM(orderProduct.price * orderProduct.quantity)",
          "totalRevenue"
        )
        .getRawOne();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const lastThirtyDaysRevenue = await appDataSource
        .getRepository(OrderProduct)
        .createQueryBuilder("orderProduct")
        .innerJoin("orderProduct.order", "order")
        .innerJoin("order.status_history", "statusHistory")
        .where("statusHistory.status = :status", { status: "completed" })
        .andWhere("statusHistory.changed_at >= :date", { date: thirtyDaysAgo })
        .select(
          "SUM(orderProduct.price * orderProduct.quantity)",
          "totalRevenue"
        )
        .getRawOne();

      const completedTotal = parseFloat(completedRevenue.totalRevenue || "0");
      const cancelledTotal = parseFloat(cancelledRevenue.totalRevenue || "0");
      const lastThirtyTotal = parseFloat(
        lastThirtyDaysRevenue.totalRevenue || "0"
      );

      const totalRevenuePercentage =
        cancelledTotal > 0
          ? ((completedTotal / cancelledTotal) * 100).toFixed(2)
          : "0.00";
      const lastThirtyRevenuePercentage =
        completedTotal > 0
          ? ((lastThirtyTotal / completedTotal) * 100).toFixed(2)
          : "0.00";

      res.status(200).json({
        success: true,
        total_revenue: completedTotal.toFixed(2),
        total_revenue_percentage: totalRevenuePercentage,
        last_thirty_revenue_percentage: lastThirtyRevenuePercentage,
        message: "Total revenue fetched successfully!",
      });
    } catch (error: any) {
      console.error("Error in getTotalRevenueStats:", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }

  async getTotalOrdersByDate(req: Request, res: Response) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }

      const orderProductRepository = appDataSource.getRepository(OrderProduct);

      // Assuming date is in ISO format (YYYY-MM-DD), parse it to a Date object
      const parsedDate = new Date(date.toString());

      const { totalAmount } = await orderProductRepository
        .createQueryBuilder("orderProduct")
        .select(
          "SUM(orderProduct.price * orderProduct.quantity)",
          "totalAmount"
        )
        .where("DATE(orderProduct.created_at) = :parsedDate", { parsedDate })
        .getRawOne();

      return res.status(200).json({
        success: true,
        message: "Total amount of orders fetched successfully!",
        date: parsedDate.toISOString(),
        total_revenue: parseFloat(totalAmount) || 0,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
