import { Request, Response } from "express";
import { appDataSource } from "../../config/db";
import { Order } from "../../entities/Order";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { OrderProduct } from "../../entities/OrderProduct";
import { Product } from "../../entities/Product";
import { Category } from "../../entities/Category";

export class AdminSalesController {
  async getTotalOrders(req: Request, res: Response) {
    try {
      const orderRepository = appDataSource.getRepository(Order);

      // Calculate current month and previous month date ranges
      const currentDate = new Date();
      const currentMonthStart = startOfMonth(currentDate);
      const currentMonthEnd = endOfMonth(currentDate);
      const previousMonthStart = startOfMonth(subMonths(currentDate, 1));
      const previousMonthEnd = endOfMonth(subMonths(currentDate, 1));

      // Fetch all orders
      const orderList = await orderRepository.find();

      // Fetch orders that have a 'completed' status history
      const ordersWithCompletedStatus = await orderRepository
        .createQueryBuilder("order")
        .innerJoinAndSelect("order.status_history", "status_history")
        .where("status_history.status = :status", { status: "completed" })
        .getMany();

      // Calculate total orders and total completed orders
      const totalOrders = orderList.length;
      const totalCompletedOrders = ordersWithCompletedStatus.filter(
        (order) =>
          order.status_history &&
          order.status_history.some((status) => status.status === "completed")
      ).length;

      // Fetch orders of previous month
      const previousMonthOrders = await orderRepository
        .createQueryBuilder("order")
        .where("order.date BETWEEN :previousMonthStart AND :previousMonthEnd", {
          previousMonthStart,
          previousMonthEnd,
        })
        .getMany();

      // Fetch orders of current month
      const currentMonthOrders = await orderRepository
        .createQueryBuilder("order")
        .where("order.date BETWEEN :currentMonthStart AND :currentMonthEnd", {
          currentMonthStart,
          currentMonthEnd,
        })
        .getMany();

      // Calculate the percentage change for total orders
      const previousMonthOrderCount = previousMonthOrders.length;
      const currentMonthOrderCount = currentMonthOrders.length;
      let percentageChange = 0;

      if (previousMonthOrderCount > 0) {
        percentageChange =
          ((currentMonthOrderCount - previousMonthOrderCount) /
            previousMonthOrderCount) *
          100;
      } else if (previousMonthOrderCount === 0 && currentMonthOrderCount > 0) {
        percentageChange = 100;
      }

      // Round off the percentage change to two decimal places
      percentageChange = Math.round(percentageChange * 100) / 100;

      // Calculate the percentage change for completed orders
      const previousMonthCompletedOrders = previousMonthOrders.filter(
        (order) =>
          order.status_history &&
          order.status_history.some((status) => status.status === "completed")
      ).length;

      const currentMonthCompletedOrders = currentMonthOrders.filter(
        (order) =>
          order.status_history &&
          order.status_history.some((status) => status.status === "completed")
      ).length;

      let completedOrdersPercentageChange = 0;

      if (previousMonthCompletedOrders > 0) {
        completedOrdersPercentageChange =
          ((currentMonthCompletedOrders - previousMonthCompletedOrders) /
            previousMonthCompletedOrders) *
          100;
      } else if (
        previousMonthCompletedOrders === 0 &&
        currentMonthCompletedOrders > 0
      ) {
        completedOrdersPercentageChange = 100;
      }

      // Round off the completed orders percentage change to two decimal places
      completedOrdersPercentageChange =
        Math.round(completedOrdersPercentageChange * 100) / 100;

      res.status(200).json({
        // total_orders: totalOrders,
        // total_completed_orders: totalCompletedOrders,
        // orders_previous_month: previousMonthOrderCount,
        orders_current_month: currentMonthOrderCount,
        percentage_change: `${percentageChange}%`,
        // completed_orders_previous_month: previousMonthCompletedOrders,
        // completed_orders_current_month: currentMonthCompletedOrders,
        completed_orders_percentage_change: `${completedOrdersPercentageChange}%`,
        success: true,
        message: "Orders stats fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching total orders:", error);
      res.status(500).json({ error: "Failed to fetch total orders" });
    }
  }

  async getTotalSales(req: Request, res: Response) {
    try {
      const orderRepository = appDataSource.getRepository(Order);

      // Calculate current month and previous month date ranges
      const currentDate = new Date();
      const currentMonthStart = startOfMonth(currentDate);
      const currentMonthEnd = endOfMonth(currentDate);
      const previousMonthStart = startOfMonth(subMonths(currentDate, 1));
      const previousMonthEnd = endOfMonth(subMonths(currentDate, 1));

      // Fetch all orders
      const orderList = await orderRepository.find();

      // Fetch orders that have a 'completed' status history
      const ordersWithCompletedStatus = await orderRepository
        .createQueryBuilder("order")
        .innerJoinAndSelect("order.status_history", "status_history")
        .where("status_history.status = :status", { status: "completed" })
        .getMany();

      // Calculate total orders and total completed orders
      const totalOrders = orderList.length;
      const totalCompletedOrders = ordersWithCompletedStatus.filter(
        (order) =>
          order.status_history &&
          order.status_history.some((status) => status.status === "completed")
      ).length;

      // Fetch orders of previous month
      const previousMonthOrders = await orderRepository
        .createQueryBuilder("order")
        .where("order.date BETWEEN :previousMonthStart AND :previousMonthEnd", {
          previousMonthStart,
          previousMonthEnd,
        })
        .getMany();

      // Fetch orders of current month
      const currentMonthOrders = await orderRepository
        .createQueryBuilder("order")
        .where("order.date BETWEEN :currentMonthStart AND :currentMonthEnd", {
          currentMonthStart,
          currentMonthEnd,
        })
        .getMany();

      // Calculate the percentage change for total orders
      const previousMonthOrderCount = previousMonthOrders.length;
      const currentMonthOrderCount = currentMonthOrders.length;
      let percentageChange = 0;

      if (previousMonthOrderCount > 0) {
        percentageChange =
          ((currentMonthOrderCount - previousMonthOrderCount) /
            previousMonthOrderCount) *
          100;
      } else if (previousMonthOrderCount === 0 && currentMonthOrderCount > 0) {
        percentageChange = 100;
      }

      // Round off the percentage change to two decimal places
      percentageChange = Math.round(percentageChange * 100) / 100;

      // Calculate the percentage change for completed orders
      const previousMonthCompletedOrders = previousMonthOrders.filter(
        (order) =>
          order.status_history &&
          order.status_history.some((status) => status.status === "completed")
      ).length;

      const currentMonthCompletedOrders = currentMonthOrders.filter(
        (order) =>
          order.status_history &&
          order.status_history.some((status) => status.status === "completed")
      ).length;

      let completedOrdersPercentageChange = 0;

      if (previousMonthCompletedOrders > 0) {
        completedOrdersPercentageChange =
          ((currentMonthCompletedOrders - previousMonthCompletedOrders) /
            previousMonthCompletedOrders) *
          100;
      } else if (
        previousMonthCompletedOrders === 0 &&
        currentMonthCompletedOrders > 0
      ) {
        completedOrdersPercentageChange = 100;
      }

      // Round off the completed orders percentage change to two decimal places
      completedOrdersPercentageChange =
        Math.round(completedOrdersPercentageChange * 100) / 100;

      res.status(200).json({
        // total_orders: totalOrders,
        // total_completed_orders: totalCompletedOrders,
        // orders_previous_month: previousMonthOrderCount,
        sales_current_month: currentMonthOrderCount,
        percentage_change: `${percentageChange}%`,
        // completed_orders_previous_month: previousMonthCompletedOrders,
        // completed_orders_current_month: currentMonthCompletedOrders,
        completed_sales_percentage_change: `${completedOrdersPercentageChange}%`,
        success: true,
        message: "Sales stats fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching total orders:", error);
      res.status(500).json({ error: "internal server error" });
    }
  }

  async getOrderValues(req: Request, res: Response) {
    try {
      const orderRepository = appDataSource.getRepository(Order);

      // Calculate current month and previous month date ranges
      const currentDate = new Date();
      const currentMonthStart = startOfMonth(currentDate);
      const currentMonthEnd = endOfMonth(currentDate);
      const previousMonthStart = startOfMonth(subMonths(currentDate, 1));
      const previousMonthEnd = endOfMonth(subMonths(currentDate, 1));

      // Fetch all orders
      const orderList = await orderRepository.find();

      // Fetch orders that have a 'completed' status history
      const ordersWithCompletedStatus = await orderRepository
        .createQueryBuilder("order")
        .innerJoinAndSelect("order.status_history", "status_history")
        .where("status_history.status = :status", { status: "completed" })
        .getMany();

      // Calculate total orders and total completed orders
      const totalOrders = orderList.length;
      const totalCompletedOrders = ordersWithCompletedStatus.filter(
        (order) =>
          order.status_history &&
          order.status_history.some((status) => status.status === "completed")
      ).length;

      // Fetch orders of previous month
      const previousMonthOrders = await orderRepository
        .createQueryBuilder("order")
        .where("order.date BETWEEN :previousMonthStart AND :previousMonthEnd", {
          previousMonthStart,
          previousMonthEnd,
        })
        .getMany();

      // Fetch orders of current month
      const currentMonthOrders = await orderRepository
        .createQueryBuilder("order")
        .leftJoinAndSelect("order.orderProducts", "orderProducts")
        .where("order.date BETWEEN :currentMonthStart AND :currentMonthEnd", {
          currentMonthStart,
          currentMonthEnd,
        })
        .getMany();

      // Calculate the percentage change for total orders
      const previousMonthOrderCount = previousMonthOrders.length;
      const currentMonthOrderCount = currentMonthOrders.length;
      let percentageChange = 0;

      if (previousMonthOrderCount > 0) {
        percentageChange =
          ((currentMonthOrderCount - previousMonthOrderCount) /
            previousMonthOrderCount) *
          100;
      } else if (previousMonthOrderCount === 0 && currentMonthOrderCount > 0) {
        percentageChange = 100;
      }

      // Round off the percentage change to two decimal places
      percentageChange = Math.round(percentageChange * 100) / 100;

      // Calculate the percentage change for completed orders
      const previousMonthCompletedOrders = previousMonthOrders.filter(
        (order) =>
          order.status_history &&
          order.status_history.some((status) => status.status === "completed")
      ).length;

      const currentMonthCompletedOrders = currentMonthOrders.filter(
        (order) =>
          order.status_history &&
          order.status_history.some((status) => status.status === "completed")
      ).length;

      let completedOrdersPercentageChange = 0;

      if (previousMonthCompletedOrders > 0) {
        completedOrdersPercentageChange =
          ((currentMonthCompletedOrders - previousMonthCompletedOrders) /
            previousMonthCompletedOrders) *
          100;
      } else if (
        previousMonthCompletedOrders === 0 &&
        currentMonthCompletedOrders > 0
      ) {
        completedOrdersPercentageChange = 100;
      }

      // Round off the completed orders percentage change to two decimal places
      completedOrdersPercentageChange =
        Math.round(completedOrdersPercentageChange * 100) / 100;

      // Calculate total price of current month's orders
      const totalCurrentMonthOrderPrice = currentMonthOrders.reduce(
        (total, order) => {
          const orderTotalPrice = order.orderProducts.reduce(
            (itemTotal, item) => itemTotal + Number(item.price),
            0
          );
          return total + orderTotalPrice;
        },
        0
      );

      res.status(200).json({
        // total_orders: totalOrders,
        // total_completed_orders: totalCompletedOrders,
        // orders_previous_month: previousMonthOrderCount,
        // sales_current_month: currentMonthOrderCount,
        percentage_change: `${percentageChange}%`,
        // completed_orders_previous_month: previousMonthCompletedOrders,
        // completed_orders_current_month: currentMonthCompletedOrders,
        completed_orders_percentage_change: `${completedOrdersPercentageChange}%`,
        total_current_month_order_price: totalCurrentMonthOrderPrice,
        success: true,
        message: "Order value stats fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching total orders:", error);
      res.status(500).json({ error: "internal server error" });
    }
  }

  async getHighestCategoryOrder(req: Request, res: Response) {
    try {
      const orderProductRepository = appDataSource.getRepository(OrderProduct);

      const result = await orderProductRepository
        .createQueryBuilder("orderProduct")
        .innerJoin(Product, "product", "orderProduct.product_id = product.id")
        .innerJoin(Category, "category", "product.category_id = category.id")
        .select("category.name", "category")
        .addSelect("COUNT(orderProduct.id)", "orderCount")
        .addSelect(
          "SUM(orderProduct.price * orderProduct.quantity)",
          "totalAmount"
        )
        .groupBy("category.id")
        .orderBy("totalAmount", "DESC")
        .limit(4) // Adjust the limit as needed
        .getRawMany();

      const response = result.map((row) => ({
        category: row.category,
        // order_count: parseInt(row.orderCount, 10),
        total_sales: parseFloat(row.totalAmount),
      }));

      return res.status(200).json({
        success: true,
        message: "Trending categories sales fetched successfully!",
        data: response,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllCategoriesSales(req: Request, res: Response) {
    try {
      const orderProductRepository = appDataSource.getRepository(OrderProduct);

      const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-11
      const previousMonth = new Date().getMonth();

      const result = await orderProductRepository
        .createQueryBuilder("orderProduct")
        .innerJoin(Product, "product", "orderProduct.product_id = product.id")
        .innerJoin(Category, "category", "product.category_id = category.id")
        .select("category.name", "category")
        .addSelect("COUNT(orderProduct.id)", "orderCount")
        .addSelect(
          "SUM(orderProduct.price * orderProduct.quantity)",
          "totalAmount"
        )
        .addSelect(
          `SUM(
            CASE 
              WHEN MONTH(orderProduct.created_at) = :currentMonth 
              THEN orderProduct.price * orderProduct.quantity 
              ELSE 0 
            END
          )`,
          "currentMonthAmount"
        )
        .addSelect(
          `SUM(
            CASE 
              WHEN MONTH(orderProduct.created_at) = :previousMonth 
              THEN orderProduct.price * orderProduct.quantity 
              ELSE 0 
            END
          )`,
          "previousMonthAmount"
        )
        .groupBy("category.id")
        .setParameters({ currentMonth, previousMonth })
        .getRawMany();

      const response = result.map((row) => {
        const currentMonthSales = parseFloat(row.currentMonthAmount);
        const previousMonthSales = parseFloat(row.previousMonthAmount);
        let percentageChange = 0;
        let trendSign = "";

        if (previousMonthSales !== 0) {
          percentageChange =
            ((currentMonthSales - previousMonthSales) / previousMonthSales) *
            100;
          trendSign = percentageChange > 0 ? "+" : "-";
        } else if (currentMonthSales !== 0) {
          percentageChange = 100; // If there were no sales in the previous month but there are sales in the current month
          trendSign = "+";
        }

        return {
          category: row.category,
          order_count: parseInt(row.orderCount, 10),
          total_sales: parseFloat(row.totalAmount),
          current_month_sales: currentMonthSales,
          previous_month_sales: previousMonthSales,
          percentage_change: trendSign + percentageChange.toFixed(2) + "%", // Include sign and format to 2 decimal places
        };
      });

      return res.status(200).json({
        success: true,
        message: "Trending categories sales fetched successfully!",
        data: response,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getSalesPerformanceChart(req: Request, res: Response) {
    try {
      const orderProductRepository = appDataSource.getRepository(OrderProduct);

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const salesData: { month: number; year: number; orderCount: number }[] =
        [];

      for (let i = 0; i < 12; i++) {
        let month = currentMonth - i;
        let year = currentYear;

        if (month <= 0) {
          month = 12 + month;
          year--;
        }

        const { count: orderCount } = await orderProductRepository
          .createQueryBuilder("orderProduct")
          .select("COUNT(orderProduct.id)", "count")
          .where(
            "MONTH(orderProduct.created_at) = :month AND YEAR(orderProduct.created_at) = :year",
            { month, year }
          )
          .getRawOne();

        salesData.push({
          month,
          year,
          orderCount: parseInt(orderCount, 10),
        });
      }

      const response = salesData.map((data, index) => {
        const currentMonthOrders = data.orderCount;
        const previousMonthOrders =
          index < 11 ? salesData[index + 1].orderCount : 0;
        let orderPercentageChange = 0;

        if (previousMonthOrders !== 0) {
          orderPercentageChange =
            ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) *
            100;
        } else if (currentMonthOrders !== 0) {
          orderPercentageChange = 100; // If there were no orders in the previous month but there are orders in the current month
        }

        return {
          month: data.month,
          year: data.year,
          order_count: data.orderCount,
          order_percentage_change: orderPercentageChange.toFixed(2) + "%", // Format to 2 decimal places
        };
      });

      return res.status(200).json({
        success: true,
        message: "Sales performance chart data fetched successfully!",
        data: response,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
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
