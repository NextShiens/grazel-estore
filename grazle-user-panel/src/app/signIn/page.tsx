"use client";

import Link from "next/link";
import Image from "next/image";
import { loginApi } from "@/apis";
import { loginAction } from "@/lib";
import login from "@/assets/login.png";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import { Checkbox } from "@mui/material";
import { IoMdMail } from "react-icons/io";
import { useDispatch } from "react-redux";
import logo from "@/assets/Grazle Logo.png";
import { TiLockClosed } from "react-icons/ti";
import { updateUser } from "@/features/features";
import google from "@/assets/Group 1820549999.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BiLoader } from "react-icons/bi";
import { useRouter } from "next/navigation";

const Login = () => {
  console.log("login page");
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
      dispatch(updateUser(data?.user));
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data?.token);
        localStorage.setItem("name", data?.user?.username);
        localStorage.setItem("image", data?.user?.profile?.image);
      }
      console.log("login data", data);
      toast.success("Login Successfully");

      if (data.user.role === "seller") {
        window.location.href = "https://grazle-seller-green.vercel.app/";
      }
      await loginAction(formdata);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);

      toast.error(err?.response.data.message);
    }
  }

  return (
    <form
      action={onLogin}
      className="w-[100%] lg:h-auto flex items-center justify-center flex-wrap md:flex-wrap sm:flex-wrap sm:h-auto md:h-auto "
    >
      {/* <div className="lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%] bounded-5xl pt-8">
        <Image src={login} alt="" />
      </div> */}

      <div className="lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%] h-auto md:p-[50px] p-[20px] mb-5 rounded-lg py-[50px] border border-[#F5F7F9] shadow-lg">
        <div className="flex flex-col justify-center items-center ">
          <Image src={logo} alt="" className="w-[210px] h-[125px]" />
          <p className="mt-6 md:text-[40px] text-[30px] font-semibold">
            Welcome Back
          </p>
          <p className="md:text-[18px] text-[14px] font-medium text-[#777777]">
            Please log in into your account
          </p>
        </div>

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
                "& .MuiSvgIcon-root": {
                  fontSize: 24,
                },
                "&.Mui-checked": {
                  color: "#F70000",
                },
              }}
            />
            <p className="text-[#777777] font-normal text-[16px] ">
              Remember me!
            </p>
          </div>

          <p className="text-[#F70000] font-medium text-[16px] ">
            Forgot Password?
          </p>
        </div>

        <button className=" bg-[#F70000] flex justify-center items-center rounded-xl h-[50px] mt-[30px] w-[100%] text-[18px] font-medium text-white">
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

        <div className="flex md:flex-row flex-col justify-center items-center md:gap-4">
          {/* <button className=" bg-[#00000012] rounded-xl h-[50px] mt-[30px] w-[100%] text-[18px] font-medium text-black">
            Log in with Apple
          </button> */}

          <button className="flex justify-center items-center md:w-[50%] w-full gap-4 bg-[#F7000012] rounded-xl h-[50px] mt-[30px] w-[100%] text-[18px] font-medium text-black">
            <Image src={google} alt="google" className="w-[25px] h-[25px]" />
            <span>Log in with Google</span>
          </button>
        </div>

        <p className="font-normal text-[#777777] text-[16px] text-center mt-10">
          Don’t have an account?
          <Link href="/registration">
            <strong className="ml-2 font-medium text-[#F70000]">Sign Up</strong>
          </Link>
        </p>
      </div>
    </form>
  );
};

export default function SignInPage() {
  return <Login />;
}
