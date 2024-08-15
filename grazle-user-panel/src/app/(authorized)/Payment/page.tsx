"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Radio, Checkbox } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";

import { ccavCheckoutApi } from "@/apis";
import CustomModal from "@/components/CustomModel";

import card from "@/assets/credit-card (3) 1.png";
import Pay from "@/assets/Group 1820550001.png";

export default function Payment() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const encodedData = searchParams.get("data");
    if (encodedData) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(encodedData));
        setPaymentData(decodedData);
        console.log("Payment Data", decodedData);
      } catch (error) {
        console.error("Error parsing payment data:", error);
        toast.error("Invalid payment data");
      }
    }
  }, [searchParams]);

  const purchaseMembershipPlan = async () => {
    if (!paymentData?.planId) {
      toast.error("Invalid plan ID");
      return false;
    }
  
    try {
      const formData = new FormData();
      formData.append("membership_plan_id", paymentData.planId);
  
      const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
      const response = await axios.post(`${BASE_URL}/purchase-membership-plan`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.data.success && response.data.membership) {
        const membershipId = response.data.membership.id;
        console.log("Membership plan purchased successfully, ID:", membershipId);
        toast.success("Membership plan purchased successfully");
        return membershipId;
      } else {
        throw new Error("Membership data not found in response");
      }
    } catch (error) {
      console.error("Error purchasing membership plan:", error);
      toast.error("Failed to purchase membership plan");
      return false;
    }
  };

  const onPayment = async (e) => {
    e.preventDefault();
    if (!paymentData || !paymentMethod) {
      toast.error("Missing payment data or payment method");
      return;
    }
  
    setLoading(true);
    try {
      // First, purchase the membership plan
      const membershipId = await purchaseMembershipPlan();
      if (!membershipId) {
        throw new Error("Failed to purchase membership plan");
      }
  
      console.log("Membership ID:", membershipId);
  
      // Then proceed with the payment only if membershipId is present
      if (membershipId) {
        if (paymentMethod === "ccavenue") {
          await handleCCAvenue(membershipId);
        } else if (paymentMethod === "phonepe") {
          await handlePhonePe();
        } else {
          throw new Error("Invalid payment method");
        }
      } else {
        throw new Error("Invalid membership ID");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCCAvenue = async (membershipId) => {
    // alert(membershipId, 'membershipId')
    const formData = new FormData();
    formData.append("order_id", membershipId);
    formData.append("amount", paymentData?.planPrice?.toString());
    formData.append(
      "redirect_url",
      `${window.location.origin}/api/payment-response-membership`
    );
    formData.append(
      "cancel_url",
      `${window.location.origin}/api/payment-response-membership`
    );
    formData.append("currency", "INR");
    formData.append("merchant_param1", membershipId);
    formData.append("merchant_param2", "true");

    try {
      const checkOutResponse = await ccavCheckoutApi(formData);
      if (checkOutResponse.data && checkOutResponse.data.ccavenueUrl) {
        const { ccavenueUrl, encRequest, accessCode } = checkOutResponse.data;
        const url = `${ccavenueUrl}&encRequest=${encRequest}&access_code=${accessCode}`;
        window.location.href = url;
        toast.success("Redirecting to payment gateway...");
      } else {
        throw new Error("Invalid response from payment initiation");
      }
    } catch (error) {
      console.error("CCAvenue payment initiation failed:", error);
      toast.error("Failed to initiate CCAvenue payment");
    }
  };

  const handlePhonePe = async () => {
    try {
      const formData = new FormData();
      const user = JSON.parse(localStorage.getItem("theUser"));
      formData.append("user_id", user?.id || "12");
      formData.append("amount", paymentData.planPrice.toString());
      formData.append(
        "redirect_url",
        `${window.location.origin}/payment-success`
      );
      formData.append("redirect_mode", "REDIRECT");

      const response = await axios.post(
        "https://api.grazle.co.in/api/phonepe/initiate-payment",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Payment initiated");
        router.replace(response.data.data.payment_url);
      } else {
        toast.error("Failed to initiate payment");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("An error occurred while initiating payment");
    }
  };

  return (
    <div className="flex mt-[40px] lg:mx-0 mx-2 sm:mx-2 md:mx-4 justify-center">
      <div className="h-[614px] w-[640px] text-center">
        <p className="text-[32px] font-bold">Select Payment</p>

        {paymentData && (
          <div className="rounded-3xl mt-[20px] flex items-center p-[35px] hover:border-[1px] border-[#F70000]">
            <div className="bg-[#FFA31A] rounded-sm flex items-center justify-center h-[61px] w-[58px]">
              <Image src={Pay} alt="" className="h-[29px] w-[29px]" />
            </div>
            <div className="text-[#777777] text-start ml-[32px]">
              <p className="text-[24px] font-medium">
                {paymentData.planName || "Plan"}
              </p>
              <p className="text-[15px] font-medium">
                {paymentData.planDescription || "Plan details"}
              </p>
            </div>
            <p className="text-[24px] font-bold text-[#F70000] ml-auto">
              ₹{paymentData.planPrice || ""}
            </p>
          </div>
        )}

        <form
          onSubmit={onPayment}
          style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
          className="w-[100%] rounded-3xl p-[20px] mt-4"
        >
          <div className="flex items-center gap-2 mt-2">
            <Image src={card} alt="Airpod" className="w-[30px] h-[30px] mr-2" />
            <p className="lg:text-[30px] text-[20px] sm:text-[24px] font-medium">
              All Payment Options Payment Plan
            </p>
          </div>

          <div
            className={`border-[1px] mt-4 p-3 flex items-center justify-between rounded-xl w-full ${
              paymentMethod === "ccavenue"
                ? "border-[#F70000]"
                : "border-[#777777]"
            }`}
          >
            <div className="flex items-center gap-2">
              <p className="text-lg text-[#2284b5] font-medium ml-2">CC</p>
              <p className="font-medium">Avenue</p>
            </div>
            <Radio
              sx={{
                color: "#F70000",
                "& .MuiSvgIcon-root": { fontSize: 24 },
                "&.Mui-checked": { color: "#F70000" },
              }}
              checked={paymentMethod === "ccavenue"}
              onChange={() => setPaymentMethod("ccavenue")}
            />
          </div>

          <div
            className={`border-[1px] mt-4 p-3 flex items-center justify-between rounded-xl w-full ${
              paymentMethod === "phonepe"
                ? "border-[#F70000]"
                : "border-[#777777]"
            }`}
          >
            <p className="text-lg font-medium text-purple-600">PhonePe</p>
            <Radio
              sx={{
                color: "#F70000",
                "& .MuiSvgIcon-root": { fontSize: 24 },
                "&.Mui-checked": { color: "#F70000" },
              }}
              checked={paymentMethod === "phonepe"}
              onChange={() => setPaymentMethod("phonepe")}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !agreedTerms || paymentMethod === ""}
            className="mt-10 bg-[#F70000] disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none rounded-md h-[50px] w-[100%] text-[18px] font-medium text-white"
          >
            {loading
              ? "Processing..."
              : `Pay ₹${paymentData ? paymentData.planPrice : "0"}`}
          </button>

          <div className="mt-3 flex items-center">
            <Checkbox
              sx={{
                color: "#FF8A1D",
                "& .MuiSvgIcon-root": { fontSize: 24 },
                "&.Mui-checked": { color: "#FF8A1D" },
              }}
              onChange={(e) => setAgreedTerms(e.target.checked)}
            />
            <p className="text-black font-normal text-sm">
              By Clicking I agree to all terms of services and{" "}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => router.push("/Terms&Conditions")}
              >
                Privacy & Policy
              </span>
              .
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
