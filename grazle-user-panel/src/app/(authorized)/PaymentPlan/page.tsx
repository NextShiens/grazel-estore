import React from "react";
import Image from "next/image";
import logo from "@/assets/Grazle Logo.png";
import Pay from "@/assets/Group 1820550001.png";

export default function PaymentPlan() {
  return (
    <div className="flex flex-col  items-center justify-center">
      <Image
        src={logo}
        alt="Menu"
        className="lg:w-[216px] w-[100px] sm:w-[120px] md:w-[130px] lg:h-[127px] h-[70px] sm:h-[75px] md:h-[80px] mt-[52px]"
      />

      <p className="mt-[18px] lg:text-[40px] text-[24px] sm:text-[24px] md:text-[24px] font-bold">
        Buy Grazle Premium
      </p>

      <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap lg:mx-0 mx-3 sm:mx-3 md:mx-3 items-center gap-4">
        <div
          style={{
            boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
          }}
          className="rounded-3xl h-[471px] p-[20px] lg:w-[304px] w-[100%] sm:w-[100%] md:w-[100%]  hover:border-[1px] border-[#F70000] mt-[38px] lg:mb-[92px] mb-[15px] sm:mb-[15px] md:mb-[15px]"
        >
          <div className="rounded-3xl flex items-center flex-col  w-auto h-[230px] bg-[#FFFCFC]">
            <div className="bg-[#FFA31A] mt-[18px] rounded-sm flex items-center justify-center  h-[61px] w-[58px]">
              <Image src={Pay} alt="" className="h-[29px] w-[29px]" />
            </div>

            <p className="mt-[18px] text-[24px] text-[#777777] font-normal">
              Monthly
            </p>
            <p className=" text-[35px] text-[#F70000] font-bold">$166.00</p>
            <p className=" text-[24px] text-[#777777] font-normal">12% Off</p>
          </div>

          <p className=" text-[15px] text-[#777777] font-normal text-center mt-[25px]">
            At vero eos et accusamus et iusto odio dignissimos ducimus qui
            blanditiis praesentium voluptatum deleniti
          </p>

          <div className="flex mt-[30px]  justify-center">
            <button className=" bg-[#F70000] rounded-lg h-[50px] w-[275px] font-medium text-white">
              Continue Plan
            </button>
          </div>
        </div>

        <div
          style={{
            boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
          }}
          className="rounded-3xl h-[471px] p-[20px] lg:w-[304px] w-[100%] sm:w-[100%] md:w-[100%]  hover:border-[1px] border-[#F70000] mt-[38px] lg:mb-[92px] mb-[15px] sm:mb-[15px] md:mb-[15px]"
        >
          <div className="rounded-3xl flex items-center flex-col  w-auto h-[230px] bg-[#FFFCFC]">
            <div className="bg-[#FFA31A] mt-[18px] rounded-sm flex items-center justify-center  h-[61px] w-[58px]">
              <Image src={Pay} alt="" className="h-[29px] w-[29px]" />
            </div>

            <p className="mt-[18px] text-[24px] text-[#777777] font-normal">
              Silver Plan
            </p>
            <p className=" text-[35px] text-[#F70000] font-bold">$266.00</p>
            <p className=" text-[24px] text-[#777777] font-normal">12% Off</p>
          </div>

          <p className=" text-[15px] text-[#777777] font-normal text-center mt-[25px]">
            At vero eos et accusamus et iusto odio dignissimos ducimus qui
            blanditiis praesentium voluptatum deleniti
          </p>

          <div className="flex mt-[30px]  justify-center">
            <button className=" bg-[#F70000] rounded-lg h-[50px] w-[275px] font-medium text-white">
              Continue Plan
            </button>
          </div>
        </div>

        <div
          style={{
            boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
          }}
          className="rounded-3xl h-[471px] p-[20px] lg:w-[304px] w-[100%] sm:w-[100%] md:w-[100%]  hover:border-[1px] border-[#F70000] mt-[38px] lg:mb-[92px] mb-[15px] sm:mb-[15px] md:mb-[15px]"
        >
          <div className="rounded-3xl flex items-center flex-col  w-auto h-[230px] bg-[#FFFCFC]">
            <div className="bg-[#FFA31A] mt-[18px] rounded-sm flex items-center justify-center  h-[61px] w-[58px]">
              <Image src={Pay} alt="" className="h-[29px] w-[29px]" />
            </div>

            <p className="mt-[18px] text-[24px] text-[#777777] font-normal">
              Prime Membership
            </p>
            <p className=" text-[35px] text-[#F70000] font-bold">$336.00</p>
            <p className=" text-[24px] text-[#777777] font-normal">12% Off</p>
          </div>

          <p className=" text-[15px] text-[#777777] font-normal text-center mt-[25px]">
            At vero eos et accusamus et iusto odio dignissimos ducimus qui
            blanditiis praesentium voluptatum deleniti
          </p>

          <div className="flex mt-[30px]  justify-center">
            <button className=" bg-[#F70000] rounded-lg h-[50px] w-[275px] font-medium text-white">
              Continue Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
