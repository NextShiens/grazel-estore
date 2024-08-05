"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";

import SearchOnTop from "@/components/SearchOnTop";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { updatePageLoader, updatePageNavigation } from "@/features/features";

import data from "@/components/customers";
import electronicLED from "@/assets/Electronic-LED.png";
import tableAction from "@/assets/svgs/table-action.svg";
import { useRouter } from "next/navigation";
import { IoEye } from "react-icons/io5";
import Loading from "@/components/loading";
import { axiosPrivate } from "@/axios";

const SellerVerification = () => {
  const dispatch = useDispatch();
  const [selectedCustomer, setSelectedCustomer] = useState(0);
  const [allSellers, setAllSellers] = useState([]);
  useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation("seller-verification"));
  }, [dispatch]);
  const fn_viewDetails = (id) => {
    if (id === selectedCustomer) {
      return setSelectedCustomer(0);
    }
    setSelectedCustomer(id);
  };

  useEffect(() => {
    const getAllSellers = async () => {
      const { data } = await axiosPrivate.get("/seller-stores", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      // setAllSellers([data?.user]) // to show data on web
      // sellerRef.current=[data?.user] //to made a whole copy of data and can filter it
      setAllSellers(data?.sellers); // to show data on web
      console.log(data);
      // sellerRef.current = data?.users; //to made a whole copy of data and can filter it
    };
    getAllSellers();
  }, []);

  return (
    <>
      <Loading />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[10px] sm:px-[22px]">
            <SearchOnTop />
            <div className="my-[20px] px-[30px] py-[20px] bg-white rounded-[8px] shadow-sm overflow-x-auto w-[94vw] md:w-[67vw] lg:w-[75vw] xl:w-auto">
              <table className="w-[850px] xl:w-[100%]">
                <thead>
                  <tr className="font-[500] text-[var(--text-color-body)] text-[15px] h-[50px]">
                    <td>Name</td>
                    <td>Email Address</td>
                    <td>Phone Number</td>
                    <td>Business Name</td>
                    <td>Status</td>
                    <td className="w-[80px]">Action</td>
                  </tr>
                </thead>
                <tbody>
                  {allSellers?.map((item) => (
                    <tr key={item.id} className="h-[50px] text-[14px]">
                      <td className="flex items-center gap-1.5 h-[50px]">
                        {item?.profile?.image && (
                          <Image
                            width={26}
                            height={26}
                            alt=""
                            src={item?.profile?.image}
                            className="h-[26px] w-[26px]"
                          />
                        )}
                        {`${item?.profile?.first_name} ${item?.profile?.last_name}`}
                      </td>
                      <td>{item?.email}</td>
                      <td>{item?.profile?.phone}</td>
                      <td>{item?.store_profile?.store_name}</td>
                      <td className="w-[130px]">
                        <p className="h-[23px] w-[60px] rounded-[5px] bg-[var(--bg-color-delivered)] text-[10px] text-[var(--text-color-delivered)] font-[500] flex items-center justify-center">
                          {item.active ? "Active" : "Inactive"}
                        </p>
                      </td>
                      <td className="px-[17px] relative">
                        <Image
                          alt=""
                          src={tableAction}
                          className="cursor-pointer"
                          onClick={() => fn_viewDetails(item.id)}
                        />
                        {selectedCustomer === item.id && (
                          <ViewDetails id={item.id} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerVerification;

const ViewDetails = ({ id }) => {
  const navigate = useRouter();
  return (
    <div className="absolute py-[10px] px-[10px] flex flex-col items-center text-[var(--text-color-body)] bg-white rounded-[8px] shadow-md border border-gray-100 w-[max-content] left-[-145px] top-[13px] cursor-pointer">
      <div
        className="flex items-center gap-2.5 w-full px-2 py-1.5 hover:bg-gray-100 rounded-sm"
        onClick={() => navigate.push(`/seller-verification/${id}`)}
      >
        <IoEye className="w-[20px] h-[20px]" />
        <p className="text-[14px]">View Details</p>
      </div>
    </div>
  );
};
