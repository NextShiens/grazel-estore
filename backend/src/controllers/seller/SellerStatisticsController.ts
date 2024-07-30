import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Order } from "../../entities/Order";
import { Product } from "../../entities/Product";
import { User } from "../../entities/Users";
import { Address } from "../../entities/Address";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { OrderStatusHistory } from "../../entities/OrderHistory";
import { OrderProduct } from "../../entities/OrderProduct";

export class SellerStatisticsController {
  async getRecentOrders(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;

      const { status } = req.query;

      const orderRepo = appDataSource.getRepository(Order);
      const productRepo = appDataSource.getRepository(Product);
      const userRepo = appDataSource.getRepository(User);
      const addressRepo = appDataSource.getRepository(Address);
      const statusHistoryRepo = appDataSource.getRepository(OrderStatusHistory);

      const products = await productRepo.find({ where: { user_id: userId } });
      const productIds = products.map((product) => product.id);

      if (productIds.length === 0) {
        return res.status(200).json({
          orders: [],
          success: true,
          message: "No orders found for the products created by the seller",
        });
      }

      let queryBuilder = orderRepo
        .createQueryBuilder("order")
        .innerJoinAndSelect("order.orderProducts", "orderProduct")
        .leftJoinAndSelect("orderProduct.product", "product")
        .leftJoinAndSelect("order.status_history", "statusHistory")
        .where("product.id IN (:...productIds)", { productIds })
        .orderBy("order.created_at", "DESC")
        .take(10);

      if (status) {
        queryBuilder.andWhere("statusHistory.status = :status", { status });
      }

      const orders = await queryBuilder.getMany();

      const formattedOrders = await Promise.all(
        orders.map(async (order) => {
          const customer = await userRepo.findOne({
            where: { id: order.user_id },
            relations: ["profile"],
          });

          const customerAddress = await addressRepo.findOne({
            where: { id: order.address_id },
          });

          const statusHistory = order.status_history.map((history) => ({
            status: history.status,
            changed_at: format(
              new Date(history.changed_at),
              "MMMM d, yyyy, hh:mm a"
            ),
          }));

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
            statusHistory,
            products: order.orderProducts.map((orderProduct) => ({
              id: orderProduct.product.id,
              title: orderProduct.product.title,
              category_id: orderProduct.product.category_id,
              brand_id: orderProduct.product.brand_id,
              slug: orderProduct.product.slug,
              featured_image: orderProduct.product.featured_image,
              price: orderProduct.product.price,
              description: orderProduct.product.description,
              tags: orderProduct.product.tags,
              gallery: orderProduct.product.gallery,
            })),
          };
        })
      );

      res.status(200).json({
        orders: formattedOrders,
        success: true,
        message: "Orders fetched successfully for the seller",
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  }

  async sellerTotalSales(req: Request, res: Response) {
    try {
      const user = (req as any).user; // Assuming you have middleware to extract user
      const sellerId = user.id;

      const orderRepository = appDataSource.getRepository(Order);
      const productRepository = appDataSource.getRepository(Product);

      // Fetch products created by the seller
      const products = await productRepository.find({
        where: { user_id: sellerId },
      });
      const productIds = products.map((product) => product.id);

      if (productIds.length === 0) {
        return res.status(200).json({
          total_sales: 0,
          total_sales_current_month: 0,
          total_sales_previous_month: 0,
          average_percentage_change: "0%", // Initial value for average percentage change
          success: true,
          message: "No products found for the seller",
        });
      }

      // Calculate current month and previous month date ranges using date-fns
      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());
      const previousMonthStart = startOfMonth(subMonths(new Date(), 1));
      const previousMonthEnd = endOfMonth(subMonths(new Date(), 1));

      // Initialize query builder for orders
      const orders = await orderRepository
        .createQueryBuilder("order")
        .innerJoinAndSelect("order.orderProducts", "orderProduct")
        .leftJoin("orderProduct.product", "product")
        .leftJoin("order.status_history", "statusHistory")
        .where("product.id IN (:...productIds)", { productIds })
        .andWhere("statusHistory.status = :status", { status: "completed" })
        .getMany();

      // Calculate total sales for all completed orders
      let totalSales = 0;
      let totalSalesCurrentMonth = 0;
      let totalSalesPreviousMonth = 0;

      orders.forEach((order) => {
        order.orderProducts.forEach((orderProduct) => {
          if (
            orderProduct.product &&
            productIds.includes(orderProduct.product.id)
          ) {
            totalSales += orderProduct.price * orderProduct.quantity;
            // Check if order date falls within current month
            if (
              order.date >= currentMonthStart &&
              order.date <= currentMonthEnd
            ) {
              totalSalesCurrentMonth +=
                orderProduct.price * orderProduct.quantity;
            }
            // Check if order date falls within previous month
            if (
              order.date >= previousMonthStart &&
              order.date <= previousMonthEnd
            ) {
              totalSalesPreviousMonth +=
                orderProduct.price * orderProduct.quantity;
            }
          }
        });
      });

      // Calculate average percentage change
      let averagePercentageChange = 0;
      if (totalSalesPreviousMonth !== 0) {
        averagePercentageChange =
          ((totalSalesCurrentMonth - totalSalesPreviousMonth) /
            totalSalesPreviousMonth) *
          100;
      }

      // Determine if the change is positive or negative
      const sign = averagePercentageChange >= 0 ? "+" : "-";
      averagePercentageChange = Math.abs(averagePercentageChange); // Get absolute value for percentage

      res.status(200).json({
        // total_sales: totalSales,
        current_month_sales: totalSalesCurrentMonth,
        // total_sales_current_month: totalSalesCurrentMonth,
        // total_sales_previous_month: totalSalesPreviousMonth,
        average_percentage_change: `${sign}${averagePercentageChange.toFixed(
          2
        )}%`,
        success: true,
        message: "Total sales fetched successfully for the seller",
      });
    } catch (error) {
      console.error("Error fetching total sales:", error);
      res.status(500).json({ error: "Failed to fetch total sales" });
    }
  }

  async getTotalOrders(req: Request, res: Response) {
    try {
      const user = (req as any).user; // Assuming middleware extracts user information
      const sellerId = user.id;

      const orderRepository = appDataSource.getRepository(Order);
      const productRepository = appDataSource.getRepository(Product);

      // Fetch products associated with the seller
      const products = await productRepository.find({
        where: { user_id: sellerId },
      });

      // Extract product ids
      const productIds = products.map((product) => product.id);

      // Calculate current month and previous month date ranges
      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());
      const previousMonthStart = startOfMonth(subMonths(new Date(), 1));
      const previousMonthEnd = endOfMonth(subMonths(new Date(), 1));

      // Fetch orders where products belong to the seller and fall within date ranges
      const currentMonthOrders = await orderRepository
        .createQueryBuilder("order")
        .innerJoinAndSelect("order.orderProducts", "orderProduct")
        .leftJoin("orderProduct.product", "product")
        .where("product.id IN (:...productIds)", { productIds })
        .andWhere(
          "order.date >= :currentMonthStart AND order.date <= :currentMonthEnd",
          {
            currentMonthStart,
            currentMonthEnd,
          }
        )
        .getMany();

      const previousMonthOrders = await orderRepository
        .createQueryBuilder("order")
        .innerJoinAndSelect("order.orderProducts", "orderProduct")
        .leftJoin("orderProduct.product", "product")
        .where("product.id IN (:...productIds)", { productIds })
        .andWhere(
          "order.date >= :previousMonthStart AND order.date <= :previousMonthEnd",
          {
            previousMonthStart,
            previousMonthEnd,
          }
        )
        .getMany();

      // Count distinct orders
      const currentMonthOrderCount = new Set(
        currentMonthOrders.map((order) => order.id)
      ).size;
      const previousMonthOrderCount = new Set(
        previousMonthOrders.map((order) => order.id)
      ).size;

      // Calculate percentage difference
      let percentageDifference = 0;
      if (previousMonthOrderCount !== 0) {
        percentageDifference =
          ((currentMonthOrderCount - previousMonthOrderCount) /
            previousMonthOrderCount) *
          100;
      }

      // Determine the sign of the percentage
      let comparisonSign = "";
      if (percentageDifference > 0) {
        comparisonSign = "+";
      } else if (percentageDifference < 0) {
        comparisonSign = "-";
        percentageDifference = Math.abs(percentageDifference); // Ensure percentageDifference is positive for display
      }

      // Format percentage to two decimal places
      const formattedPercentage = percentageDifference.toFixed(2);

      res.status(200).json({
        current_month_orders: currentMonthOrderCount,
        comparison_percentage: `${comparisonSign}${formattedPercentage}%`,

        // total_orders: {
        //   current_month_orders: currentMonthOrderCount,
        // total: currentMonthOrderCount + previousMonthOrderCount,
        //   current_month: currentMonthOrderCount,
        //   previous_month: previousMonthOrderCount,
        //   comparison_percentage: `${comparisonSign}${formattedPercentage}%`,
        // },
        success: true,
        message: "Total orders fetched successfully for the seller",
      });
    } catch (error) {
      console.error("Error fetching total orders:", error);
      res.status(500).json({ error: "Failed to fetch total orders" });
    }
  }

  async sellerLifetimeRevenue(req: Request, res: Response) {
    try {
      const user = (req as any).user; // Assuming you have middleware to extract user
      const sellerId = user.id;

      const orderRepository = appDataSource.getRepository(Order);
      const productRepository = appDataSource.getRepository(Product);

      // Fetch products created by the seller
      const products = await productRepository.find({
        where: { user_id: sellerId },
      });
      const productIds = products.map((product) => product.id);

      if (productIds.length === 0) {
        return res.status(200).json({
          total_revenue: 0,
          current_month_sales: 0,
          total_sales_current_month: 0,
          total_sales_previous_month: 0,
          average_percentage_change: "0%", // Initial value for average percentage change
          success: true,
          message: "No products found for the seller",
        });
      }

      // Calculate current month and previous month date ranges using date-fns
      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());
      const previousMonthStart = startOfMonth(subMonths(new Date(), 1));
      const previousMonthEnd = endOfMonth(subMonths(new Date(), 1));

      // Initialize query builder for orders
      const orders = await orderRepository
        .createQueryBuilder("order")
        .innerJoinAndSelect("order.orderProducts", "orderProduct")
        .leftJoinAndSelect("orderProduct.product", "product")
        .leftJoinAndSelect("order.status_history", "statusHistory")
        .where("product.id IN (:...productIds)", { productIds })
        .andWhere("statusHistory.status = :status", { status: "completed" })
        .getMany();

    
      // Calculate total sales for all completed orders
      let totalSales = 0;
      let totalSalesCurrentMonth = 0;
      let totalSalesPreviousMonth = 0;

      orders.forEach((order) => {
        // Check if order date falls within current month
        if (order.date >= currentMonthStart && order.date <= currentMonthEnd) {
          order.orderProducts.forEach((orderProduct) => {
            if (
              orderProduct.product &&
              productIds.includes(orderProduct.product.id)
            ) {
              totalSalesCurrentMonth +=
                orderProduct.price * orderProduct.quantity;
            }
          });
        }

        // Check if order date falls within previous month
        if (
          order.date >= previousMonthStart &&
          order.date <= previousMonthEnd
        ) {
          order.orderProducts.forEach((orderProduct) => {
            if (
              orderProduct.product &&
              productIds.includes(orderProduct.product.id)
            ) {
              totalSalesPreviousMonth +=
                orderProduct.price * orderProduct.quantity;
            }
          });
        }

        // Calculate total sales
        order.orderProducts.forEach((orderProduct) => {
          if (
            orderProduct.product &&
            productIds.includes(orderProduct.product.id)
          ) {
            totalSales += orderProduct.price * orderProduct.quantity;
          }
        });
      });

      // Calculate average percentage change
      let averagePercentageChange = 0;
      if (totalSalesPreviousMonth !== 0) {
        averagePercentageChange =
          ((totalSalesCurrentMonth - totalSalesPreviousMonth) /
            totalSalesPreviousMonth) *
          100;
      }

      // Determine if the change is positive or negative
      const sign = averagePercentageChange >= 0 ? "+" : "-";
      averagePercentageChange = Math.abs(averagePercentageChange); // Get absolute value for percentage

      res.status(200).json({
        total_revenue: totalSales,
        // current_month_sales: totalSalesCurrentMonth,
        total_sales_current_month: totalSalesCurrentMonth,
        total_sales_previous_month: totalSalesPreviousMonth,
        average_percentage_change: `${sign}${averagePercentageChange.toFixed(
          2
        )}%`,
        success: true,
        message: "Total sales fetched successfully for the seller",
      });
    } catch (error) {
      console.error("Error fetching total sales:", error);
      res.status(500).json({ error: "Failed to fetch total sales" });
    }
  }

  async getTotalReturnOrdersAmount(req: Request, res: Response) {
    try {
      const user = (req as any).user; // Assuming middleware extracts user information
      const sellerId = user.id;

      const orderRepository = appDataSource.getRepository(Order);
      const productRepository = appDataSource.getRepository(Product);
      const orderProductRepository = appDataSource.getRepository(OrderProduct);
      const orderStatusHistoryRepository =
        appDataSource.getRepository(OrderStatusHistory);

      // Fetch products created by the seller
      const products = await productRepository.find({
        where: { user_id: sellerId },
      });
      const productIds = products.map((product) => product.id);

      if (productIds.length === 0) {
        return res.status(200).json({
          total_return_amount: 0,
          previous_month_return_amount: 0,
          current_month_return_amount: 0,
          comparison_percentage: "N/A",
          success: true,
          message: "No products found for the seller",
        });
      }

      // Calculate previous month start and end dates
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const previousMonthStartDate = new Date(currentYear, currentMonth - 1, 1);
      const previousMonthEndDate = new Date(currentYear, currentMonth, 0);

      // Fetch orders where products belong to the seller and have a return status
      const orders = await orderRepository
        .createQueryBuilder("order")
        .innerJoinAndSelect("order.orderProducts", "orderProduct")
        .innerJoin("order.status_history", "statusHistory") // Join with status history
        .leftJoin("orderProduct.product", "product")
        .where("product.id IN (:...productIds)", { productIds })
        .andWhere("statusHistory.status = :status", { status: "return" }) // Filter by return status in history
        .getMany();

      // Calculate total return amount
      let totalReturnAmount = 0;
      let previousMonthReturnAmount = 0;
      let currentMonthReturnAmount = 0;

      orders.forEach((order) => {
        order.orderProducts.forEach((orderProduct) => {
          if (
            orderProduct.product &&
            productIds.includes(orderProduct.product.id)
          ) {
            // Find the relevant status history entries for the product in this order
            const relevantHistoryEntries = order.status_history.filter(
              (history) =>
                history.id === orderProduct.id && history.status === "return"
            );

            if (relevantHistoryEntries.length > 0) {
              relevantHistoryEntries.forEach((historyEntry) => {
                const historyEntryDate = historyEntry.changed_at;

                if (
                  historyEntryDate >= previousMonthStartDate &&
                  historyEntryDate <= previousMonthEndDate
                ) {
                  previousMonthReturnAmount +=
                    orderProduct.price * orderProduct.quantity;
                }

                if (
                  historyEntryDate.getMonth() === currentMonth &&
                  historyEntryDate.getFullYear() === currentYear
                ) {
                  currentMonthReturnAmount +=
                    orderProduct.price * orderProduct.quantity;
                }
              });
            }
          }
        });
      });

      // Calculate comparison percentage
      let comparisonPercentage = "N/A";

      if (previousMonthReturnAmount !== 0) {
        const percentageChange =
          ((currentMonthReturnAmount - previousMonthReturnAmount) /
            previousMonthReturnAmount) *
          100;
        comparisonPercentage = `${Math.abs(percentageChange).toFixed(2)}%`;

        // Determine the sign based on percentage change
        if (percentageChange > 0) {
          comparisonPercentage = `+${comparisonPercentage}`;
        } else if (percentageChange < 0) {
          comparisonPercentage = `-${comparisonPercentage}`;
        }
      }

      res.status(200).json({
        total_return_amount: totalReturnAmount,
        previous_month_return_amount: previousMonthReturnAmount,
        current_month_return_amount: currentMonthReturnAmount,
        comparison_percentage: comparisonPercentage,
        success: true,
        message:
          "Total and monthly return amounts fetched successfully for the seller",
      });
    } catch (error) {
      console.error("Error fetching total and monthly return amounts:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch total and monthly return amounts" });
    }
  }

  async getSellerRevenueTrend(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const sellerId = user.id;

      const orderRepository = appDataSource.getRepository(Order);
      const orderProductRepository = appDataSource.getRepository(OrderProduct);

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const monthlyData = [];

      // Loop through the last 12 months including the current month
      for (let i = 0; i < 12; i++) {
        // Calculate start and end dates for the current month in the loop
        const startDate = new Date(currentYear, currentMonth - i, 1);
        const endDate = new Date(currentYear, currentMonth - i + 1, 0);

        // Adjust start date if the month is earlier than the current month
        if (currentMonth - i < 0) {
          startDate.setFullYear(currentYear - 1);
          startDate.setMonth(12 + currentMonth - i - 1);
        }

        const orders = await orderRepository
          .createQueryBuilder("order")
          .innerJoin("order.orderProducts", "orderProduct")
          .innerJoin("orderProduct.product", "product")
          .innerJoinAndSelect("order.status_history", "status_history")
          .where("product.user_id = :sellerId", { sellerId })
          .andWhere("order.user_id = :sellerId", { sellerId })
          .andWhere("order.date >= :startDate", { startDate })
          .andWhere("order.date <= :endDate", { endDate })
          .andWhere("status_history.status = :status", { status: "completed" })
          .getMany();

        let totalAmount = 0;
        let totalOrders = orders.length;
        let totalRevenue = 0;

        // Calculate total amount and revenue for completed orders
        for (const order of orders) {
          for (const orderProduct of order.orderProducts) {
            totalAmount += orderProduct.price * orderProduct.quantity;
          }
        }

        const monthName = startDate.toLocaleString("default", {
          month: "short",
        });

        monthlyData.unshift({
          month: monthName,
          // total_amount: totalAmount,
          // total_orders: totalOrders,
          total_revenue: totalAmount, // Adjust total revenue calculation
        });
      }

      res.status(200).json({
        monthly_data: monthlyData,
        success: true,
        message: "Seller revenue trend data fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching seller revenue trend data:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch seller revenue trend data" });
    }
  }
}
