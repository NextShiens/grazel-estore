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
import OrderTable from "../../../components/OrderTable";

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

  const uniqueCustomerOrders = allOrders.reduce((acc, order) => {
    const customerExists = acc.some(
      (existingOrder) => existingOrder.customer.email === order.customer.email
    );
    if (!customerExists) {
      acc.push(order);
    }
    return acc;
  }, []);

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
                  {uniqueCustomerOrders.length > 0 &&
                    uniqueCustomerOrders.map((order) => (
                      <OrderTable
                        allOrders={uniqueCustomerOrders}
                        type={"customers"}
                        key={order.id}
                        order={order}
                      />
                    ))}
                  {!allOrders.length && (
                    <h3 className="text-red-500 text-center mt-2">
                      No order found
                    </h3>
                  )}
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
