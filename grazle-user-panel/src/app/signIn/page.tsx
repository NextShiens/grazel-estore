"use client";

import Link from "next/link";
import Image from "next/image";
import { loginApi, editPasswordApi, forgetPasswordApi } from "@/apis";
import { loginAction } from "@/lib";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import { Checkbox } from "@mui/material";
import { IoMdMail } from "react-icons/io";
import { useDispatch } from "react-redux";
import logo from "@/assets/Grazle Logo.png";
import { TiLockClosed } from "react-icons/ti";
import { updateUser } from "@/features/features";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BiLoader } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgetPassword, setShowForgetPassword] = useState(false);
  const [forgetPasswordEmail, setForgetPasswordEmail] = useState("");
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/");
    }
  }, []);

  async function onLogin(formdata: any) {
    try {
      setLoading(true);
      const { data } = await loginApi(formdata);
      if (data?.user?.role === "seller") {
        toast.warning("Seller account cannot login here");
        setLoading(false);
        window.location.href = "https://seller.grazle.co.in/";
        return;
      }
      handleLoginSuccess(data);
    } catch (err: any) {
      setLoading(false);
      toast.error(err?.response?.data?.message);
    }
  }

  const handleLoginSuccess = async (data: any) => {
    dispatch(updateUser(data?.user));
    if (typeof window !== "undefined") {
      localStorage.setItem('theUser', JSON.stringify(data?.user))
      localStorage.setItem("token", data?.token);
      localStorage.setItem("name", data?.user?.username);
      localStorage.setItem("image", data?.user?.profile?.image);
    }
    console.log("login data", data);
    toast.success("Login Successfully");
    await loginAction(data?.user);
    setLoading(false);
    router.push("/");
  }

  const handleForgetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgetPasswordApi(forgetPasswordEmail);
      toast.info("Password reset link sent to your email");
      setShowForgetPassword(false);
    } catch (error) {
      toast.error("Failed to send password reset link. Please try again.");
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      // Create a FormData object and append the token
      const formData = new FormData();
      formData.append('token', credentialResponse.credential);
  
      // Send the FormData object in the fetch request
      const response = await fetch(`https://api.grazle.co.in/api/auth/google`, {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
      if (response.ok) {
        handleLoginSuccess(data);
      } else {
        toast.error(data.message || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("An error occurred during Google login");
    }
  };

  return (
    <GoogleOAuthProvider clientId="259266080487-j1o6tglrpkl4lg8s4edkp9b8vn3l9nf0.apps.googleusercontent.com">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onLogin(Object.fromEntries(formData));
        }}
        className="w-[100%] lg:h-auto flex items-center justify-center flex-wrap md:flex-wrap sm:flex-wrap sm:h-auto md:h-auto"
      >
        <div className="lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%] h-auto md:p-[50px] p-[20px] mb-5 rounded-lg py-[50px] border border-[#F5F7F9] shadow-lg">
          <div className="flex flex-col justify-center items-center ">
            <Image src={logo} alt="" width={210} height={125} />
            <p className="mt-6 md:text-[40px] text-[30px] font-semibold">
              Welcome Back
            </p>
            <p className="md:text-[18px] text-[14px] font-medium text-[#777777]">
              Please log in into your account
            </p>
          </div>

          {!showForgetPassword ? (
            <>
              <div>
                <div className="relative mt-[40px] w-full">
                  <IoMdMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#777777] text-[20px]" />
                  <input
                    className="bg-[#F5F7F9] pl-11 w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                    placeholder="Email Address"
                    type="email"
                    name="email"
                    required
                  />
                </div>

                <div className="relative mt-[20px] w-full">
                  <TiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#777777] text-[24px]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="bg-[#F5F7F9] pl-11 w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                    placeholder="Password"
                    name="password"
                    required
                  />
                  <div
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#777777] text-[24px]"
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center">
                  <Checkbox
                    sx={{
                      color: "#00000040",
                      "& .MuiSvgIcon-root": { fontSize: 24 },
                      "&.Mui-checked": { color: "#F70000" },
                    }}
                  />
                  <p className="text-[#777777] font-normal text-[16px]">
                    Remember me!
                  </p>
                </div>

                <p
                  className="text-[#F70000] font-medium text-[16px] cursor-pointer"
                  onClick={() => setShowForgetPassword(true)}
                >
                  Forgot Password?
                </p>
              </div>

              <button type="submit" className="bg-[#F70000] flex justify-center items-center rounded-xl h-[50px] mt-[30px] w-[100%] text-[18px] font-medium text-white">
                {loading ? <BiLoader className="animate-spin h-6 w-6" /> : "Sign in"}
              </button>

              <div className="flex items-center mt-5">
                <div className="flex-grow border-b border-[#77777729]"></div>
                <div className="w-fit px-3">
                  <span className="text-[#777777] text-[14px] font-normal">
                    or log in with
                  </span>
                </div>
                <div className="flex-grow border-b border-[#77777729]"></div>
              </div>

              <div className="flex justify-center mt-5">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => {
                    console.log('Login Failed');
                    toast.error("Google login failed");
                  }}
                />
              </div>
            </>
          ) : (
            <div className="mt-[40px]">
              <h3 className="text-[24px] font-semibold mb-4">Forgot Password</h3>
              <p className="text-[#777777] mb-4">Enter your email address to reset your password.</p>
              <div className="relative w-full">
                <IoMdMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#777777] text-[20px]" />
                <input
                  className="bg-[#F5F7F9] pl-11 w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                  placeholder="Email Address"
                  type="email"
                  value={forgetPasswordEmail}
                  onChange={(e) => setForgetPasswordEmail(e.target.value)}
                  required
                />
              </div>
              <button
                onClick={handleForgetPassword}
                className="bg-[#F70000] flex justify-center items-center rounded-xl h-[50px] mt-[30px] w-[100%] text-[18px] font-medium text-white"
              >
                Reset Password
              </button>
              <p
                className="text-[#F70000] font-medium text-[16px] mt-4 text-center cursor-pointer"
                onClick={() => setShowForgetPassword(false)}
              >
                Back to Login
              </p>
            </div>
          )}

          <p className="font-normal text-[#777777] text-[16px] text-center mt-10">
            Don't have an account?
            <Link href="/registration">
              <strong className="ml-2 font-medium text-[#F70000]">Sign Up</strong>
            </Link>
          </p>
        </div>
      </form>
    </GoogleOAuthProvider>
  );
};

export default function SignInPage() {
  return <Login />;
}