"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaCircleXmark } from "react-icons/fa6";
import Dots from "@/assets/Group 1820549907.png";
import { sendPaymentApiencResponse } from "@/apis";
const log = (message, data = {}) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    message,
    ...data
  }));
};
export default function PaymentFailurePage() {
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      log("Payment failure page loaded, starting payment processing");
      try {
        const form = document.querySelector('form');
        if (!form) {
          log("Form not found");
          throw new Error('Form not found');
        }
        const formData = new FormData(form);
        const formDataObj = Object.fromEntries(formData);

        log("Sending payment response to API", { formData: formDataObj });
        const response = await sendPaymentApiencResponse(formDataObj);
        log("Received API response", { response: response.data });

        setPaymentDetails(response.data.paymentDetails);
      } catch (error) {
        log("Error processing payment response", { error: error.message, stack: error.stack });
        setError('Failed to process payment response. Please contact support.');
      }
    };

    processPayment();
  }, []);

  const handleTryAgain = () => {
    log("User clicked 'Try Again'");
    router.push("/CartPage");
  };

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
    return <div>Processing payment result...</div>;
  }

  log("Rendering failure state", { paymentDetails });
  return (
    <div className="flex flex-col justify-center items-center w-full h-screen bg-gray-100">
      <div className="flex flex-col justify-center items-center w-full max-w-[400px] h-auto p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-[22px]">
          <Image src={Dots} alt="" className="h-[64px] w-[64px]" />
          <FaCircleXmark className="text-[#F44336] h-[105px] mx-[16px] w-[105px] sm:h-[80px] sm:w-[80px]" />
          <Image src={Dots} alt="" className="h-[64px] w-[64px]" />
        </div>
        <h1 className="mt-5 text-[32px] text-center font-semibold text-[#434343] sm:text-[24px]">
          Payment Failed
        </h1>
        <p className="mt-3 text-[16px] text-center font-semibold text-[#434343] sm:text-[14px]">
          We're sorry, but your payment for order {paymentDetails.orderNo} could not be processed at this time.
        </p>
        <p className="mt-2 text-[14px] text-center text-[#777777]">
          Please try again or choose a different payment method.
        </p>
        <div className="flex mt-[30px] gap-4 justify-center w-full">
          <button
            className="bg-[#F70000] rounded-lg h-[50px] w-1/2 text-white font-medium sm:h-[40px]"
            onClick={handleTryAgain}
          >
            Try Again
          </button>
          <button
            className="bg-[#F69B26] rounded-lg h-[50px] w-1/2 text-white font-medium sm:h-[40px]"
            onClick={handleBackToHome}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}