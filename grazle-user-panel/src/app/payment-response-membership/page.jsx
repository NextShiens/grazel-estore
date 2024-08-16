"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { sendPaymentApiencResponseMembership } from '@/apis';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaQuestionCircle, FaHourglassEnd } from 'react-icons/fa';

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
      if (!sessionStorage.getItem('pageReloaded')) {
        sessionStorage.setItem('pageReloaded', 'true');
        window.location.reload();
        return;
      }

      log("Payment response page loaded", {
        searchParams: Object.fromEntries(searchParams),
      });

      const encResp = searchParams?.get('encResp');
      if (!encResp) {
        log("No encResp found in search params");
        setStatus('error');
        setError('Missing payment response data');
        return;
      }

      try {
        log("Sending payment response to API", { encResp });
        const formData = new FormData();
        formData.append('encResp', encResp);

        const response = await sendPaymentApiencResponseMembership(formData);
        log("Received API response", { response: response?.data });

        if (response?.data?.success) {
          const paymentData = response?.data?.data;
          setPaymentDetails(paymentData);

          switch (paymentData?.order_status) {
            case 'Success':
              setStatus('success');
              toast.success('Payment successful!');
              break;
            case 'Failure':
              setStatus('failed');
              toast.error('Payment failed. Please try again.');
              break;
            case 'Aborted':
              setStatus('aborted');
              toast.info('Payment was cancelled.');
              break;
            case 'Invalid':
              setStatus('invalid');
              toast.error('Invalid payment request. Please try again.');
              break;
            case 'Timeout':
              setStatus('timeout');
              toast.warn('Payment request timed out. Please try again.');
              break;
            default:
              setStatus('unknown');
              toast.warn('Payment status is unknown. Please contact support.');
          }
        } else {
          throw new Error('Failed to process payment response');
        }
      } catch (error) {
        log("Error processing payment response", { error: error?.message, stack: error?.stack });
        setStatus('error');
        setError(error?.message);
        toast.error('An error occurred while processing your payment. Please try again.');
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
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const StatusIcon = () => {
    switch (status) {
      case 'success':
        return <FaCheckCircle className="mx-auto text-green-500 text-6xl mb-4" />;
      case 'failed':
      case 'error':
        return <FaTimesCircle className="mx-auto text-red-500 text-6xl mb-4" />;
      case 'aborted':
        return <FaExclamationTriangle className="mx-auto text-yellow-500 text-6xl mb-4" />;
      case 'invalid':
        return <FaQuestionCircle className="mx-auto text-orange-500 text-6xl mb-4" />;
      case 'timeout':
        return <FaHourglassEnd className="mx-auto text-blue-500 text-6xl mb-4" />;
      default:
        return <FaQuestionCircle className="mx-auto text-gray-500 text-6xl mb-4" />;
    }
  };

  const StatusMessage = () => {
    switch (status) {
      case 'success':
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-4">Your order has been successfully placed.</p>
          </>
        );
      case 'failed':
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-4">{paymentDetails?.status_message || "We couldn't process your payment. Please try again."}</p>
          </>
        );
      case 'aborted':
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
            <p className="text-gray-600 mb-4">You have cancelled the payment process.</p>
          </>
        );
      case 'invalid':
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Payment</h1>
            <p className="text-gray-600 mb-4">The payment request was invalid. Please try again or contact support.</p>
          </>
        );
      case 'timeout':
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Timeout</h1>
            <p className="text-gray-600 mb-4">The payment request timed out. Please try again.</p>
          </>
        );
      case 'error':
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
            <p className="text-gray-600 mb-4">{error || "An unexpected error occurred."}</p>
          </>
        );
      default:
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Status Unknown</h1>
            <p className="text-gray-600 mb-4">We couldn't determine the status of your payment. Please contact support.</p>
          </>
        );
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="text-center">
            <StatusIcon />
            <StatusMessage />
          </div>
          {paymentDetails && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Transaction Details</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-600">Order ID:</p>
                <p className="text-gray-800 font-medium">{paymentDetails?.order_id}</p>
                <p className="text-gray-600">Amount:</p>
                <p className="text-gray-800 font-medium">₹{paymentDetails?.amount}</p>
                <p className="text-gray-600">Transaction ID:</p>
                <p className="text-gray-800 font-medium">{paymentDetails?.tracking_id}</p>
                <p className="text-gray-600">Date:</p>
                <p className="text-gray-800 font-medium">{paymentDetails?.trans_date}</p>
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleBackToHome}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}