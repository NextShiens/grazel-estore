"use client";

import React, { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { BiLoader } from "react-icons/bi";
import { IoMdMail } from "react-icons/io";
import grazleLogo from "../../assets/grazle-logo.png";

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Password reset instructions sent to your email");
        // Optionally, you can redirect to a confirmation page or back to signin
        // router.push('/signin');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to send reset instructions");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[100%] flex items-center justify-center min-h-screen bg-gray-100">
      <div className="lg:w-[50%] w-[90%] sm:w-[80%] md:w-[70%] bg-white p-8 rounded-lg shadow-lg">
        <div className="flex flex-col justify-center items-center mb-8">
          <Image src={grazleLogo} alt="Grazle Logo" className="w-[210px] h-[125px]" />
          <h1 className="mt-6 text-3xl font-semibold">Forgot Password</h1>
          <p className="mt-2 text-lg text-gray-600">Enter your email to reset your password</p>
        </div>

        <form onSubmit={handleForgotPassword}>
          <div className="relative mb-6">
            <IoMdMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="email"
              className="bg-gray-100 pl-11 w-full rounded-md h-[50px] p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="bg-[#F70000] flex justify-center items-center rounded-xl h-[50px] w-full text-lg font-medium text-white hover:bg-red-600 transition duration-300"
            disabled={loading}
          >
            {loading ? <BiLoader className="animate-spin h-6 w-6" /> : "Send Reset Instructions"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/signin" className="text-[#F70000] hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;