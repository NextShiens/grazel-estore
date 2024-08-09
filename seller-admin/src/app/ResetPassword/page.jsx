"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { BiLoader } from "react-icons/bi";
import { TiLockClosed } from "react-icons/ti";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../../assets/grazle-logo.png";

const ResetPassword = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (!urlToken) {
      toast.error("Invalid or missing reset token");
      router.push('/signIn');
    } else {
      setToken(urlToken);
    }
  }, [router]);

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('new_password', newPassword);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success("Password reset successfully");
        router.push('/signIn');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div className="flex justify-center items-center h-screen">Redirecting...</div>;
  }

  return (
    <div className="w-[100%] flex items-center justify-center min-h-screen bg-gray-100">
      <div className="lg:w-[50%] w-[90%] sm:w-[80%] md:w-[70%] bg-white p-8 rounded-lg shadow-lg">
        <div className="flex flex-col justify-center items-center mb-8">
          <Image src={logo} alt="Grazle Logo" className="w-[210px] h-[125px]" />
          <h1 className="mt-6 text-3xl font-semibold">Reset Your Password</h1>
          <p className="mt-2 text-lg text-gray-600">Enter your new password below</p>
        </div>

        <form onSubmit={handleResetPassword}>
          <div className="relative mb-6">
            <TiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type={showPassword ? "text" : "password"}
              className="bg-gray-100 pl-11 w-full rounded-md h-[50px] p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <div
              onClick={() => togglePasswordVisibility('password')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </div>
          </div>

          <div className="relative mb-6">
            <TiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="bg-gray-100 pl-11 w-full rounded-md h-[50px] p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#F70000] flex justify-center items-center rounded-xl h-[50px] w-full text-lg font-medium text-white hover:bg-red-600 transition duration-300"
            disabled={loading}
          >
            {loading ? <BiLoader className="animate-spin h-6 w-6" /> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;