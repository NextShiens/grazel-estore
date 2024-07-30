import axios from "axios";
import crypto from "crypto";

const privateKey = "mkxJlC2vW5Oo9rpGQ0iR";
const publicKey = "QAT3F5reixLjyhUZWv7C";

const baseURL = "https://shipping-api.com/app/api/v1"; // Example base URL, adjust according to Shipmozo API documentation

function generateHMACSignature(data: string, key: string): string {
  return crypto.createHmac("sha256", key).update(data).digest("hex");
}

async function createOrder(orderData: any) {
  const url = `${baseURL}/orders`;
  const signature = generateHMACSignature(
    JSON.stringify(orderData),
    privateKey
  );

  try {
    const response = await axios.post(url, orderData, {
      headers: {
        "Content-Type": "application/json",
        "Public-Key": publicKey,
        Signature: signature,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating order with Shipmozo:",
      error.response?.data || error.message
    );
    throw error;
  }
}

export { createOrder };
