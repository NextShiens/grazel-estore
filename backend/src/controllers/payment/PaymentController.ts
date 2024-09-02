// import { Request, Response } from "express";
// import { encrypt, decrypt } from "../../helper/encryptionHelper";
// import { paymentConfig } from "../../config/payment";
// import { validationResult } from "express-validator";

// export class PaymentController {
//   async ccavenueBillingPage(req: Request, res: Response) {
//     try {
//       // Validation Error Handling
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         const result = errors.mapped();

//         const formattedErrors: Record<string, string[]> = {};
//         for (const key in result) {
//           formattedErrors[key.charAt(0).toLowerCase() + key.slice(1)] = [
//             result[key].msg,
//           ];
//         }

//         const errorCount = Object.keys(result).length;
//         const errorSuffix =
//           errorCount > 1
//             ? ` (and ${errorCount - 1} more error${errorCount > 2 ? "s" : ""})`
//             : "";

//         const errorResponse = {
//           success: false,
//           message: `${result[Object.keys(result)[0]].msg}${errorSuffix}`,
//           errors: formattedErrors,
//         };

//         return res.status(400).json(errorResponse);
//       }

//       const { order_id, amount, name, address } = req.body;
//       const currency = "INR";
//       const data = `merchant_id=${paymentConfig.merchantId}&order_id=${order_id}&currency=${currency}&amount=${amount}&redirect_url=${paymentConfig.redirectUrl}&cancel_url=${paymentConfig.cancelUrl}&billing_name=${name}&billing_address=${address}`;
//       const encryptedData = encrypt(data);
//       const url =
//         paymentConfig.environment === "test"
//           ? paymentConfig.testUrl
//           : paymentConfig.productionUrl;

//       res.json({ url, encryptedData });
//     } catch (error) {
//       console.error("Error in ccavenueBillingPage:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   }

//   async ccavenueIframeCheckout(req: Request, res: Response) {
//     try {
//       // Validation Error Handling
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         const result = errors.mapped();

//         const formattedErrors: Record<string, string[]> = {};
//         for (const key in result) {
//           formattedErrors[key.charAt(0).toLowerCase() + key.slice(1)] = [
//             result[key].msg,
//           ];
//         }

//         const errorCount = Object.keys(result).length;
//         const errorSuffix =
//           errorCount > 1
//             ? ` (and ${errorCount - 1} more error${errorCount > 2 ? "s" : ""})`
//             : "";

//         const errorResponse = {
//           success: false,
//           message: `${result[Object.keys(result)[0]].msg}${errorSuffix}`,
//           errors: formattedErrors,
//         };

//         return res.status(400).json(errorResponse);
//       }

//       const { order_id, amount, name, address } = req.body;
//       const currency = "INR";
//       const data = `merchant_id=${paymentConfig.merchantId}&order_id=${order_id}&currency=${currency}&amount=${amount}&redirect_url=${paymentConfig.redirectUrl}&cancel_url=${paymentConfig.cancelUrl}&integration_type=iframe_normal&billing_name=${name}&billing_address=${address}`;

//       const encryptedData = encrypt(data);
//       const url =
//         paymentConfig.environment === "test"
//           ? paymentConfig.testUrl
//           : paymentConfig.productionUrl;

//       res.json({ url, encryptedData });
//     } catch (error) {
//       console.error("Error in ccavenueIframeCheckout:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   }

//   async ccavenueCustomCheckout(req: Request, res: Response) {
//     try {
//       // Validation Error Handling
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         const result = errors.mapped();

//         const formattedErrors: Record<string, string[]> = {};
//         for (const key in result) {
//           formattedErrors[key.charAt(0).toLowerCase() + key.slice(1)] = [
//             result[key].msg,
//           ];
//         }

//         const errorCount = Object.keys(result).length;
//         const errorSuffix =
//           errorCount > 1
//             ? ` (and ${errorCount - 1} more error${errorCount > 2 ? "s" : ""})`
//             : "";

//         const errorResponse = {
//           success: false,
//           message: `${result[Object.keys(result)[0]].msg}${errorSuffix}`,
//           errors: formattedErrors,
//         };

//         return res.status(400).json(errorResponse);
//       }

//       const {
//         order_id,
//         amount,
//         payment_option,
//         card_type,
//         card_name,
//         card_number,
//         expiry_month,
//         expiry_year,
//         cvv_number,
//         name,
//         address,
//       } = req.body;
//       const currency = "INR";
//       const data = `merchant_id=${paymentConfig.merchantId}&order_id=${order_id}&currency=${currency}&amount=${amount}&redirect_url=${paymentConfig.redirectUrl}&cancel_url=${paymentConfig.cancelUrl}&payment_option=${payment_option}&card_type=${card_type}&card_name=${card_name}&card_number=${card_number}&expiry_month=${expiry_month}&expiry_year=${expiry_year}&cvv_number=${cvv_number}&billing_name=${name}&billing_address=${address}`;
//       const encryptedData = encrypt(data);
//       const url =
//         paymentConfig.environment === "test"
//           ? paymentConfig.testUrl
//           : paymentConfig.productionUrl;

//       res.json({ url, encryptedData });
//     } catch (error) {
//       console.error("Error in ccavenueCustomCheckout:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   }

//   ccavResponseHandler(req: Request, res: Response) {
//     try {
//       const { enc_resp } = req.body;
//       const decryptedData = decrypt(enc_resp);

//       // Parse the decrypted data to extract the transaction status
//       const responseData = new URLSearchParams(decryptedData);
//       const order_status = responseData.get("order_status");

//       if (order_status === "Success") {
//         // Handle success case
//         res.json({ status: "success", data: decryptedData });
//       } else if (order_status === "Aborted") {
//         // Handle aborted case
//         res.json({ status: "aborted", data: decryptedData });
//       } else if (order_status === "Failure") {
//         // Handle failure case
//         res.json({ status: "failure", data: decryptedData });
//       } else if (order_status === "Cancelled") {
//         // Handle cancelled case
//         res.json({ status: "cancelled", data: decryptedData });
//       } else {
//         // Handle unknown status
//         res.json({ status: "unknown", data: decryptedData });
//       }
//     } catch (error) {
//       console.error("Error in ccavResponseHandler:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// }
