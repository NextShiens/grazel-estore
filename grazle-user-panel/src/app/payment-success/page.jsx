import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaCircleCheck, FaSpinner } from "react-icons/fa6";
import Dots from "@/assets/Group 1820549907.png";
import { clearCart } from "@/features/features";
import { useDispatch } from "react-redux";
import { sendPaymentApiencResponse } from "@/api";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      log("Payment success page loaded, starting payment processing");
      try {
        const form = document.querySelector('form');
        if (!form) {
          throw new Error('Form not found');
        }
        const formData = new FormData(form);
        const formDataObj = Object.fromEntries(formData);
        
        log("Sending payment response to API", { formData: formDataObj });
        const response = await sendPaymentApiencResponse(formDataObj);
        log("Received API response", { response });
        
        if (response.success) {
          log("Payment successful, updating state", { paymentDetails: response.data });
          setPaymentDetails(response.data);
          dispatch(clearCart());
          log("Cart cleared");
        } else {
          throw new Error(response.message || 'Payment was not successful');
        }
      } catch (error) {
        log("Error processing payment", { error: error.message, stack: error.stack });
        setError('Failed to process payment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [dispatch, router]);

  const handleBackToHome = () => {
    log("User clicked 'Back to Home'");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen bg-gray-100">
        <FaSpinner className="animate-spin text-4xl text-[#F69B26] mb-4" />
        <p className="text-lg font-semibold text-gray-600">Processing payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Payment Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            className="w-full bg-[#F69B26] text-white font-bold py-2 px-4 rounded hover:bg-[#E58A15] transition duration-300"
            onClick={() => router.push("/CartPage")}
          >
            Return to Cart
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
          <FaCircleCheck className="text-[#4CAF50] h-24 w-24 mx-4" />
          <Image src={Dots} alt="" className="h-16 w-16" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Payment Successful!
        </h1>
        <div className="space-y-4">
          <p className="text-center text-gray-600">
            Your order <span className="font-semibold">{paymentDetails.order_id}</span> has been successfully placed.
          </p>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500 mb-2">Transaction Details:</p>
            <p className="text-sm"><span className="font-medium">Amount:</span> {paymentDetails.currency} {paymentDetails.amount}</p>
            <p className="text-sm"><span className="font-medium">Date:</span> {paymentDetails.trans_date}</p>
            <p className="text-sm"><span className="font-medium">Tracking ID:</span> {paymentDetails.tracking_id}</p>
          </div>
          <p className="text-sm text-center text-gray-500">
            You will receive an email confirmation shortly.
          </p>
        </div>
        <button
          className="mt-8 w-full bg-[#F69B26] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#E58A15] transition duration-300"
          onClick={handleBackToHome}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}