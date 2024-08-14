'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { sendPaymentApiencResponse } from '@/apis';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const log = (message, data = {}) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    message,
    ...data
  }));
};

export default function PaymentResponsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);

  const [encResp, setEncResp] = useState(null);

  useEffect(() => {
    async function fetchEncResp() {
      const response = await fetch('/api/payment-response', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setEncResp(data.encResp);
    }

    fetchEncResp();
  }, []);

  useEffect(() => {
    const handlePaymentResponse = async () => {
      if (!sessionStorage.getItem('pageReloaded')) {
        sessionStorage.setItem('pageReloaded', 'true');
        window.location.reload();
        return;
      }

      // log("Payment response page loaded", {
      //   searchParams: Object.fromEntries(searchParams),
      // });

      // const encResp = searchParams.get('encResp');
      // if (!encResp) {
      //   log("No encResp found in search params");
      //   setStatus('error');
      //   setError('Missing encResp parameter');
      //   return;
      // }

      try {
        log("Sending payment response to API", { encResp });
        const formData = new FormData();
        formData.append('encResp', encResp);

        const response = await sendPaymentApiencResponse(formData);
        log("Received API response", { response: response.data });

        if (response.data.success) {
          const paymentData = response.data.data;

          if (paymentData.order_status === 'Success') {
            setStatus('success');
            setPaymentDetails(paymentData);
            toast.success('Payment successful!');
          } else {
            setStatus('failed');
            setPaymentDetails(paymentData);
            toast.error('Payment failed or aborted. Please try again.');
          }
        } else {
          throw new Error('Payment was not successful');
        }
      } catch (error) {
        log("Error processing payment response", { error: (error).message, stack: (error).stack });
        setStatus('error');
        setError((error).message);
        toast.error('Payment failed. Please try again.');
      }
    };

    handlePaymentResponse();
  }, [searchParams]);

  const handleBackToHome = () => {
    log("User clicked 'Back to Home'");
    router.push("/");
  };

  if (status === 'processing') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-screen bg-gray-100">
      <div className="flex flex-col justify-center items-center w-full max-w-[400px] h-auto p-8 bg-white rounded-lg shadow-lg">
        {status === 'success' ? (
          <>
            <FaCheckCircle className="text-green-500 text-6xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-4">Your order has been successfully placed.</p>
            {paymentDetails && (
              <div className="text-sm text-gray-500 mb-4">
                <p>Order ID: {paymentDetails.order_id}</p>
                <p>Amount: ₹{paymentDetails.amount}</p>
                <p>Transaction ID: {paymentDetails.tracking_id}</p>
              </div>
            )}
          </>
        ) : status === 'failed' ? (
          <>
            <FaTimesCircle className="text-red-500 text-6xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-4">{paymentDetails?.status_message || "We couldn't process your payment. Please try again."}</p>
            {paymentDetails && (
              <div className="text-sm text-gray-500 mb-4">
                <p>Order ID: {paymentDetails.order_id}</p>
                <p>Amount: ₹{paymentDetails.amount}</p>
                <p>Transaction ID: {paymentDetails.tracking_id}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <FaTimesCircle className="text-red-500 text-6xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
            <p className="text-gray-600 mb-4">{error || "An unexpected error occurred."}</p>
          </>
        )}
        <button
          onClick={handleBackToHome}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
