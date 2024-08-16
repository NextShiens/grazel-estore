"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaCircleXmark, FaSpinner } from "react-icons/fa6";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      log("Payment failure page loaded, starting payment processing");
      try {
        // Access form data from the POST request
        const formData = new FormData(document.querySelector('form'));
        const formDataObj = Object.fromEntries(formData);
        
        log("Extracted form data", { formData: formDataObj });

        // Send the form data to your API
        const response = await sendPaymentApiencResponse(formDataObj);
        log("Received API response", { response });
        
        if (response.success) {
          setPaymentDetails(response.data);
        } else {
          throw new Error(response.message || 'Failed to process payment response');
        }
      } catch (error) {
        log("Error processing payment response", { error: error.message, stack: error.stack });
        setError('Failed to process payment response. Please contact support.');
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen bg-gray-100">
        <FaSpinner className="animate-spin text-4xl text-[#F69B26] mb-4" />
        <p className="text-lg font-semibold text-gray-600">Processing payment result...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            className="w-full bg-[#F69B26] text-white font-bold py-2 px-4 rounded hover:bg-[#E58A15] transition duration-300"
            onClick={handleBackToHome}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Image src={Dots} alt="" className="h-16 w-16" />
          <FaCircleXmark className="text-[#F44336] h-24 w-24 mx-4" />
          <Image src={Dots} alt="" className="h-16 w-16" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Payment Failed
        </h1>
        <div className="space-y-4">
          <p className="text-center text-gray-600">
            We're sorry, but your payment for order <span className="font-semibold">{paymentDetails.order_id || paymentDetails.orderNo}</span> could not be processed.
          </p>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500 mb-2">Transaction Details:</p>
            <p className="text-sm"><span className="font-medium">Order No:</span> {paymentDetails.orderNo}</p>
            <p className="text-sm"><span className="font-medium">Encrypted Response:</span> {paymentDetails.encResp}</p>
            {paymentDetails.amount && <p className="text-sm"><span className="font-medium">Amount:</span> {paymentDetails.currency} {paymentDetails.amount}</p>}
            {paymentDetails.trans_date && <p className="text-sm"><span className="font-medium">Date:</span> {paymentDetails.trans_date}</p>}
            {paymentDetails.order_status && <p className="text-sm"><span className="font-medium">Status:</span> {paymentDetails.order_status}</p>}
            {paymentDetails.status_message && (
              <p className="text-sm"><span className="font-medium">Reason:</span> {paymentDetails.status_message}</p>
            )}
          </div>
          <p className="text-sm text-center text-gray-500">
            Please try again or choose a different payment method.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            className="w-full bg-[#F44336] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#D32F2F] transition duration-300"
            onClick={handleTryAgain}
          >
            Try Again
          </button>
          <button
            className="w-full bg-[#F69B26] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#E58A15] transition duration-300"
            onClick={handleBackToHome}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}