"use client";
import Image from "next/image";
import { Radio } from "@mui/material";
import React, { useState } from "react";
import ICIC from "@/assets/pngwing 23.png";
import Avenue from "@/assets/pngwing 22.png";
import Pay from "@/assets/Group 1820550001.png";
import Dots from "@/assets/Group 1820549907.png";
import { FaCircleCheck } from "react-icons/fa6";
import CustomModal from "@/components/CustomModel";

export default function Payment() {
  const [showSendModel, setShowSendModel] = useState(false);

  const handleShowModel = () => {
    setShowSendModel(true);
  };

  const handleCloseModel = () => {
    setShowSendModel(false);
  };

  return (
    <>
      <div className="flex mt-[40px] lg:mx-0 mx-2 sm:mx-2 md:mx-4 justify-center">
        <div className="h-[614px] w-[640px] text-center">
          <p className="text-[32px] font-bold">Select Payment</p>

          <div className="rounded-3xl mt-[20px]  flex items-center p-[35px] hover:border-[1px] border-[#F70000]">
            <div className="bg-[#FFA31A] rounded-sm flex items-center justify-center  h-[61px] w-[58px]">
              <Image src={Pay} alt="" className="h-[29px] w-[29px]" />
            </div>

            <div className="text-[#777777] text-start ml-[32px]">
              <p className="text-[24px] font-medium">Monthly</p>
              <p className="text-[15px] font-medium ">
                12% Off/ Validity 30 Days
              </p>
            </div>

            <p className="text-[24px] font-bold text-[#F70000] ml-auto">
              $166.00
            </p>
          </div>

          <p className="text-[16px] font-normal mt-[36px] text-start text-[#777777]">
            Select the Top Up Method you want to use.
          </p>

          <div className="rounded-3xl mt-[20px] border-[1px]  flex items-center p-[35px] hover:border-[1px] border-[#F70000]">
            <div className="bg-[#FDF9FA] rounded-sm flex items-center justify-center  h-[61px] w-[58px]">
              <Image src={Avenue} alt="" className="h-[29px] w-[29px]" />
            </div>

            <div className="text-[#777777] text-start ml-[32px]">
              <p className="text-[24px] font-medium">Avenue</p>
              <p className="text-[15px] font-medium ">**** 7789 9098 4555</p>
            </div>

            <div className="ml-auto">
              <Radio
                sx={{
                  color: "#F70000",
                  "& .MuiSvgIcon-root": {
                    fontSize: 34,
                  },
                  "&.Mui-checked": {
                    color: "#F70000",
                  },
                }}
              />
            </div>
          </div>

          <div className="rounded-3xl mt-[20px] border-[1px]  flex items-center p-[35px] hover:border-[1px] border-[#F70000]">
            <div className="bg-[#FFA31A] rounded-sm flex items-center justify-center  h-[61px] w-[58px]">
              <Image src={ICIC} alt="" className="h-[29px] w-[29px]" />
            </div>

            <div className="text-[#777777] text-start ml-[32px]">
              <p className="text-[24px] font-medium">ICIC Bank</p>
              <p className="text-[15px] font-medium ">**** 7789 9098 4555</p>
            </div>

            <div className="ml-auto">
              <Radio
                sx={{
                  color: "#F70000",
                  "& .MuiSvgIcon-root": {
                    fontSize: 34,
                  },
                  "&.Mui-checked": {
                    color: "#F70000",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex mt-[30px] mb-[100px] justify-center">
        <button
          className=" bg-[#F70000] rounded-lg h-[50px] w-[275px] text-white font-medium"
          onClick={handleShowModel}
        >
          Continue Plan
        </button>

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
                  onClick={handleShowModel}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </CustomModal>
      </div>
    </>
  );
}
