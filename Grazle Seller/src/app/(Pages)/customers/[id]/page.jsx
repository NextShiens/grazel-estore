"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { updatePageNavigation } from "../../../../features/features";

import Navbar from "../../../../components/navbar";
import Sidebar from "../../../../components/sidebar";

import grommetIconsMoney from "../../../../assets/svgs/grommet-icons_money.svg";
import productOne from "../../../../assets/dashboard-product-1.png";
import customer from "../../../../assets/customer.png";
import tick from "../../../../assets/tick.png";
import { FcCancel } from "react-icons/fc";

const CustomersDetails = () => {
  const dispatch = useDispatch();
  const [singleOrder, setSingleOrder] = useState([]);
  useEffect(() => {
    dispatch(updatePageNavigation("customers"));
  }, [dispatch]);

  console.log(singleOrder);
  useEffect(() => {
    let localOrder = JSON.parse(localStorage.getItem("recentOrder"));
    const sortedOrder = localOrder?.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setSingleOrder(sortedOrder);
  }, []);

  function totalCostOrder() {
    return singleOrder
      ?.flatMap((order) => order.products)
      .reduce((acc, pro) => acc + pro.price * pro.quantity, 0);
  }
  console.log(totalCostOrder());
  function completedOrder() {
    return singleOrder?.filter((item) => item.status === "completed")?.length;
  }
  function cancelledOrder() {
    return singleOrder?.filter((item) => item.status === "cancelled")?.length;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-3">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 mt-[30px] px-[22px] flex flex-col xl:flex-row gap-5">
          <div className="flex-1 h-[max-content]">
            <p className="text-[20px] font-[600]">Customer View Detail</p>
            <div className="mt-[20px] grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="px-[20px] py-[30px] bg-white rounded-[8px] shadow-sm">
                <p className="text-[14px] text-[var(--text-color-body)]">
                  Total Cost Order
                </p>
                <div className="flex gap-2 items-start mt-4">
                  <Image alt="" src={grommetIconsMoney} className="mt-2 " />
                  <div>
                    <p className="text-[25px] font-[600]">
                      ₹{totalCostOrder()}
                      {/* <span className="text-[var(--text-color-body)]">.84</span> */}
                    </p>
                    <p className="text-[12px] text-[var(--text-color-body)]">
                      All time total cost
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-[20px] py-[30px] bg-white rounded-[8px] shadow-sm">
                <p className="text-[14px] text-[var(--text-color-body)]">
                  Completed
                </p>
                <div className="flex gap-2 items-start mt-4">
                  <Image alt="" src={tick} className="mt-2" />

                  <div>
                    <p className="text-[25px] font-[600]">
                      {completedOrder()}
                      <span className="ml-2 text-[var(--text-color-body)]">
                        Items
                      </span>
                    </p>
                    <p className="text-[12px] text-[var(--text-color-body)]">
                      All time total completed
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-[20px] py-[30px] bg-white rounded-[8px] shadow-sm">
                <p className="text-[14px] text-[var(--text-color-body)]">
                  Cancelled
                </p>
                <div className="flex gap-2 items-start mt-4">
                  {/* <Image alt="" src={cross} className="mt-2" /> */}
                  <FcCancel className="mt-2 text-3xl" />
                  <div>
                    <p className="text-[25px] font-[600]">
                      {cancelledOrder()}
                      <span className="ml-2 text-[var(--text-color-body)]">
                        Items
                      </span>
                    </p>
                    <p className="text-[12px] text-[var(--text-color-body)]">
                      All time total canceled
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-[20px] py-[30px] bg-white rounded-[8px] shadow-sm xl:col-span-3 flex flex-col lg:flex-row gap-20">
                {/* add her */}
                <div className="xl:w-[45%] bg-white shadow-sm rounded-[10px] px-[20px] py-[25px] flex flex-1 flex-col gap-5">
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <p className="text-[20px] font-[600]">Recent Orders</p>
                  </div>
                  {singleOrder?.map((item) => (
                    <div key={item?.id} className="flex gap-5">
                      <Image
                        alt=""
                        src={productOne}
                        className="w-[67px] h-[67px]"
                      />
                      <div className="flex-1 flex justify-between items-center">
                        <div className="flex flex-col gap-1.5">
                          <p className="font-[500] leading-[24px]">
                            {item?.products?.map(
                              (pro, index) =>
                                `${pro?.title}${
                                  index < item.products.length - 1 ? ", " : ""
                                }`
                            )}
                          </p>
                          <p className="text-[14px] text-[var(--text-color-body)]">
                            {item?.date}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <p className="text-[12px] text-[var(--text-color-body-plus)] flex items-center gap-1">
                            ₹
                            {item?.products?.reduce(
                              (acc, pro) => acc + Number(pro?.price),
                              0
                            )}
                          </p>
                          <p className="text-[var(--text-color-body)] text-[11px] ps-[15px]">
                            Qty:
                            {item?.products?.reduce((acc, pro) => {
                              return acc + Number(pro?.quantity);
                            }, 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* <div className="flex gap-5">
                    <Image
                      alt=""
                      src={productTwo}
                      className="w-[67px] h-[67px]"
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <div className="flex flex-col gap-1.5">
                        <p className="font-[500] leading-[24px]">
                          Lorem ipsum dolor sit amet
                        </p>
                        <p className="text-[14px] text-[var(--text-color-body)]">
                          12,429 Sales
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[12px] text-[var(--text-color-body-plus)] flex items-center gap-1">
                          <GoDotFill />
                          Available
                        </p>
                        <p className="text-[var(--text-color-body)] text-[11px] ps-[15px]">
                          135 Stocks
                        </p>
                      </div>
                    </div>
                  </div> */}
                  {/* <div className="flex gap-5">
                    <Image
                      alt=""
                      src={productThree}
                      className="w-[67px] h-[67px]"
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <div className="flex flex-col gap-1.5">
                        <p className="font-[500] leading-[24px]">
                          Lorem ipsum dolor sit amet
                        </p>
                        <p className="text-[14px] text-[var(--text-color-body)]">
                          12,429 Sales
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[12px] text-[var(--text-color-body-plus)] flex items-center gap-1">
                          <GoDotFill />
                          Available
                        </p>
                        <p className="text-[var(--text-color-body)] text-[11px] ps-[15px]">
                          135 Stocks
                        </p>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
          <div className="xl:w-[320px] bg-white rounded-[8px] shadow-sm flex items-center flex-col px-[20px] py-[39px] h-full">
            <div className="w-[65px] h-[65px] rounded-full bg-[#E0D5C9] overflow-hidden">
              <Image alt="" src={customer} className="w-[100%] h-[100%]" />
            </div>
            <p className="font-[600] mt-3">
              {singleOrder?.[0]?.customer?.username?.toUpperCase()}
            </p>
            <p className="text-[14px] font-[500] mt-1">
              <span className="text-[var(--text-color-body)]">ID:</span>
              {singleOrder?.[0]?.user_id}
            </p>
            <div className="w-[100%] flex flex-col gap-2 mt-4">
              <p className="text-[14px] text-[var(--text-color-body)]">
                Phone Number
              </p>
              <p className="font-[500] text-[15px]">+18038488482</p>
            </div>
            <div className="w-[100%] flex flex-col gap-2 mt-4">
              <p className="text-[14px] text-[var(--text-color-body)]">Email</p>
              <p className="font-[500] text-[15px]">
                {singleOrder?.[0]?.customer?.email}
              </p>
            </div>
            <div className="w-[100%] flex flex-col gap-2 mt-4">
              <p className="text-[14px] text-[var(--text-color-body)]">
                Shipping Address
              </p>
              <p className="font-[500] text-[15px]">
                3401 S Malcolm X Blvd, Dallas, TX 75215, United States
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="xl:w-[45%] bg-white shadow-sm rounded-[10px] px-[20px] py-[25px] flex flex-col gap-5"> */}
    </div>
  );
};

export default CustomersDetails;
