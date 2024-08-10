"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Radio, Checkbox } from "@mui/material";
import { toast } from "react-toastify";
import { FaCircleCheck } from "react-icons/fa6";

import { ccavCheckoutApi, purchaseMembershipPlanApi, confirmPlanPaymentApi, initiatePhonePePaymentApi } from "@/apis";
import CustomModal from "@/components/CustomModel";

import card from "@/assets/credit-card (3) 1.png";
import Pay from "@/assets/Group 1820550001.png";
import Dots from "@/assets/Group 1820549907.png";

export default function Payment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [showSendModel, setShowSendModel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPending, setPending] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const encodedData = searchParams.get('data');
    if (encodedData) {
      const decodedData = JSON.parse(decodeURIComponent(encodedData));
      setPaymentData(decodedData);
      console.log("Payment Data", decodedData);
    }
  }, [searchParams]);
 console.log(paymentData, 'paymentData')
  const onPayment = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const { username, planPrice, planId, membershipId, address } = paymentData;
      const billingData = new FormData();


      if (paymentMethod === "ccavenue") {
        const billingData = new FormData();
        billingData.append("order_id", planId);
        billingData.append("name", username);
        billingData.append("amount", planPrice);
        billingData.append("plan_id", planId);
        billingData.append("address", address);
        billingData.append("currency", "INR");

        const response = await ccavCheckoutApi(billingData);
        if (response.data && response.data.url) {
          window.location.href = response.data.url;
          const res = await purchaseMembershipPlanApi(planId);
          if (!res.data || !res.data.membership) {
            toast.error("Failed to initiate CCAvenue payment");
            return;
          } else {
            await confirmPlanPaymentApi(res.data.membership.id, "dummy_transaction_id", "paid");
          }
        } else {
          toast.error("Failed to initiate CCAvenue payment");
        }
      } else if (paymentMethod === "phonepe") {
        const phonePeData = new FormData();
        phonePeData.append("user_id", '14');
        phonePeData.append("amount", planPrice);
        phonePeData.append("redirect_url", `${window.location.origin}/payment-success`);
        phonePeData.append("redirect_mode", "REDIRECT");

        const response = await initiatePhonePePaymentApi(phonePeData);
        if (response.data && response.data.payment_url) {
          window.location.href = response.data.payment_url;
        } else {
          toast.error("Failed to initiate PhonePe payment");
        }
      } else {
        toast.error("Please select a payment method");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
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
              <p className="text-[24px] font-medium">{paymentData.planName || "Plan"}</p>
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
              All Payment Options
            </p>
          </div>

          <div
            className={`border-[1px] mt-4 p-3 flex items-center justify-between rounded-xl w-full ${
              paymentMethod === "ccavenue" ? "border-[#F70000]" : "border-[#777777]"
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
              paymentMethod === "phonepe" ? "border-[#F70000]" : "border-[#777777]"
            }`}
          >
            <div className="flex items-center gap-2">
              <p className="text-lg text-[#5f259f] font-medium ml-2">PhonePe</p>
            </div>
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
            disabled={isPending || !agreedTerms || paymentMethod === ""}
            className="mt-10 bg-[#F70000] disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none rounded-md h-[50px] w-[100%] text-[18px] font-medium text-white"
          >
            Pay ₹{paymentData ? paymentData.planPrice : "nothing"} with {paymentMethod === "ccavenue" ? "CCAvenue" : "PhonePe"}
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
              By Clicking I agree to all terms of services and{' '}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => router.push('/Terms&Conditions')}
              >
                Privacy & Policy
              </span>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}