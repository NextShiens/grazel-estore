import React from "react";
import Image from "next/image";
import { CiLocationOn, CiShop } from "react-icons/ci";
import {
  HiOutlineBuildingStorefront,
  HiOutlineCreditCard,
  HiOutlineCurrencyDollar,
  HiOutlinePhone,
} from "react-icons/hi2";
import { BiMessage } from "react-icons/bi";
import img from "@/assets/profile.jpeg";
import { axiosPrivate } from "@/axios";

const SellerViewCard = ({ request }) => {
  const updateRequestStatus = async () => {
    const { data } = await axiosPrivate.put(
      "/admin/credit-limit-requests/" + request.id,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );

    console.log(data);
  };
  return (
    <>
      <div className="border mt-8 border-gray-200 rounded-[8px] px-[5px] sm:px-[20px] py-[25px] flex flex-col lg:flex-row gap-10 xl:gap-18 xl:ps-20">
        <div>
          <p className="text-[18px] sm:text-[20px] font-[500]">
            Seller Overview
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-5 xl:gap-10 mt-5">
            {request?.image ? (
              <Image
                alt="Profile"
                width={80}
                height={80}
                src={currentSeller?.user?.profile?.image}
                className="w-[80px] h-[80px] rounded-full col-span-2 md:col-span-1"
              />
            ) : (
              <Image
                alt="Profile"
                width={80}
                height={80}
                src={img}
                className="w-[80px] h-[80px] rounded-full col-span-2 md:col-span-1"
              />
            )}
            <div className="text-[var(--text-color-body)]">
              <p className="text-[17px] text-center sm:text-start">
                {/* {`${currentSeller?.user?.profile?.first_name} ${currentSeller?.user?.profile?.last_name}`} */}
              </p>
              <p className="text-[15px] text-center sm:text-start">
                ID: {request?.id}
              </p>
            </div>
            <p
              className={`${
                request?.status === "new"
                  ? "bg-[var(--bg-color-delivered)] text-[var(--text-color-delivered)]"
                  : "bg-red-100 text-red-400"
              } absolute right-20 sm:right-auto sm:relative h-[30px] w-[70px] rounded-[5px]  text-[14px]  font-[500] flex items-center justify-center xl:ms-[20px]`}
            >
              Active
            </p>
          </div>
        </div>

        <div className="border border-gray-100 hidden lg:block"></div>
        <div>
          <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-7 text-[14px] sm:text-[16px]">
            <BiMessage className="h-[20px] w-[20px]" />
            {request?.email}
          </p>
          <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-2 text-[14px] sm:text-[16px]">
            <HiOutlinePhone className="h-[20px] w-[20px]" />
            {request?.phone_number}
          </p>

          <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-2 text-[14px] sm:text-[16px]">
            <CiLocationOn className="h-[20px] w-[20px]" />
            {request?.shop_address}
          </p>
        </div>

        <div className="border border-gray-100 hidden lg:block"></div>
        <div>
          <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-7 text-[14px] sm:text-[16px]">
            <CiShop className="h-[20px] w-[20px]" />
            {request?.shop_name}
          </p>
          <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-2 text-[14px] sm:text-[16px]">
            <HiOutlineBuildingStorefront className="h-[20px] w-[20px]" />
            Retail Business
          </p>

          <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-2 text-[14px] sm:text-[16px]">
            <HiOutlineCreditCard className="h-[20px] w-[20px]" />
            {request?.aadhar_card}
          </p>
        </div>
      </div>
      <div className="mt-[10px] mb-[25px]">
        <p className="text-[20px] font-[500]">Actions</p>
        <div className="flex gap-3 sm:gap-10 mt-[10px]">
          <button
            onClick={updateRequestStatus}
            className="h-[35px] w-[100px] sm:h-[45px] sm:w-[130px] rounded-[8px] bg-[#06E775] flex justify-center items-center text-white font-[500] border border-[#06E775] hover:bg-transparent transition-all duration-100 hover:text-[#06E775]"
          >
            Accept
          </button>
          <button className="h-[35px] w-[100px] sm:h-[45px] sm:w-[130px] rounded-[8px] bg-[#FE4242] flex justify-center items-center text-white font-[500] border border-[#FE4242] hover:bg-transparent transition-all duration-100 hover:text-[#FE4242]">
            Decline
          </button>
        </div>
      </div>
    </>
  );
};

export default SellerViewCard;
