import { Request, Response } from "express";
import axios from "axios";
import { appDataSource } from "../../config/db";
import { Order } from "../../entities/Order";
import { Address } from "../../entities/Address";
import { User } from "../../entities/Users";

const url = "https://shipping-api.com/app/api/v1/push-order";
const headers = {
  accept: "application/json",
  "public-key": "QAT3F5reixLjyhUZWv7C",
  "private-key": "mkxJlC2vW5Oo9rpGQ0iR",
  "Content-Type": "application/json",
  "X-CSRF-TOKEN": "",
};

// Controller function to push order to Shipmozo
export async function pushOrderToShipmozo(req: Request, res: Response) {
  const { order_id } = req.body;
  console.log("🚀 ~ pushOrderToShipmozo ~ order_id:", order_id);

  try {
    // Fetch the order from your database
    const orderRepository = appDataSource.getRepository(Order);
    const order = await orderRepository.findOne({
      where: { id: order_id },
      relations: [
        "orderProducts",
        "orderProducts.product",
        "orderProducts.product.dimensions",
      ],
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const orderId = order.id;

    const userRepo = appDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id: order.user_id } });

    const addressId = order.address_id;

    const addressRepo = appDataSource.getRepository(Address);

    const address = await addressRepo.findOne({ where: { id: addressId } });

    const payment_type = order.payment_type;
    const payment_method = payment_type === "cod" ? "COD" : "PREPAID";

    const orderDate = order.date.toISOString().split("T")[0];

    // Calculate total amount from orderProducts
    const totalAmount = order.orderProducts.reduce((total, product) => {
      // Use type assertion to handle the price as a string and convert it to a number
      return total + parseFloat(product.price as unknown as string);
    }, 0);

    // Map orderProducts to shippingData product_detail
    const productDetails = order.orderProducts.map((orderProduct) => ({
      name: orderProduct.product.title,
      sku_number: orderProduct.product.sku,
      quantity: orderProduct.quantity.toString(),
      discount: orderProduct.product.discount || "",
      unit_price: orderProduct.price.toString(),
      product_category: "",
    }));

    const shippingData = {
      order_id: orderId,
      order_date: orderDate,
      order_type: "ESSENTIALS",
      consignee_name: address?.recipient_name,
      consignee_phone: address?.recipient_phone,
      consignee_alternate_phone: "",
      consignee_email: user?.email,
      consignee_address_line_one: address?.address,
      consignee_address_line_two: "",
      consignee_pin_code: address?.pin_code,
      consignee_city: address?.city,
      consignee_state: address?.state,
      product_detail: productDetails,
      payment_type: payment_method,
      cod_amount: payment_type === "cod" ? totalAmount : "",
      weight: "0.1",
      length: "1",
      width: "2",
      height: "1",
      warehouse_id: "24459",
      gst_ewaybill_number: "",
      gstin_number: "",
    };

    res.json({
      order: order,
      ship: shippingData,
    });

    // Push the order to Shipmozo
    // const response = await axios.post(url, shippingData, { headers });
    // console.log("🚀 ~ pushOrderToShipmozo ~ response:", response);
    // const { data } = response;

    // if (data.result === "1") {
    //   res.status(200).json({
    //     message: "Order pushed successfully",
    //     data: data.data,
    //   });
    // } else {
    //   res.status(400).json({
    //     message: "Failed to push order",
    //     error: data.message,
    //   });
  } catch (error: any) {}
}
