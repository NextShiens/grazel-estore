"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaCircleCheck } from "react-icons/fa6";
import Dots from "@/assets/Group 1820549907.png";
import { clearCart } from "@/features/features";
import { useDispatch } from "react-redux";
import { sendPaymentApiencResponse } from "@/apis";
const log = (message, data = {}) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    message,
    ...data
  }));
};
export default function PaymentSuccessPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      log("Payment success page loaded, starting payment processing");
      try {
        // Attempt to get the form data
        const urlParams = new URLSearchParams(window.location.search);
        const encResp = urlParams.get('encResp');
        const orderNo = urlParams.get('orderNo');
        const accessCode = urlParams.get('accessCode');

        if (!encResp) {
          log("Missing encResp parameter");
          throw new Error('Missing encResp parameter');
        }

        const datas = {
          encResp,
          orderNo,
          accessCode,
        };
        const formData = new FormData(datas);

        log("Sending payment response to API", { formData });
        const response = await sendPaymentApiencResponse(formData);
        log("Received API response", { response: response.data });

        if (response.data.success) {
          log("Payment successful, updating state", { paymentDetails: response.data.paymentDetails });
          setPaymentDetails(response.data.paymentDetails);
          dispatch(clearCart());
          log("Cart cleared");
        } else {
          throw new Error('Payment was not successful');
        }
      } catch (error) {
        log("Error processing payment", { error: error.message, stack: error.stack });
        setError('Failed to process payment. Please try again.');
      }
    };

    processPayment();
  }, [dispatch]);

  const handleBackToHome = () => {
    log("User clicked 'Back to Home'");
    router.push("/");
  };

  if (error) {
    log("Rendering error state", { error });
    return <div className="text-red-500">{error}</div>;
  }

  if (!paymentDetails) {
    log("Rendering loading state");
    return <div>Processing payment...</div>;
  }

  log("Rendering success state", { paymentDetails });
  return (
    <div className="flex flex-col justify-center items-center w-full h-screen bg-gray-100">
      <div className="flex flex-col justify-center items-center w-full max-w-[400px] h-auto p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-[22px]">
          <Image src={Dots} alt="" className="h-[64px] w-[64px]" />
          <FaCircleCheck className="text-[#4CAF50] h-[105px] mx-[16px] w-[105px] sm:h-[80px] sm:w-[80px]" />
          <Image src={Dots} alt="" className="h-[64px] w-[64px]" />
        </div>
        <h1 className="mt-5 text-[32px] text-center font-semibold text-[#434343] sm:text-[24px]">
          Payment Successful!
        </h1>
        <p className="mt-3 text-[16px] text-center font-semibold text-[#434343] sm:text-[14px]">
          Your order {paymentDetails.orderNo} has been successfully placed and payment has been received.
        </p>
        <p className="mt-2 text-[14px] text-center text-[#777777]">
          You will receive an email confirmation shortly.
        </p>
        <button
          className="mt-[30px] bg-[#F69B26] rounded-lg h-[50px] w-full text-white font-medium sm:h-[40px]"
          onClick={handleBackToHome}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

