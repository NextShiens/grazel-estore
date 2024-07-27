"use client";
import Image from "next/image";
import { toast } from "react-toastify";
import React, { useState } from "react";
import PayPal from "@/assets/card333.png";
import { createCreditLimitApi } from "@/apis";
import { FaCircleCheck } from "react-icons/fa6";
import Dots from "@/assets/Group 1820549907.png";
import CustomModal from "@/components/CustomModel";

export default function CreditLimit() {
  const [showSendModel, setShowSendModel] = useState(false);
  const [isPending, setPending] = useState(false);

  const handleCloseModel = () => {
    setShowSendModel(false);
  };

  async function onSubmit(formdata: any) {
    try {
      setPending(true);
      await createCreditLimitApi(formdata);
      setShowSendModel(true);
    } catch (error) {
      toast.error("Failed to created");
    } finally {
      setTimeout(() => {
        setPending(false);
      }, 1000);
    }
  }

  return (
    <form
      action={onSubmit}
      className="lg:mx-[150px] mx-[20px] sm:mx-[20px] md:mx-[30px] gap-4 flex flex-wrap-reverse sm:flex-wrap-reverse md:flex-wrap-reverse lg:flex-nowrap lg:my-[32px] my-[20px] sm:my-[20px] md: my-[30px] "
    >
      <div
        style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
        className="lg:w-[60%] w-[100%] sm:w-[100%] md:w-[100%] rounded-3xl p-[24px] h-auto"
      >
        <div className="flex-col mt-[30px] ">
          <label className="text-[16px] font-semibold">Shop Name</label>
          <input
            placeholder="Shop Name"
            name="shop_name"
            required
            className="border-[1px] mt-[9px] border-[#7777777]  w-full flex items-center justify-center rounded-md h-[50px] p-3 focus:outline-none"
          />
        </div>

        <div className="flex-col mt-[30px]">
          <label className="text-[16px] font-semibold">Phone Number</label>
          <input
            placeholder="Phone Numbers"
            name="phone_number"
            required
            type="tel"
            className="border-[1px] mt-[9px] border-[#7777777]  w-full flex items-center justify-center rounded-md h-[50px] p-3 focus:outline-none"
          />
        </div>

        <div className="flex-col mt-[30px]">
          <label className="text-[16px] font-semibold">Email Address</label>
          <input
            placeholder="Email Address"
            name="email"
            type="email"
            required
            className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
          />
        </div>

        <div className="flex-col mt-[30px]">
          <label className="text-[16px] font-semibold">Shop Address</label>
          <input
            placeholder="Shop Address"
            name="shop_address"
            required
            className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
          />
        </div>

        <div className="flex-col mt-[30px]">
          <label className="text-[16px] font-semibold">
            Addhar Card (Optional)
          </label>
          <input
            placeholder="Addhar Card (Optional)"
            name="aadhar_card"
            className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
          />
        </div>

        <div className="flex-col mt-[30px]">
          <label className="text-[16px] font-semibold">
            Credit Card Number
          </label>
          <input
            placeholder="Credit Card Number"
            name="pin_card_number"
            required
            className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
          />
        </div>

        <div className=" mt-[30px]">
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#F70000] rounded-2xl h-[50px] disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none  w-full text-[18px] font-medium text-white"
            // onClick={handleOpeneModel}
          >
            Send Request
          </button>
        </div>
      </div>

      <div
        style={{
          boxShadow: "0px 4px 29px 0px #0000000A",
          background:
            "linear-gradient(107.86deg, #F70000 -1.3%, #F69B26 81.68%",
        }}
        className="lg:w-[40%] w-[100%] sm:w-[100%] md:w-[100%] text-white rounded-2xl p-[24px] lg:h-[300px] h-[220px] sm:h-[230px]"
      >
        <div className="flex items-center">
          <div className="w-[60px] h-[60px] bg-[#F96609] rounded-full flex items-center justify-center">
            <Image alt="" src={PayPal} className="w-[30px] h-[22px]" />
          </div>

          <p className="text-[24px] ml-3  font-semibold text-white ">
            Credit Limit
          </p>
        </div>

        <div className="mt-6 flex items-center">
          <p className="lg:text-[24px]  text-[18px] sm:text-[18px] md:text-[20px]  font-semibold text-white ">
            Get Credit Upto
          </p>

          <p className="lg:text-[64px] text-[32px] sm:text-[32px] md:text-[32px]  ml-6 font-bold text-white ">
            66 Lac
          </p>
        </div>

        <div className="mt-6 flex items-center">
          <div className="border-b-[1px] border-white lg:w-[70%] w-[60%] sm:[60%]"></div>
          <p className="lg:text-[16px] text-[12px] ml-2 sm:text-[14px] md:text-[16px] font-semibold">
            Only For Retailers
          </p>
        </div>
      </div>

      <CustomModal showModal={showSendModel}>
        <div className="flex-col justify-center w-[900px]">
          <div className="mx-[150px] my-[100px]">
            <div className="flex justify-center mb-[22px]">
              <Image src={Dots} alt="" className="h-[64px] w-[64px]" />

              <FaCircleCheck className="text-[#E24C4B] h-[105px] mx-[16px] w-[105px]" />
              <Image src={Dots} alt="" className="h-[64px] w-[64px]" />
            </div>

            <p className="text-[32px] text-center font-bold text-[#434343]">
              You Have Successfully purchased Prime Plan.
            </p>

            <div className="flex mt-[30px] mb-[100px] justify-center">
              <button
                className=" bg-[#F70000] rounded-lg h-[50px] w-[275px] text-white font-medium"
                onClick={handleCloseModel}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </CustomModal>
    </form>
  );
}
