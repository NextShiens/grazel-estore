import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const paymentConfig = {
  merchantId: process.env.PG_MERCHANT_ID || "2545596",
  accessCode: process.env.PG_ACCESS_CODE || "AVGV26KJ84CK39VGKC",
  encryptionKey:
    process.env.PG_ENCRYPTION_KEY || "7968E3A397D81CDC3191EE0A3E5F9671",
  redirectUrl: "http://grazle.co.in/ccavResponseHandler",
  cancelUrl: "http://grazle.co.in/ccavCancelHandler",
  testUrl:
    "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
  productionUrl:
    "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
  environment: process.env.PG_ENV || "test", // Change to 'production' when you go live
};
