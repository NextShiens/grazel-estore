"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import tableNameImg from "../../../assets/profile.jpeg";
import {
  updatePageLoader,
  updatePageNavigation,
} from "../../../features/features";
import Navbar from "../../../components/navbar";
import Sidebar from "../../../components/sidebar";
import SearchOnTop from "../../../components/SearchOnTop";

import electronicLED from "../../../assets/Electronic-LED.png";
import tableAction from "../../../assets/svgs/table-action.svg";
import { IoEye } from "react-icons/io5";

import { useRouter } from "next/navigation";
import { axiosPrivate } from "../../../axios/index";
import { cn } from "../../../lib/utils";

const CustomerOrder = () => {
  const dispatch = useDispatch();
  const [orderId, setOrderId] = useState(0);

  const [allOrders, setOrders] = useState([]);

  const orderRef = useRef([]);
  const router = useRouter();

  useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation("customers"));
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

  function onNavigate(order) {
    let filterOrder = allOrders?.filter(
      (item) => item?.user_id == order?.user_id
    );
    if (typeof window !== undefined) {
      localStorage.setItem("recentOrder", JSON.stringify(filterOrder));
    }
    dispatch(updatePageLoader(true));
    router.push(`/customers/${order?.user_id}`);
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[10px] sm:px-[25px]">
            <SearchOnTop />
            <div className="my-[20px] p-[30px] bg-white rounded-[8px] shadow-sm overflow-x-auto w-[94vw] md:w-[67vw] lg:w-[75vw] xl:w-auto">
              <table className="w-[1000px] xl:w-[100%]">
                <thead>
                  <tr className="font-[500] text-[var(--text-color-body)] text-[15px] h-[50px]">
                    <td>Name</td>
                    <td>Email</td>
                    <td>Phone Number</td>
                    <td>Recent Orders</td>
                    <td>Order Status</td>

                    <td className="w-[80px]">Action</td>
                  </tr>
                </thead>

                <tbody>
                  {allOrders?.map((item) => (
                    <>
                      <tr key={item?.id} className="h-[50px] text-[14px]">
                        <td className="flex items-center gap-1.5 h-[50px]">
                          <Image
                            alt=""
                            src={tableNameImg}
                            className="h-[26px] w-[26px] rounded-[5px]"
                          />
                          {item?.customer?.username}
                        </td>

                        <td>{item?.customer?.email}</td>
                        <td>+923007009043</td>
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
                        <td className="w-[130px]">
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
                          <Image
                            alt=""
                            src={tableAction}
                            className="cursor-pointer"
                            onClick={() => fn_viewDetails(item.id)}
                          />
                          {orderId === item.id && (
                            <ViewDetails onNavigate={onNavigate} order={item} />
                          )}
                        </td>
                      </tr>
                    </>
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

export default CustomerOrder;

const ViewDetails = ({ onNavigate, order }) => {
  return (
    <div className="absolute py-[10px] px-[10px] flex flex-col items-center text-[var(--text-color-body)] bg-white rounded-[8px] shadow-md border border-gray-100 w-[max-content] left-[-145px] top-[13px] cursor-pointer">
      <div
        className="flex items-center gap-2.5 w-full px-2 py-1.5 hover:bg-gray-100 rounded-sm"
        onClick={() => onNavigate(order)}
      >
        <IoEye className="w-[20px] h-[20px]" />
        <p className="text-[14px]">View Details</p>
      </div>
    </div>
  );
};
