import { Request, Response } from "express";
import * as CryptoJS from "crypto-js";
import dotenv from "dotenv";
import { validationResult } from "express-validator";
import { appDataSource } from "../../config/db";
import { Order } from "../../entities/Order";
import {
  sendMembershipActivationEmail,
  sendOrderConfirmationEmail,
} from "../../services/emailService";
import { User } from "../../entities/Users";
import { UserMembership } from "../../entities/UserMembership";
import { MembershipPlan } from "../../entities/MembershipPlan";

dotenv.config();

class PaymentController {
  private workingKey: string = process.env.CCAVENUE_WORKING_KEY || "";
  private accessCode: string = process.env.CCAVENUE_ACCESS_CODE || "";
  private merchantId: string = process.env.CCAVENUE_MERCHANT_ID || "";

  public postRequest = (req: Request, res: Response) => {
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
      order_id,
      currency,
      amount,
      redirect_url,
      cancel_url,
      language = "EN",
    } = req.body;

    // Convert body to form string format
    const body = `merchant_id=${this.merchantId}&order_id=${order_id}&currency=${currency}&amount=${amount}&redirect_url=${redirect_url}&cancel_url=${cancel_url}&language=${language}`;

    // Encrypt the request
    const encRequest = this.encrypt(body, this.workingKey);

    // Send the encrypted request and access code to the client
    res.json({
      encRequest,
      accessCode: this.accessCode,
      ccavenueUrl:
        "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
    });
  };

  public postResponse = async (req: Request, res: Response) => {
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

    const { encResp } = req.body;

    try {
      // Decrypt the response using the working key
      const decryptedResponse = this.decrypt(encResp, this.workingKey);
      console.log(
        "🚀 ~ PaymentController ~ decryptedResponse:",
        decryptedResponse
      );

      // Parse the decrypted response into an object
      const responseParams = decryptedResponse
        .split("&")
        .map((param) => param.split("="))
        .reduce((acc, [key, value]) => {
          acc[key] = decodeURIComponent(value);
          return acc;
        }, {} as Record<string, string>);

      console.log("🚀 ~ PaymentController ~ responseParams:", responseParams);

      const paymentStatus = responseParams.order_status;
      const paymentOrderId = responseParams.order_id;
      const paymentTrackingId = responseParams.tracking_id;
      console.log("🚀 ~ PaymentController ~ paymentStatus:", paymentStatus);

      const orderRepo = await appDataSource.getRepository(Order);

      // Fetch the order to update
      let order = await orderRepo.findOne({
        where: { id: parseInt(paymentOrderId, 10) },
      });

      if (!order) {
        return res.status(404).json({
          error: "Order not found",
          success: false,
          message: "Order not found with the provided ID",
        });
      }

      const checkStatus = paymentStatus === "Success" ? "paid" : "notpaid";
      // Update the payment status and timestamp
      order.payment = checkStatus;
      order.transaction_id = paymentTrackingId;
      order.updated_at = new Date();

      // Save the updated order
      const updatedOrder = await orderRepo.save(order);

      const userRepo = appDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: updatedOrder.user_id },
      });

      if (paymentStatus === "Success" && user && user.email) {
        await sendOrderConfirmationEmail(
          user.email,
          updatedOrder?.tracking_id || ""
        );
      }

      // Send the parsed response as JSON
      return res.status(200).json({
        success: true,
        message: "Payment response received successfully",
        data: responseParams,
      });
    } catch (error: any) {
      console.error("Error processing payment response:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to process payment response",
        error: error.message,
      });
    }
  };

  public postResponseMembershipPayment = async (
    req: Request,
    res: Response
  ) => {
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

    const { encResp } = req.body;

    try {
      // Decrypt the response using the working key
      const decryptedResponse = this.decrypt(encResp, this.workingKey);
      console.log(
        "🚀 ~ PaymentController ~ decryptedResponse:",
        decryptedResponse
      );

      // Parse the decrypted response into an object
      const responseParams = decryptedResponse
        .split("&")
        .map((param) => param.split("="))
        .reduce((acc, [key, value]) => {
          acc[key] = decodeURIComponent(value);
          return acc;
        }, {} as Record<string, string>);

      const paymentStatus = responseParams.order_status;
      const paymentOrderId = responseParams.order_id;
      const paymentTrackingId = responseParams.tracking_id;
      console.log("🚀 ~ PaymentController ~ paymentStatus:", paymentStatus);

      const checkStatus = paymentStatus === "Success" ? "paid" : "notpaid";

      const userMembershipRepo = appDataSource.getRepository(UserMembership);
      const membershipPlanRepo = appDataSource.getRepository(MembershipPlan);

      // Find membership by id and load the membership_plan and user relation
      const membership = await userMembershipRepo.findOne({
        where: { id: parseInt(paymentOrderId, 10) },
        relations: ["membership_plan", "user"],
      });

      if (!membership) {
        return res.status(404).json({
          success: false,
          message: "Membership not found",
        });
      }

      const membershipPlan = membership.membership_plan;
      if (!membershipPlan) {
        return res.status(404).json({
          success: false,
          message: "Membership plan not found",
        });
      }

      const userId = membership.user?.id;

      if (!userId) {
        return res.status(404).json({
          success: false,
          message: "User associated with membership not found",
        });
      }

      // Calculate start and end date
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + membershipPlan.duration_months);

      // Update payment status to "paid"
      membership.transaction_id = paymentTrackingId;
      membership.payment_status = checkStatus;
      if (paymentStatus === "Success") {
        membership.is_active = true;
        membership.start_date = startDate;
        membership.end_date = endDate;
        membership.status = "active";
      } else {
        membership.is_active = false;
      }

      const updatedMembershipPlan = await userMembershipRepo.save(membership);

      const userRepo = appDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: userId },
      });

      if (paymentStatus === "Success" && user && user.email) {
        try {
          await sendMembershipActivationEmail(
            user.email,
            updatedMembershipPlan.membership_plan.name,
            updatedMembershipPlan.start_date,
            updatedMembershipPlan.end_date
          );
        } catch (emailError) {
          console.error(
            "Error sending membership activation email:",
            emailError
          );
        }
      }

      // Send the parsed response as JSON
      return res.status(200).json({
        success: true,
        message: "Payment response received successfully",
        data: responseParams,
      });
    } catch (error: any) {
      console.error("Error processing payment response:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to process payment response",
        error: error.message,
      });
    }
  };

  private encrypt = (plainText: string, workingKey: string): string => {
    try {
      const key = CryptoJS.MD5(workingKey);
      const iv = CryptoJS.enc.Latin1.parse(
        "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f"
      );
      const encrypted = CryptoJS.AES.encrypt(plainText, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    } catch (error) {
      console.error("Encryption failed:", error);
      throw new Error("Encryption failed");
    }
  };

  private decrypt = (encText: string, workingKey: string): string => {
    try {
      const key = CryptoJS.MD5(workingKey);
      const iv = CryptoJS.enc.Latin1.parse(
        "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f"
      );

      // Convert the encrypted text from hex to CipherParams
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(encText),
      });

      // Decrypting the string using AES and the provided key and IV
      const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      // Convert the decrypted value to a UTF-8 string
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error: any) {
      console.error("Decryption failed test:", error.message);
      throw new Error("Decryption failed");
    }
  };
}

export default new PaymentController();
