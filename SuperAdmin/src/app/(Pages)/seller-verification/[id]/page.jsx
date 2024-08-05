"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { updatePageNavigation } from "@/features/features";

import img from "@/assets/profile.jpeg";
import { CiLocationOn } from "react-icons/ci";
import {
  HiOutlineBuildingStorefront,
  HiOutlineCurrencyDollar,
  HiOutlinePhone,
} from "react-icons/hi2";
import documentSvg from "@/assets/svgs/document-svg.svg";
import { useParams } from "next/navigation";
import { axiosPrivate } from "@/axios";
import { BiLoader, BiMessage } from "react-icons/bi";

const SellerVerificationId = () => {
  const { id } = useParams();
  const [currentSeller, setCurrentSeller] = useState();
  const [userStatusChanged, setUserStatusChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getSingleSeller = async () => {
      const { data } = await axiosPrivate.get("/users/" + id + "/seller", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      setCurrentSeller(data);
    };
    getSingleSeller();
  }, [userStatusChanged]);

  const approveDisApproveSeller = async () => {
    try {
      setLoading(true);

      const { data } = await axiosPrivate.get(
        "/seller-stores/" + currentSeller?.user?.id + "/approval",
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      setLoading(false);
      setUserStatusChanged((prev) => !prev);
    } catch (error) {
      setLoading(false);
    }
  };

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(updatePageNavigation("seller-verification"));
  }, [dispatch]);
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 bg-white rounded-[8px] shadow-sm p-[25px] mx-[10px] my-[30px] sm:m-[30px]">
          <div className="border border-gray-200 rounded-[8px] px-[5px] sm:px-[20px] py-[25px] flex flex-col lg:flex-row gap-10 xl:gap-18 xl:ps-20">
            <div>
              <p className="text-[18px] sm:text-[20px] font-[500]">
                Seller Overview
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-5 xl:gap-10 mt-5">
                {currentSeller?.user?.profile?.image ? (
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
                    {`${currentSeller?.user?.profile?.first_name} ${currentSeller?.user?.profile?.last_name}`}
                  </p>
                  <p className="text-[15px] text-center sm:text-start">
                    ID: {currentSeller?.user?.id}
                  </p>
                </div>
                <p
                  className={`${
                    currentSeller?.user?.store_profile?.active
                      ? "bg-[var(--bg-color-delivered)] text-[var(--text-color-delivered)]"
                      : "bg-red-100 text-red-400"
                  } absolute right-20 sm:right-auto sm:relative h-[30px] w-[70px] rounded-[5px]  text-[14px]  font-[500] flex items-center justify-center xl:ms-[20px]`}
                >
                  {currentSeller?.user?.store_profile?.active
                    ? "Active"
                    : "Inactive"}
                </p>
              </div>
            </div>

            <div className="border border-gray-100 hidden lg:block"></div>
            <div>
              <p className="text-[18px] sm:text-[20px] font-[500]">
                Business Information
              </p>
              <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-7 text-[14px] sm:text-[16px]">
                <CiLocationOn className="h-[20px] w-[20px]" />
                {currentSeller?.user?.store_profile?.store_name}
              </p>
              <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-2 text-[14px] sm:text-[16px]">
                <HiOutlineBuildingStorefront className="h-[20px] w-[20px]" />
                Retail Business
              </p>

              <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-2 text-[14px] sm:text-[16px]">
                <HiOutlineCurrencyDollar className="h-[20px] w-[20px]" />
                Tax ID TXJDFHSK3
              </p>
            </div>
          </div>
          <p className="text-[20px] font-[500] mt-8">Document Uploaded</p>
          <div className="mt-[15px] flex flex-col gap-5">
            <DocumentUploaded />
            <DocumentUploaded />
            <DocumentUploaded />
          </div>
          <p className="text-[20px] font-[500] mt-8">Aditional Notes</p>
          <textarea className="border focus:outline-none border-gray-200 rounded-[8px] h-[120px] p-[10px] w-full mt-[15px] text-[15px]" />
          <p className="text-[20px] font-[500] mt-8">Actions</p>
          <div className="flex gap-5 sm:gap-10 mt-5">
            <button
              className={`${
                !currentSeller?.user?.store_profile?.active
                  ? "bg-[#06E775]"
                  : "bg-[#FE4242]"
              } flex justify-center items-center h-[40px] w-[120px] font-[500] rounded-[8px] transition-all duration-100 outline-none border-none p-2`}
              onClick={approveDisApproveSeller}
            >
              {loading ? (
                <BiLoader className="animate-spin h-6 w-6" />
              ) : currentSeller?.user?.store_profile?.active ? (
                "Decline"
              ) : (
                "Approve"
              )}
            </button>
            {/* <button
              className={
                "bg-[#FE4242] h-[40px] w-[120px] font-[500] rounded-[8px] text-white hover:bg-transparent hover:text-[#FE4242] transition-all duration-100 outline outline-1"
              }
              onClick={approveDisApproveSeller}
            >
              Decline
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerVerificationId;

const DocumentUploaded = () => {
  return (
    <div className="border border-gray-200 rounded-[8px] p-[20px] flex items-center gap-4 sm:gap-10 flex-wrap">
      <Image alt="" src={documentSvg} className="h-[50px] w-[50px]" />
      <div className="flex-1 flex items-center justify-between min-w-[max-content]">
        <div>
          <p className="text-[18px] font-[500]">Business License</p>
          <p className="text-[14px] text-[var(--text-color-body)]">
            05-15-2023
          </p>
        </div>
        <div>
          <button
            className={
              "bg-[#00A1FF] h-[40px] px-[20px] font-[500] rounded-[8px] text-white hover:bg-transparent hover:text-[#00A1FF] transition-all duration-100 outline outline-1 hidden sm:block"
            }
          >
            View
          </button>
        </div>
      </div>
      <div>
        <button
          className={
            "bg-[#00A1FF] h-[40px] px-[20px] font-[500] rounded-[8px] text-white hover:bg-transparent hover:text-[#00A1FF] transition-all duration-100 outline outline-1 block sm:hidden"
          }
        >
          View
        </button>
      </div>
    </div>
  );
};
