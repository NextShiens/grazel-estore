"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import productOne from "@/assets/product-1.png";
import img from "@/assets/product-1.png";
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
    const { data } = await axiosPrivate.get(`/admin/orders/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    setOrder(data?.order);
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
      const { data } = await axiosPrivate.get(
        `/buyer/orders/${order.id}/track-status`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      setOrderTracking(data.order);
    })();
  }, [order.id]);
  const handleChange = (value) => {
    console.log(`selected ${value}`);
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
              <p className="text-[25px] font-[500]">Seller</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-10 items-center border border-gray-200 rounded-[8px] px-7 lg:px-10 py-7">
                {/* {order.orderProducts && (
                  <Image
                    width={80}
                    height={80}
                    alt="seller"
                    src={order?.orderProducts[0]?.seller?.store_image}
                    className="w-[80px] h-[80px] rounded-full col-span-2 md:col-span-1"
                  />
                )} */}
                <div>
                  {order?.orderProducts && (
                    <p className="text-[17px]">
                      {order?.orderProducts[0]?.seller?.name}
                    </p>
                  )}
                  <p className="text-[17px]">
                    ID:{" "}
                    {order.orderProducts && order.orderProducts[0]?.seller?.id}
                  </p>
                </div>
                <p className="absolute right-20 sm:right-auto sm:relative h-[30px] w-[70px] rounded-[5px] bg-[var(--bg-color-delivered)] text-[14px] text-[var(--text-color-delivered)] font-[500] flex items-center justify-center">
                  {order.orderProducts && order.orderProducts[0]?.active
                    ? "Active"
                    : "Inactive"}
                </p>
              </div>
            </div>
            <div className="pb-[15px] pt-[30px] flex justify-between flex-col sm:flex-row gap-3 border-b border-gray-200 sm:items-center">
              <p className="text-[20px] font-[500]">
                Order ID #{orderTracking?.tracking_id}
              </p>
              <div className="flex justify-end">
                <p className="h-[30px] w-[80px] rounded-[5px] bg-[var(--bg-color-delivered)] text-[14px] text-[var(--text-color-delivered)] font-[500] flex items-center justify-center">
                  {orderTracking?.status_history?.slice(-1)[0]?.status}
                </p>
              </div>
            </div>

            <div className="mt-[25px] border border-gray-200 rounded-[8px] shadow-sm px-[20px] py-[30px]">
              <p className="text-[20px] w-[500] font-[500] mb-4">Product</p>
              <div className="flex flex-col gap-5">
                {order?.orderProducts?.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div className="flex gap-7 items-center">
                      <Image
                        alt=""
                        width={75}
                        height={75}
                        src={`/` + item.featured_image}
                        className="w-[75px] h-[75px] rounded-[9px]"
                      />
                      <div>
                        <p className="text-[18px] font-[500]">{item?.title}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[24px] font-[500]">
                        ₹{item?.discount ? item?.discounted_price : item?.price}
                      </p>
                      <p className="font-[400] text-[var(--text-color-body)] text-end">
                        Qty : {item?.quantity ? item?.quantity : 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pb-[15px] pt-[30px] m-[30px]">
            {/* <p className="text-[23px] font-[500]">Description</p>
            <p className="text-[#777777] text-[17px] mt-3">
              Lorem ipsum dolor sit amet consectetur. Iaculis pretium
              suspendisse id dictum ultricies pretium posuere magna aliquam.
              Massa amet congue duis laoreet id sed hendrerit. Elementum nec
              ligula ac orci tristique morbi velit tempus arcu. Sed tortor vel
              in faucibus augue ipsum quam. Sit sit enim dui ut cras tristique
              vitae eros. Elementum non in aliquam arcu. Tellus quam quam
              laoreet arcu a. Varius a elit eget quam libero felis a scelerisque
              ipsum. Auctor pharetra egestas vel erat in ligula eget. Lorem
              ipsum dolor sit amet consectetur. Iaculis pretium suspendisse id
              dictum ultricies pretium posuere magna aliquam. Massa amet congue
              duis laoreet id sed hendrerit. Elementum nec ligula ac orci
              tristique morbi velit tempus arcu. Sed tortor vel in faucibus
              augue ipsum quam. Sit sit enim dui ut cras tristique vitae eros.
              Elementum non in aliquam arcu. Tellus quam quam laoreet arcu a.
              Varius a elit eget quam libero felis a scelerisque ipsum. Auctor
              pharetra egestas vel erat in ligula eget.
            </p> */}
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
      <div></div>
      <Modal
        title="Change Order Status"
        open={open}
        onOk={isPending && onUpdateStatus}
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
