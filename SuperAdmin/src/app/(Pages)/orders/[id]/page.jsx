"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import { useParams } from "next/navigation";
import { axiosPrivate } from "@/axios";
import Link from "next/link";
import { toast } from "react-toastify";
import { Modal, Select } from "antd";

const OrderDetails = () => {
  const [order, setOrder] = useState({});
  const [isPending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [orderTracking, setOrderTracking] = useState();

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
    try {
      const { data } = await axiosPrivate.get(`/admin/orders/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setOrder(data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  };

  useEffect(() => {
    getSingleOrder();
  }, []);

  async function onUpdateStatus() {
    if (!status) return;
    let formdata = new FormData();
    formdata.append("status", status);
    try {
      setPending(true);
      await axiosPrivate.put(`/admin/orders/${id}/status`, formdata, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success("Status has been updated");
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      hideModal();
      setTimeout(() => {
        setPending(false);
      }, 700);
    }
  }

  useEffect(() => {
    (async () => {
      if (!order?.id) return;
      try {
        const { data } = await axiosPrivate.get(
          `/buyer/orders/${order.id}/track-status`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        setOrderTracking(data.order);
      } catch (error) {
        console.error("Error fetching order tracking:", error);
      }
    })();
  }, [order.id]);

  const handleChange = (value) => {
    setStatus(value);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <div className="flex-1 bg-white rounded-[8px] shadow-sm p-[25px] m-[30px]">
            <div className="flex gap-3 lg:gap-16 md:items-center flex-col md:flex-row">
              <p className="text-[25px] font-[500]">Customer</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-10 items-center border border-gray-200 rounded-[8px] px-7 lg:px-10 py-7">
                <div>
                  <p className="text-[17px]">{order.customer?.username}</p>
                  <p className="text-[17px]">ID: {order.customer?.id}</p>
                </div>
                <p className="absolute right-20 sm:right-auto sm:relative h-[30px] w-[70px] rounded-[5px] bg-[var(--bg-color-delivered)] text-[14px] text-[var(--text-color-delivered)] font-[500] flex items-center justify-center">
                  {order.payment === "paid" ? "Paid" : "Not Paid"}
                </p>
              </div>
            </div>
            <div className="pb-[15px] pt-[30px] flex justify-between flex-col sm:flex-row gap-3 border-b border-gray-200 sm:items-center">
              <p className="text-[20px] font-[500]">
                Order ID #{order.tracking_id}
              </p>
              <div className="flex justify-end">
                <p className="h-[30px] w-[80px] rounded-[5px] bg-[var(--bg-color-delivered)] text-[14px] text-[var(--text-color-delivered)] font-[500] flex items-center justify-center">
                  {order.payment}
                </p>
              </div>
            </div>

            <div className="mt-[25px] border border-gray-200 rounded-[8px] shadow-sm px-[20px] py-[30px]">
              <p className="text-[20px] w-[500] font-[500] mb-4">Order Details</p>
              <div className="flex flex-col gap-5">
                <p>Reference ID: {order.reference_id}</p>
                <p>Date: {order.date}</p>
                <p>Payment Type: {order.payment_type}</p>
                <p>Transaction ID: {order.transaction_id}</p>
                <p>Expected Delivery Date: {order.expected_delivery_date || 'Not set'}</p>
              </div>
            </div>

            <div className="mt-[25px] border border-gray-200 rounded-[8px] shadow-sm px-[20px] py-[30px]">
              <p className="text-[20px] w-[500] font-[500] mb-4">Customer Address</p>
              <div className="flex flex-col gap-5">
                <p>Recipient Name: {order.customer_address?.recipient_name}</p>
                <p>Address: {order.customer_address?.address}</p>
                <p>Address Label: {order.customer_address?.address_label}</p>
                <p>Phone: {order.customer_address?.recipient_phone}</p>
                <p>Note: {order.customer_address?.note}</p>
              </div>
            </div>
          </div>

          <div className="pb-[15px] pt-[30px] m-[30px]">
            <div className="pt-[20px] flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-7">
              <button
                onClick={showModal}
                className="h-[50px] w-[130px] rounded-[8px] bg-[#00A1FF] text-white"
              >
                Edit
              </button>

              <Link href="/orders">
                <button className="h-[50px] w-[130px] rounded-[8px] bg-[#F70000] text-white">
                  Return
                </button>
              </Link>
            </div>
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