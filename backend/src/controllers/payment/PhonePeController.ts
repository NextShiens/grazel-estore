import { Request, Response } from "express";
import * as crypto from "crypto";
import axios from "axios";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";

// phonePe config
const MERCHANT_ID = "M1NBUBRXXYI7";
const SALT_KEY = "daa576cb-3628-49d3-b7a6-fe03e4226919";
const SALT_INDEX = "1";
const callbackUrl = "https://api.grazle.co.in/api/phonepe/callback";

// Function to generate the X-Verify header
function generateXVerify(payload: string): string {
  const saltIndex = "1";
  const endpoint = "/pg/v1/pay";
  const hash = crypto.createHash("sha256");
  hash.update(payload + endpoint + SALT_KEY);
  const checksum = hash.digest("hex");
  return `${checksum}###${saltIndex}`;
}

// Function to base64 encode the payload
function base64Encode(payload: object): string {
  const jsonPayload = JSON.stringify(payload);
  return Buffer.from(jsonPayload).toString("base64");
}

// Function to generate unique merchantTransactionId
function generateMerchantTransactionId(userId: string, amount: number): string {
  const uniqueString = `${userId}-${amount}`;
  const hash = crypto.createHash("sha256");
  hash.update(uniqueString);
  return hash.digest("hex").slice(0, 35); // Ensure length < 35 characters
}

// Function to generate unique merchantUserId
function generateMerchantUserId(userId: string): string {
  const uniqueString = `${userId}-${uuidv4()}`;
  const hash = crypto.createHash("sha256");
  hash.update(uniqueString);
  return hash.digest("hex").slice(0, 36); // Ensure length < 36 characters
}

export async function initiatePayment(req: Request, res: Response) {
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

    const { user_id, amount, redirect_url, redirect_mode, mobile_number } =
      req.body;

    // Generate unique merchantTransactionId and merchantUserId
    const merchantTransactionId = generateMerchantTransactionId(
      user_id,
      amount
    );
    const merchantUserId = generateMerchantUserId(user_id);

    const paymentPayload = {
      merchantId: "M1NBUBRXXYI7",
      merchantTransactionId,
      merchantUserId,
      amount,
      redirectUrl: redirect_url,
      redirectMode: redirect_mode,
      callbackUrl: callbackUrl,
      mobileNumber: mobile_number,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const base64Payload = base64Encode(paymentPayload);
    const xVerify = generateXVerify(base64Payload);

    console.log("Request Payload:", JSON.stringify(paymentPayload, null, 2));
    console.log("Base64 Encoded Payload:", base64Payload);
    console.log("X-VERIFY Header:", xVerify);

    const test = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
    const production = "https://api.phonepe.com/apis/hermes/pg/v1/pay";

    const response = await axios.post(
      "https://api.phonepe.com/apis/hermes/pg/v1/pay",
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", error.response?.data);
      res.status(500).json({
        error:
          error.response?.data ||
          "An error occurred while initiating the payment.",
      });
    } else {
      console.error("Unexpected Error:", error);
      res.status(500).json({
        error: "An unexpected error occurred while initiating the payment.",
      });
    }
  }
}

export async function handleCallback(req: Request, res: Response) {
  try {
    const { headers, body } = req;
    const xVerifyHeader = headers["x-verify"];

    // Ensure xVerifyHeader is a string
    if (typeof xVerifyHeader !== "string") {
      return res.status(400).json({ error: "Invalid X-VERIFY header" });
    }

    // Verify the X-VERIFY header
    if (!validateXVerify(body.request, xVerifyHeader)) {
      return res.status(400).json({ error: "Invalid X-VERIFY header" });
    }

    // Process the callback data
    console.log("Callback received:", body);

    // Example processing logic
    // You should handle the payment status update here

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Callback Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the callback." });
  }
}

// Function to validate the X-VERIFY header
function validateXVerify(payload: string, xVerifyHeader: string): boolean {
  const saltIndex = "1";
  const endpoint = "/pg/v1/pay";
  const hash = crypto.createHash("sha256");
  hash.update(payload + endpoint + SALT_KEY);
  const checksum = hash.digest("hex");
  return `${checksum}###${saltIndex}` === xVerifyHeader;
}

// Function to generate the X-Verify header
function generatedXVerify(endpoint: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(endpoint + SALT_KEY);
  const checksum = hash.digest("hex");
  return `${checksum}###${SALT_INDEX}`;
}

// New endpoint to check transaction status
export async function checkTransactionStatus(req: Request, res: Response) {
  try {
    // Validation Error Handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { merchantTransactionId } = req.params;

    const endpoint = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
    const xVerify = generatedXVerify(endpoint);

    console.log("X-VERIFY Header:", xVerify);

    const response = await axios.get(
      `https://api.phonepe.com/apis/hermes${endpoint}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          "X-MERCHANT-ID": MERCHANT_ID,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", error.response?.data);
      res.status(500).json({
        error:
          error.response?.data ||
          "An error occurred while checking the transaction status.",
      });
    } else {
      console.error("Unexpected Error:", error);
      res.status(500).json({
        error:
          "An unexpected error occurred while checking the transaction status.",
      });
    }
  }
}
