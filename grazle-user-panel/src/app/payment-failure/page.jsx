"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaCircleXmark } from "react-icons/fa6";
import Dots from "@/assets/Group 1820549907.png";

export default function PaymentFailurePage() {
  const router = useRouter();

  const handleTryAgain = () => {
    router.push("/CartPage");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

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
          We're sorry, but your payment could not be processed at this time.
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