"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import {
  updatePageLoader,
  updatePageNavigation,
} from "../../../features/features";
import "./style.css";
import Navbar from "../../../components/navbar";
import Sidebar from "../../../components/sidebar";
import SearchOnTop from "../../../components/SearchOnTop";

import electronicLED from "../../../assets/Electronic-LED.png";
import tableAction from "../../../assets/svgs/table-action.svg";
import { IoEye } from "react-icons/io5";

import { useRouter } from "next/navigation";
import { axiosPrivate } from "../../../axios/index";
import { cn } from "../../../lib/utils";
import Loading from "../../../components/loading";

const Orders = () => {
  const dispatch = useDispatch();
  const [orderId, setOrderId] = useState(0);
  const [selectedTab, setSelectedTab] = useState("all");
  const [allOrders, setOrders] = useState([]);
  const [cancelOrder, setCancelOrder] = useState([]);
  const [pendingOrder, setPendingOrder] = useState([]);
  const [completedOrder, setCompletedOrder] = useState([]);
  const orderRef = useRef([]);
  useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation("orders"));
  }, [dispatch]);
  const fn_viewDetails = (id) => {
    if (id === orderId) {
      return setOrderId(0);
    }
    setOrderId(id);
  };

  useEffect(() => {
    const getAllOrders = async () => {
      const { data } = await axiosPrivate.get("/seller/orders", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      orderRef.current = data?.orders;
      setOrders(data?.orders);
    };
    !allOrders?.length && getAllOrders();
  }, []);
  useEffect(() => {
    console.log(selectedTab);
    const allOrderArr = orderRef?.current;

    if (selectedTab === "delivered") {
      const filterOrder = orderRef?.current?.filter(
        (item) => item.status === "completed"
      );
      setCompletedOrder(filterOrder);
      // setOrders(filterOrder);
    } else if (selectedTab === "pending") {
      const filterOrder = orderRef?.current?.filter(
        (item) => item.status === "new"
      );
      setPendingOrder(filterOrder);
      // setOrders(filterOrder);
    } else if (selectedTab === "cancelled") {
      const filterOrder = orderRef?.current?.filter(
        (item) => item.status === "cancelled"
      );

      setCancelOrder(filterOrder);
      // setOrders(filterOrder);
    } else {
      setOrders(allOrderArr);
    }

    console.log("Filtered orders based on selected tab");
  }, [selectedTab]);
  return (
    <>
      <Loading />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[10px] sm:px-[25px]">
            <SearchOnTop />
            <div className="my-[20px] p-[30px] bg-white rounded-[8px] shadow-sm overflow-x-auto w-[94vw] md:w-[67vw] lg:w-[75vw] xl:w-auto">
              <div className="flex gap-10 mb-[15px] w-[max-content]">
                <p
                  className={`cursor-pointer hover:text-[var(--text-color)] font-[500] border-b-[2px] hover:border-[var(--text-color)] ${
                    selectedTab === "all"
                      ? "text-[var(--text-color)] border-[var(--text-color)]"
                      : "text-[var(--text-color-body)] border-transparent"
                  }`}
                  onClick={() => setSelectedTab("all")}
                >
                  All Orders
                </p>
                <p
                  className={`cursor-pointer hover:text-[var(--text-color)] font-[500] border-b-[2px] hover:border-[var(--text-color)] ${
                    selectedTab === "delivered"
                      ? "text-[var(--text-color)] border-[var(--text-color)]"
                      : "text-[var(--text-color-body)] border-transparent"
                  }`}
                  onClick={() => setSelectedTab("delivered")}
                >
                  Delivered
                </p>
                <p
                  className={`cursor-pointer hover:text-[var(--text-color)] font-[500] border-b-[2px] hover:border-[var(--text-color)] ${
                    selectedTab === "pending"
                      ? "text-[var(--text-color)] border-[var(--text-color)]"
                      : "text-[var(--text-color-body)] border-transparent"
                  }`}
                  onClick={() => setSelectedTab("pending")}
                >
                  Pending
                </p>
                <p
                  className={`cursor-pointer hover:text-[var(--text-color)] font-[500] border-b-[2px] hover:border-[var(--text-color)] ${
                    selectedTab === "cancelled"
                      ? "text-[var(--text-color)] border-[var(--text-color)]"
                      : "text-[var(--text-color-body)] border-transparent"
                  }`}
                  onClick={() => setSelectedTab("cancelled")}
                >
                  Cancelled
                </p>
              </div>
              <table className="w-[1000px] xl:w-[100%]">
                <thead>
                  <tr className="font-[500] text-[var(--text-color-body)] text-[15px] h-[50px]">
                    <td>Order No</td>
                    <td>Product Name</td>
                    <td>Price</td>
                    <td>Date</td>
                    <td>Status</td>
                    <td className="w-[80px]">Action</td>
                  </tr>
                </thead>
                {selectedTab === "all" && (
                  <tbody>
                    {allOrders?.map((item) => (
                      <>
                        <tr key={item?.id} className="h-[50px] text-[14px]">
                          <td>{item?.id}</td>
                          <td className="flex items-center gap-1.5 h-[50px] capitalize">
                            <Image
                              alt=""
                              src={electronicLED}
                              className="h-[26px] w-[26px]"
                            />
                            {item?.products?.map(
                              (pro, index) =>
                                `${pro?.title}${
                                  index < item.products.length - 1 ? ", " : ""
                                }`
                            )}
                          </td>
                          <td>
                            ₹
                            {item?.products?.reduce((acc, pro) => {
                              return acc + Number(pro?.quantity) * Number(pro?.price);
                            }, 0)}
                          </td>
                          <td>{item?.date}</td>
                          <td className="w-[150px] ps-[20px]">
                            {item?.status === "completed" ? (
                              <p className="h-[23px] w-[60px] rounded-[5px] bg-[var(--bg-color-delivered)] text-[10px] text-[var(--text-color-delivered)] font-[500] flex items-center justify-center">
                                Delivered
                              </p>
                            ) : item?.status == "new" ? (
                              <p className="h-[23px] w-[60px] rounded-[5px] bg-yellow-200 text-[10px] text-yellow-600 font-[500] flex items-center justify-center">
                                Pending
                              </p>
                            ) : (
                              <p className="h-[23px] w-[60px] rounded-[5px] bg-red-200 text-[10px] text-red-600 font-[500] flex items-center justify-center">
                                Cancelled
                              </p>
                            )}
                          </td>

                          <td className="px-[17px] relative">
                            {/* <Image
                              alt=""
                              src={tableAction}
                              className="cursor-pointer"
                              onClick={() => fn_viewDetails(item.reference_id)}
                            />
                            {orderId === item.reference_id && (
                              <ViewDetails id={item.reference_id} />
                            )} */}
                            <Image
                              alt=""
                              src={tableAction}
                              className="cursor-pointer"
                              onClick={() => fn_viewDetails(item.id)}
                            />
                            {orderId === item.id && (
                              <ViewDetails id={item.id} />
                            )}
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                )}
                {selectedTab === "cancelled" && (
                  <tbody>
                    {cancelOrder?.map((item) => (
                      <>
                        <tr key={item?.id} className="h-[50px] text-[14px]">
                          <td>{item?.id}</td>
                          <td className="flex items-center gap-1.5 h-[50px] capitalize">
                            <Image
                              alt=""
                              src={electronicLED}
                              className="h-[26px] w-[26px]"
                            />
                            {item?.products?.map(
                              (pro, index) =>
                                `${pro?.title}${
                                  index < item.products.length - 1 ? ", " : ""
                                }`
                            )}
                          </td>
                          <td>
                            ₹
                            {item?.products?.reduce((acc, pro) => {
                              return acc + pro?.quantity * pro?.price;
                            }, 0)}
                          </td>
                          <td>{item?.date}</td>
                          <td className="w-[130px]">
                            <p
                              className={cn(
                                item?.status == "new" &&
                                  "bg-[var(--bg-color-delivered)] text-[var(--text-color-delivered)]",
                                item?.status == "cancelled" &&
                                  "bg-red-100 text-red-500",
                                "h-[23px] w-[60px] rounded-[5px]  text-[10px] font-[500] flex items-center justify-center px-4 py-2"
                              )}
                            >
                              {item?.status == "new" && "Pending"}
                              {item?.status == "cancelled" && "Cancelled"}
                              {item?.status == "completed" && "Delivered"}
                            </p>
                          </td>

                          <td className="px-[17px] relative">
                            <Image
                              alt=""
                              src={tableAction}
                              className="cursor-pointer"
                              onClick={() => fn_viewDetails(item.id)}
                            />
                            {orderId === item.id && (
                              <ViewDetails id={item.id} />
                            )}
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                )}
                {selectedTab === "pending" && (
                  <tbody>
                    {pendingOrder?.map((item) => (
                      <>
                        <tr key={item?.id} className="h-[50px] text-[14px]">
                          <td>{item?.id}</td>
                          <td className="flex items-center gap-1.5 h-[50px] capitalize">
                            <Image
                              alt=""
                              src={electronicLED}
                              className="h-[26px] w-[26px]"
                            />
                            {item?.products?.map(
                              (pro, index) =>
                                `${pro?.title}${
                                  index < item.products.length - 1 ? ", " : ""
                                }`
                            )}
                          </td>
                          <td>
                            ₹
                            {item?.products?.reduce((acc, pro) => {
                              return acc + pro?.quantity * pro?.price;
                            }, 0)}
                          </td>
                          <td>{item?.date}</td>
                          <td className="w-[130px]">
                            <p className="h-[23px] w-[60px] rounded-[5px] bg-yellow-200 text-[10px] text-yellow-600 font-[500] flex items-center justify-center">
                              Pending
                            </p>
                          </td>

                          <td className="px-[17px] relative">
                            <Image
                              alt=""
                              src={tableAction}
                              className="cursor-pointer"
                              onClick={() => fn_viewDetails(item.id)}
                            />
                            {orderId === item.id && (
                              <ViewDetails id={item.id} />
                            )}
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                )}
                {selectedTab === "delivered" && (
                  <tbody>
                    {completedOrder?.map((item) => (
                      <>
                        <tr key={item?.id} className="h-[50px] text-[14px]">
                          <td>{item?.id}</td>
                          <td className="flex items-center gap-1.5 h-[50px] capitalize">
                            <Image
                              alt=""
                              src={electronicLED}
                              className="h-[26px] w-[26px]"
                            />
                            {item?.products?.map(
                              (pro, index) =>
                                `${pro?.title}${
                                  index < item.products.length - 1 ? ", " : ""
                                }`
                            )}
                          </td>
                          <td>
                            ₹
                            {item?.products?.reduce((acc, pro) => {
                              return acc + pro?.quantity * pro?.price;
                            }, 0)}
                          </td>
                          <td>{item?.date}</td>
                          <td className="w-[130px]">
                            <p
                              className={cn(
                                item?.status == "new" &&
                                  "bg-[var(--bg-color-delivered)] text-[var(--text-color-delivered)]",
                                item?.status == "cancelled" &&
                                  "bg-red-100 text-red-500",
                                "h-[23px] w-[60px] rounded-[5px]  text-[10px] font-[500] flex items-center justify-center px-4 py-2"
                              )}
                            >
                              {item?.status == "new" && "Pending"}
                              {item?.status == "cancelled" && "Cancelled"}
                              {item?.status == "completed" && "Delivered"}
                            </p>
                          </td>

                          <td className="px-[17px] relative">
                            <Image
                              alt=""
                              src={tableAction}
                              className="cursor-pointer"
                              onClick={() => fn_viewDetails(item.id)}
                            />
                            {orderId === item.id && (
                              <ViewDetails id={item.id} />
                            )}
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Orders;

const ViewDetails = ({ id }) => {
  const navigate = useRouter();
  const dispatch = useDispatch();
  return (
    <div className="absolute py-[10px] px-[10px] flex flex-col items-center text-[var(--text-color-body)] bg-white rounded-[8px] shadow-md border border-gray-100 w-[max-content] left-[-145px] top-[13px] cursor-pointer">
      <div
        className="flex items-center gap-2.5 w-full px-2 py-1.5 hover:bg-gray-100 rounded-sm"
        onClick={() => {
          dispatch(updatePageLoader(true));
          navigate.push(`/orders/${id}`);
        }}
      >
        <IoEye className="w-[20px] h-[20px]" />
        <p className="text-[14px]">View Details</p>
      </div>
    </div>
  );
};
