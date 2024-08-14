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

  useEffect(() => {
    const handlePaymentResponse = async () => {
      log("Payment response page loaded", {
        searchParams: Object.fromEntries(searchParams),
      });

      const encResp = searchParams.get('encResp');

      if (!encResp) {
        log("No encResp found in search params");
        setStatus('error');
        setError('Missing encResp parameter');
        return;
      }

      try {
        log("Sending payment response to API", { encResp });
        const response = await sendPaymentApiencResponse({ encResp });
        log("Received API response", { response: response.data });

        if (response.data.success) {
          setStatus('success');
          setPaymentDetails(response.data.paymentDetails);
          toast.success('Payment successful!');
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
                <p>Order ID: {paymentDetails.orderNo}</p>
                <p>Amount: ₹{paymentDetails.amount}</p>
                <p>Transaction ID: {paymentDetails.transactionId}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <FaTimesCircle className="text-red-500 text-6xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-4">We couldn't process your payment. Please try again.</p>
            {error && <p className="text-sm text-red-500 mb-4">Error: {error}</p>}
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