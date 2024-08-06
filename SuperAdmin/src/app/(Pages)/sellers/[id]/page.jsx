"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import { axiosPrivate } from "@/axios";
import Image from "next/image";
import { CiLocationOn } from "react-icons/ci";
import electronicLED from "@/assets/document-image.png";
import AllProducts from "@/components/AllProducts";
import {
  HiOutlineBuildingStorefront,
  HiOutlineCurrencyDollar,
  HiOutlinePhone,
} from "react-icons/hi2";
import { useParams } from "next/navigation";
import { BiMessage } from "react-icons/bi";
import { FaFileAlt } from "react-icons/fa";

const SellerDetails = () => {
  const dispatch = useDispatch();
  const [currentSeller, setCurrentSeller] = useState();
  const [showAllProducts, setShowAllProducts] = useState(false);

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
    };
    getSingleSeller();
  }, [id]);

  const toggleAllProducts = () => {
    setShowAllProducts(!showAllProducts);
  };

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
                    src={currentSeller.user.profile?.image || electronicLED}
                    className="w-[80px] h-[80px] rounded-full col-span-2 md:col-span-1"
                  />
                ) : (
                  <div className="w-[80px] h-[80px] rounded-full bg-gray-300"></div>
                )}
                <div className="text-[var(--text-color-body)]">
                  <p className="text-[17px] text-center sm:text-start">
                    {`${currentSeller?.user?.profile?.first_name || ''} ${currentSeller?.user?.profile?.last_name || ''}`}
                  </p>
                  <p className="text-[15px] text-center sm:text-start">
                    ID: {currentSeller?.user?.id}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`${currentSeller?.user?.active
                      ? "bg-[var(--bg-color-delivered)] text-[var(--text-color-delivered)]"
                      : "bg-red-100 text-red-400"
                      } h-[30px] w-[70px] rounded-[5px] text-[14px] font-[500] flex items-center justify-center`}
                  >
                    {currentSeller?.user?.active ? "Active" : "Inactive"}
                  </button>
                  <button className="bg-red-100 text-red-400 h-[30px] w-[70px] rounded-[5px] text-[14px] font-[500] flex items-center justify-center">
                    Disable
                  </button>
                </div>
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
                {currentSeller?.user?.profile?.country || 'N/A'}
              </p>
            </div>

            <div className="border border-gray-100 hidden lg:block"></div>
            <div>
              <p className="text-[18px] sm:text-[20px] font-[500]">
                Business Information
              </p>
              <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-7 text-[14px] sm:text-[16px]">
                <HiOutlineBuildingStorefront className="h-[20px] w-[20px]" />
                {currentSeller?.user?.store_profile?.store_name}
              </p>
              <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-2 text-[14px] sm:text-[16px]">
                <FaFileAlt className="h-[20px] w-[20px]" />
                {currentSeller?.user?.store_profile?.store_description}
              </p>
              <p className="text-[var(--text-color-body)] flex items-center gap-3 mt-2 text-[14px] sm:text-[16px]">
                <HiOutlineCurrencyDollar className="h-[20px] w-[20px]" />
                Tax ID: {currentSeller?.user?.store_profile?.tax_id || 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            <div className="border border-gray-200 rounded-[8px] p-5">
              <h3 className="text-[18px] font-[500] mb-4">Analytics</h3>
              <p className="text-[var(--text-color-body)] mb-2 ">Total Sales: <span className="text-blue-500  font-[500]"> ${currentSeller?.analytics?.total_sales || 0}</span></p>
              <p className="text-[var(--text-color-body)] mb-2">Total Orders: <span className="text-red-500  font-[500]"> {currentSeller?.analytics?.total_orders || 0}</span></p>
              <p className="text-[var(--text-color-body)] mb-2">Ratings: <span className="text-yellow-500  font-[500]">{currentSeller?.analytics?.average_rating || 0} ({currentSeller?.analytics?.total_reviews || 0} Reviews)</span></p>
              <p className="text-[var(--text-color-body)]">
                Return Rate: {currentSeller?.analytics?.return_rate ? `${parseFloat(currentSeller.analytics.return_rate).toFixed(2)}%` : '0.00%'}
              </p>
            </div>

            <div className="border border-gray-200 rounded-[8px] p-5">
              <h3 className="text-[18px] font-[500] mb-4">Compliance & Documents</h3>
              <p className="text-[var(--text-color-body)] mb-2">Verification Status: <span className="text-red-500">{currentSeller?.user?.store_profile?.active ? "Active" : "Disabled"}</span></p>
              <p className="text-[var(--text-color-body)] mb-2">
                Business License:
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={() => window.open(currentSeller?.user?.store_profile?.business_license, '_blank')}
                >
                  View
                </span>
              </p>
              <p className="text-[var(--text-color-body)]">
                Tax ID:
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={() => window.open(currentSeller?.user?.store_profile?.tax_id, '_blank')}
                >
                  View
                </span>
              </p>
            </div>

            {/* <div className="border border-gray-200 rounded-[8px] p-5">
              <h3 className="text-[18px] font-[500] mb-4">Activity Log</h3>
              <p className="text-[var(--text-color-body)] mb-2">• Updated product listings</p>
              <p className="text-[var(--text-color-body)] mb-2">• Contacted support regarding returns</p>
              <p className="text-[var(--text-color-body)]">• Verified documents</p>
            </div> */}
          </div>

          <div className="mt-5 border border-gray-200 rounded-[8px] p-3 w-full">
            <div className="flex flex-row justify-between px-2 items-center">
              <h3 className="text-[23px] font-[600] mb-4">Product Listings</h3>
              <button
                className="border border-gray-200 p-2 text-black px-4 py-2 rounded-[5px] mb-4"
                onClick={toggleAllProducts}
              >
                {showAllProducts ? "Hide All Products" : "See All Products"}
              </button>
            </div>

            {showAllProducts ? (
              <AllProducts products={currentSeller?.products || []} />
            ) : (
              <div className="flex flex-col gap-5">
                {currentSeller?.products?.slice(0, 3).map((product, index) => (
                  <div key={index} className="border border-gray-200 rounded-[8px] p-2 flex flex-row gap-4">
                    <Image
                      src={product?.featured_image || electronicLED}
                      alt={product?.title}
                      width={48}
                      height={48}
                      className="w-16 h-16 object-cover rounded-[8px] mb-1"
                    />
                    <div className="flex flex-col gap-[1px]">
                      <h4 className="text-[16px] font-[500]">{product?.title}</h4>
                      <p className="text-[var(--text-color-body)]">{product?.price} in stock</p>
                      <p className="text-green-500">Available</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDetails;