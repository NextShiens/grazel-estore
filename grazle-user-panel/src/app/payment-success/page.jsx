"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaCircleCheck } from "react-icons/fa6";
import Dots from "@/assets/Group 1820549907.png";
import { clearCart } from "@/features/features";
import { useDispatch } from "react-redux";



export default function PaymentSuccessPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  dispatch(clearCart());

  const handleBackToHome = () => {
    router.push("/");
  };

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
          Your order has been successfully placed and payment has been received.
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