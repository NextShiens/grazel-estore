"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import Navbar from "../../../../components/navbar";
import Sidebar from "../../../../components/sidebar";
import {
  updatePageLoader,
  updatePageNavigation,
} from "../../../../features/features";
import productOne from "../../../../assets/product-1.png";
import productTwo from "../../../../assets/dashboard-product-2.png";
import productThree from "../../../../assets/dashboard-product-3.png";
import img from "../../../../assets/product-1.png";
import { useParams } from "next/navigation";
import { axiosPrivate } from "../../../../axios/index";
import Link from "next/link";
import { toast } from "react-toastify";
import { Modal, Select } from "antd";

import { BiSolidEditAlt } from "react-icons/bi";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";
import { PiVan } from "react-icons/pi";
import { SiHackthebox } from "react-icons/si";
import { CgNotes } from "react-icons/cg";

const OrderDetails = () => {
  const [order, setOrder] = useState({});
  const [isPending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const hideModal = () => {
    setOpen(false);
  };

  const dispatch = useDispatch();
  const { id } = useParams();
  useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation("orders"));
  }, [dispatch]);
  const getSingleOrder = async () => {
    const { data } = await axiosPrivate.get(`/seller/orders/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    // console.log(data);
    setOrder(data?.order);
  };
  useEffect(() => {
    getSingleOrder();
  }, []);
  async function onUpdateStatus() {
    if (!status) return;
    if(status === order?.status) return toast.error(`Order is already in this state`)
    let formdata = new FormData();
    formdata.append("status", status);
    try {
      setPending(true);
      await axiosPrivate.put(`/seller/orders/${id}/status`, formdata, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success("Status has been updated");
      getSingleOrder();
    } catch (error) {
    } finally {
      hideModal();
      setTimeout(() => {
        setPending(false);
      }, 700);
    }
  }
  const handleChange = (value) => {
    console.log(`selected ${value}`);
    setStatus(value);
  };
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 mt-[30px] px-[22px]">
          <div className="bg-white rounded-[8px] font-[66] px-[20px] py-[25px] shadow-sm">
            <div className="flex justify-between items-center">
              <p className="font-[600] text-[20px]">Order ID #{order?.id}</p>
              {order?.status === "completed" ? (
                <p className="h-[23px] w-[60px] rounded-[5px] bg-[var(--bg-color-delivered)] text-[10px] text-[var(--text-color-delivered)] font-[500] flex items-center justify-center">
                  Delivered
                </p>
              ) : order?.status == "new" ? (
                <p className="h-[23px] w-[60px] rounded-[5px] bg-yellow-200 text-[10px] text-yellow-600 font-[500] flex items-center justify-center">
                  Pending
                </p>
              ) : (
                <p className="h-[23px] w-[60px] rounded-[5px] bg-red-200 text-[10px] text-red-600 font-[500] flex items-center justify-center">
                  Cancelled
                </p>
              )}
            </div>
            <div className="mt-[25px] border border-gray-200 rounded-[8px] shadow-sm px-[20px] py-[30px] flex flex-col xl:flex-row gap-8 xl:gap-10 justify-between">
              <div>
                <p className="text-[20px] w-[500] font-[500] mb-4">
                  Order Summary
                </p>
                <div className="flex gap-10 xl:gap-3">
                  <Image
                    alt=""
                    src={img}
                    className="w-[100px] h-[100px] rounded-full"
                  />
                  <div className="flex flex-col justify-center gap-2">
                    <div className="text-[var(--text-color-body)] font-[400] flex items-center gap-2 capitalize">
                      <BiSolidEditAlt className="h-[22px] w-[22px]" />
                      {order?.customer?.username}
                    </div>
                    <div className="text-[var(--text-color-body)] font-[400] flex items-center gap-2">
                      <FaMoneyCheckDollar className="h-[22px] w-[22px]" />₹
                      {order?.orderProducts?.reduce((acc, item) => {
                        if (item?.discounted_price) {
                          return acc + item?.discounted_price * item?.quantity;
                        } else {
                          return acc + item?.price * item?.quantity;
                        }
                      }, 0)}
                    </div>
                    <div className="text-[var(--text-color-body)] font-[400] flex items-center gap-2 capitalize">
                      <FaCreditCard className="h-[22px] w-[22px]" />
                      {order?.payment_type}
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden xl:block border border-gray-200"></div>
              <div>
                <p className="text-[20px] w-[500] font-[500] mb-4">
                  Shipping Details
                </p>
                <div className="flex flex-col justify-center gap-2">
                  <div className="text-[var(--text-color-body)] font-[400] flex items-center gap-2">
                    <CiLocationOn className="h-[22px] w-[22px]" />
                    Main St, Anytown, CA 123
                  </div>
                  <div className="text-[var(--text-color-body)] font-[400] flex items-center gap-2 capitalize">
                    <PiVan className="h-[22px] w-[22px]" />
                    Status: {order?.payment}
                  </div>
                  <div className="text-[var(--text-color-body)] font-[400] flex items-center gap-2">
                    <SiHackthebox className="h-[22px] w-[22px]" />
                    {order?.date}
                  </div>
                </div>
              </div>
              {/* <div className="hidden xl:block border border-gray-200"></div>
              <div>
                <p className="text-[20px] w-[500] font-[500] mb-4">
                  Notes By Customer
                </p>
                <div className="flex flex-col justify-center gap-2">
                  <div className="text-[var(--text-color-body)] font-[400] flex items-center gap-2">
                    <CgNotes className="h-[22px] w-[22px]" />
                    Customer requested gift wrapping
                  </div>
                  <div className="text-[var(--text-color-body)] font-[400] flex items-center gap-2">
                    <CgNotes className="h-[22px] w-[22px]" />I perfer
                    eco-friendly packaging
                  </div>
                </div>
              </div> */}
              <div className="hidden xl:block"></div>
            </div>
            <div className="mt-[25px] border border-gray-200 rounded-[8px] shadow-sm px-[20px] py-[30px]">
              <p className="text-[20px] w-[500] font-[500] mb-4">Product</p>
              <div className="flex flex-col gap-5">
                {order?.orderProducts?.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div className="flex gap-7 items-center">
                      <Image
                        alt=""
                        src={productOne}
                        className="w-[75px] h-[75px] rounded-[9px]"
                      />
                      <div>
                        <p className="text-[18px] font-[500]">{item?.title}</p>
                        <p className="font-[400] text-[var(--text-color-body)]">
                          {item?.color}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[24px] font-[500]">
                        ₹
                        {item?.discounted_price
                          ? item?.discounted_price
                          : item?.price}
                      </p>
                      <p className="font-[400] text-[var(--text-color-body)] text-end">
                        Qty : {item?.quantity ? item?.quantity : 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="h-[50px] font-[500] rounded-[8px] text-white px-[20px] lg:px-[70px] bg-[#FE4242] mt-[25px]" onClick={showModal}>
              Update Order
            </button>
          </div>
        </div>
      </div>
      <Modal
        title="Change Order Status"
        open={open}
        onOk={onUpdateStatus}
        onCancel={hideModal}
        okText="Change Status"
        cancelText="Cancel"
      >
        <div>
          <Select
            defaultValue="Status"
            style={{ width: 200 }}
            onChange={handleChange}
            options={[
              {
                label: <span>Status</span>,
                title: "Status",
                options: [
                  { label: <span>Active</span>, value: "new" },
                  { label: <span>Shipped</span>, value: "shipped" },
                  { label: <span>Completed</span>, value: "completed" },
                ],
              },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetails;
