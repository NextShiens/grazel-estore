// import * as CryptoJS from "crypto-js";
// import { paymentConfig } from "../config/payment";

// export function encrypt(data: string): string {
//   const key = CryptoJS.enc.Utf8.parse(paymentConfig.encryptionKey);
//   const iv = CryptoJS.lib.WordArray.random(16); // Generate a random IV
//   const encrypted = CryptoJS.AES.encrypt(data, key, {
//     iv: iv,
//     mode: CryptoJS.mode.CBC,
//   }).toString();
//   return iv.toString(CryptoJS.enc.Base64) + ":" + encrypted; // Return IV and encrypted data together
// }


// export function decrypt(data: string): string {
//   try {
//     const key = CryptoJS.enc.Utf8.parse(paymentConfig.encryptionKey);

//     // Extract IV from the encrypted data
//     const parts = data.split(":");
//     if (parts.length !== 2) {
//       throw new Error("Invalid encrypted data format");
//     }

//     const iv = CryptoJS.enc.Base64.parse(parts[0]);

//     // Decrypt using the extracted IV
//     const encryptedData = parts[1];
//     const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
//       iv: iv,
//       mode: CryptoJS.mode.CBC,
//     }).toString(CryptoJS.enc.Utf8);
//     return decrypted;
//   } catch (error) {
//     console.error("Error in decryption:", error);
//     throw new Error("Failed to decrypt data");
//   }
// }
