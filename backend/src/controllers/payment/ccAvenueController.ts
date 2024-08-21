import { Request, Response } from "express";
import { decrypt, encrypt } from "../../utils/encryption";
import { paymentConfig } from "../../config/payment";

const merchantId = paymentConfig.merchantId;

export async function initiatePayment(req: Request, res: Response) {
  try {
    const {
      order_id,
      currency,
      amount,
      redirect_url,
      cancel_url,
      payment_option,
      card_type,
      card_name,
      card_number,
      expiry_month,
      expiry_year,
      cvv_number,
      issuing_bank,
      mobile_no,
      mm_id,
      otp,
      virtualAddress,
    } = req.body;

    const requestData = {
      merchant_id: merchantId,
      order_id,
      currency,
      amount,
      redirect_url,
      cancel_url,
      payment_option,
      card_type,
      card_name,
      data_accept: "Y",
      card_number,
      expiry_month,
      expiry_year,
      cvv_number,
      issuing_bank,
      mobile_no,
      mm_id,
      otp,
      virtualAddress,
    };

    const encRequest = encrypt(
      JSON.stringify(requestData),
      paymentConfig.workingKey
    );

    res.status(200).json({
      encRequest: encRequest,
      accessCode: paymentConfig.accessCode,
      actionUrl:
        "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
    });
  } catch (error) {
    console.error("Error in initiatePayment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function handlePaymentResponse(req: Request, res: Response) {
  try {
    let ccavEncResponse = "";

    req.on("data", (data) => {
      ccavEncResponse += data;
    });

    req.on("end", () => {
      const ccavPOST = new URLSearchParams(ccavEncResponse);
      const encryption = ccavPOST.get("encResp") || "";
      const ccavResponse = decrypt(encryption, paymentConfig.workingKey);

      let responseData = {} as any;
      ccavResponse.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        responseData[key] = value;
      });

      res.status(200).json(responseData);
    });
  } catch (error) {
    console.error("Error in handlePaymentResponse:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
