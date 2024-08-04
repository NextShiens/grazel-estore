"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import SearchOnTop from "@/components/SearchOnTop";
import Navbar from "@/components/navbar";
import Loading from "@/components/loading";
import Sidebar from "@/components/sidebar";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import { axiosPrivate } from "@/axios";
import Image from "next/image";
import { CiLocationOn } from "react-icons/ci";
import {
  HiOutlineBuildingStorefront,
  HiOutlineCurrencyDollar,
  HiOutlinePhone,
} from "react-icons/hi2";
import img from "@/assets/profile.jpeg";
import documentSvg from "@/assets/svgs/document-svg.svg";
import { useParams } from "next/navigation";
import { BiMessage } from "react-icons/bi";

const SellerDetails = () => {
  const dispatch = useDispatch();
  const [currentSeller, setCurrentSeller] = useState();

  const { id } = useParams();
  useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation("sellers"));
  }, [dispatch]);

  useEffect(() => {
    const getSingleSeller = async () => {
      const { data } = await axiosPrivate.get("/users/" + id + "/seller", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setCurrentSeller(data);
      console.log(data);
      // sellerRef.current = data?.users; //to made a whole copy of data and can filter it
    };
    getSingleSeller();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 flex-col gap-5 bg-white rounded-[8px] shadow-sm p-[25px] mx-[10px] my-[30px] sm:m-[30px]">
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
                Contact Information
              </p>
              <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-7 text-[14px] sm:text-[16px]">
                <BiMessage className="h-[20px] w-[20px]" />
                {currentSeller?.user?.email}
              </p>
              <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-2 text-[14px] sm:text-[16px]">
                <HiOutlinePhone className="h-[20px] w-[20px]" />
                {currentSeller?.user?.profile?.phone}
              </p>

              <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-2 text-[14px] sm:text-[16px]">
                <CiLocationOn className="h-[20px] w-[20px]" />
                {currentSeller?.user?.profile?.country}
              </p>
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

          <div className="border mt-5 border-gray-200 rounded-[8px] px-[5px] sm:px-[20px] py-[25px] flex flex-col lg:flex-row gap-10  xl:ps-10">
            <div>
              <p className="text-[18px] sm:text-[20px] font-[500]">Analytics</p>
              <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-7 text-[14px] sm:text-[16px]">
                <CiLocationOn className="h-[20px] w-[20px]" />
                123 Main Street New York
              </p>
              <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-2 text-[14px] sm:text-[16px]">
                <HiOutlineBuildingStorefront className="h-[20px] w-[20px]" />
                Business Type: Individual
              </p>
            </div>

            <div className="border border-gray-100 hidden lg:block"></div>
            <div>
              <p className="text-[18px] sm:text-[20px] font-[500]">
                Compliance & Docs
              </p>
              <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-7 text-[14px] sm:text-[16px]">
                <CiLocationOn className="h-[20px] w-[20px]" />
                123 Main Street New York
              </p>
              <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-2 text-[14px] sm:text-[16px]">
                <HiOutlineBuildingStorefront className="h-[20px] w-[20px]" />
                Business Type: Individual
              </p>
            </div>

            <div className="border border-gray-100 hidden lg:block"></div>
            <div>
              <p className="text-[18px] sm:text-[20px] font-[500]">
                Activity Log
              </p>
              <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-7 text-[14px] sm:text-[16px]">
                <CiLocationOn className="h-[20px] w-[20px]" />
                123 Main Street New York, NY 10001
              </p>
              <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-2 text-[14px] sm:text-[16px]">
                <HiOutlineBuildingStorefront className="h-[20px] w-[20px]" />
                Business Type: Individual
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDetails;
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
