"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Rating } from "@mui/material";
import { toast } from "react-toastify";
import { FaTrashAlt, FaCheckCircle } from "react-icons/fa";
import { PiCameraThin } from "react-icons/pi";
import { IoCloseSharp, IoLockClosed } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { addReviewApi, cancelOrderApi, getOrderTrackingApi } from "@/apis";

import BBB from "@/assets/Box.png";
import CCC from "@/assets/Shipping.png";
import DDD from "@/assets/sort by time.png";
import AAA from "@/assets/Health Report.png";
import close from "@/assets/close.png";

import CustomModal from "./CustomModel";

interface OrderProduct {
  id: string;
  title: string;
  quantity: number;
  featured_image: string;
  discounted_price: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  products: OrderProduct[];
}

interface OrderTracking {
  expected_delivery_date: string;
  tracking_id: string;
  status_history: {
    status: string;
    changed_at: string;
  }[];
}

interface MyorderCardProps {
  order: Order;
  status?: string[];
  setHasOrderCanceled?: React.Dispatch<React.SetStateAction<boolean>>;
  getMyAllOrders: () => void;
}

const MyorderCard: React.FC<MyorderCardProps> = ({
  order,
  status,
  setHasOrderCanceled,
  getMyAllOrders,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [showReview, setShowReview] = useState<boolean>(false);
  const [orderTracking, setOrderTracking] = useState<OrderTracking | null>(null);
  const [isTrackingVisible, setIsTrackingVisible] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [showCancelMap, setShowCancelMap] = useState<Record<string, boolean>>({});
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchOrderTracking = async () => {
      try {
        const { data } = await getOrderTrackingApi(order.id);
        setOrderTracking(data.order);
      } catch (error) {
        console.error("Failed to fetch order tracking:", error);
        toast.error("Failed to fetch order tracking");
      }
    };

    fetchOrderTracking();
  }, [order.id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imagePreviews = files.map((file) => URL.createObjectURL(file));
    setSelectedImages(imagePreviews);
  };

  const handleReviewSubmit = async () => {
    const files = fileInputRef.current?.files;
    const formData = new FormData();

    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });
    }

    formData.append("comment", comment);
    formData.append("rating", String(rating));
    formData.append("product_id", productId);

    try {
      const { data } = await addReviewApi(formData);
      if (data.success) {
        toast.success("Review has been added");
        setShowReview(false);
        setRating(0);
        setComment("");
        setSelectedImages([]);
      }
    } catch (error) {
      toast.error("Failed to add review");
    }
  };

  const handleOrderCancel = async () => {
    if (!order?.id) return;
    try {
      setIsModalVisible(false);
      const { data } = await cancelOrderApi(order.id);
      getMyAllOrders();
      if (data.success) {
        toast.success("Order has been cancelled");
      }
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  const toggleCancelOption = (orderId: string) => {
    setShowCancelMap((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId],
    }));
  };

  const renderOrderStatus = () => {
    const statuses = [
      { icon: AAA, label: "Order placed", date: order.date },
      { icon: BBB, label: "In Progress", status: "in_progress" },
      { icon: CCC, label: "Shipped", status: "shipped" },
      { icon: DDD, label: "Delivered", status: "completed" },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
        {statuses.map((step, index) => {
          const statusInfo = orderTracking?.status_history.find(
            (s) => s.status === step.status
          );
          const isCompleted = statusInfo || (index === 0 && orderTracking);
          const date = statusInfo
            ? new Date(statusInfo.changed_at).toLocaleString()
            : step.date || "Not available";

          return (
            <div key={index} className="flex items-center">
              <div className="mr-4 relative">
                <FaCheckCircle
                  className={`h-8 w-8 ${isCompleted ? "text-green-500" : "text-gray-300"
                    }`}
                />
                {index < statuses.length - 1 && (
                  <div
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-full ${isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                  />
                )}
              </div>
              <div>
                <Image src={step.icon} alt="" className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium text-gray-800">
                  {step.label}
                </p>
                <p className="text-xs text-gray-600">{date}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const currentStatus = orderTracking?.status_history.slice(-1)[0]?.status;

  if (status?.length > 0 && !status.includes(currentStatus)) return null;

  return (
    <>
      {order.products.map((prod: OrderProduct) => (
        <div
          key={prod.id}
          className="w-full rounded-2xl p-6 mt-6 border border-gray-200 hover:border-red-500 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="border border-gray-300 rounded-full px-3 py-1 flex items-center">
                <IoLockClosed className="w-4 h-4 mr-2 text-gray-500" />
                <p className="text-sm text-gray-600">{order.date}</p>
              </div>
            </div>

            {currentStatus !== "cancelled" && currentStatus !== "completed" && (
              <div className="flex items-center">
                {showCancelMap[order.id] && (
                  <button
                    onClick={() => setIsModalVisible(true)}
                    className="flex items-center px-3 py-2 rounded-lg bg-white border border-red-500 text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors duration-300 mr-2"
                  >
                    <IoCloseSharp className="text-lg mr-1" />
                    <span className="text-sm font-medium">Cancel order</span>
                  </button>
                )}
                <button
                  onClick={() => toggleCancelOption(order.id)}
                  className="p-2 rounded-md border border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-300"
                >
                  <HiOutlineDotsVertical className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
                <Image
                  alt="Product Image"
                  width={96}
                  height={96}
                  src={prod.featured_image}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">{prod.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Quantity: {prod.quantity}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end">
              <p className="text-xl font-bold text-gray-800">
                ₹ {prod.discounted_price || prod.price * prod.quantity}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${currentStatus === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}
                >
                  {currentStatus}
                </span>
                {currentStatus !== "completed" && currentStatus !== "cancelled" && (
                  <button
                    className="flex items-center px-3 py-1 bg-blue-100 rounded-full text-xs font-medium text-blue-800"
                    onClick={() => setIsTrackingVisible(!isTrackingVisible)}
                  >
                    <span>Order Tracking</span>
                    {isTrackingVisible ? (
                      <IoIosArrowUp className="ml-1" />
                    ) : (
                      <IoIosArrowDown className="ml-1" />
                    )}
                  </button>
                )}
                {currentStatus === "completed" && (
                  <button
                    className="px-3 py-1 bg-yellow-100 rounded-full text-xs font-medium text-yellow-800"
                    onClick={() => {
                      setProductId(prod.id);
                      setShowReview(true);
                    }}
                  >
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          </div>

          {isTrackingVisible && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="mb-4">
                <p className="text-lg font-semibold text-gray-800">
                  Delivery Details
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">
                    Expected Delivery Date:
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {orderTracking?.expected_delivery_date}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tracking ID:</p>
                  <p className="text-sm font-medium text-gray-800">
                    {orderTracking?.tracking_id}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-lg font-semibold text-gray-800">
                  Order Status
                </p>
              </div>

              {renderOrderStatus()}
            </div>
          )}
        </div>
      ))}

      <CustomModal showModal={isModalVisible} onClose={() => setIsModalVisible(false)}>
        <div className="w-full max-w-md p-6">
          <div className="text-center">
            <Image
              src={close}
              alt="close"
              className="mx-auto h-24 w-24 text-red-600"
            />
            <h3 className="mt-4 text-2xl font-bold text-gray-900">
              Cancel Order
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to cancel the order?
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded-md text-gray-800 font-medium hover:bg-gray-300 transition-colors duration-300"
                onClick={() => setIsModalVisible(false)}
              >
                No, Keep Order
              </button>
              <button
                className="px-4 py-2 bg-red-600 rounded-md text-white font-medium hover:bg-red-700 transition-colors duration-300"
                onClick={handleOrderCancel}
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      </CustomModal>

      <CustomModal showModal={showReview} onClose={() => setShowReview(false)}>
        <div className="w-full max-w-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Write a Review
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate the Product
            </label>
            <Rating
              name="product-rating"
              value={rating}
              onChange={(_, value) => setRating(value || 0)}
              size="large"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="review-comment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Review
            </label>
            <textarea
              id="review-comment"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Share your thoughts..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Photos
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {selectedImages.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                  alt={`Review image ${index + 1}`}
                />
              ))}
              <div
                className="w-16 h-16 border-2 rounded-lg border-red-500 flex justify-center items-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <PiCameraThin className="h-8 w-8 text-red-500" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
                multiple
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              className="px-4 py-2 bg-gray-200 rounded-md text-gray-800 font-medium hover:bg-gray-300 transition-colors duration-300"
              onClick={() => setShowReview(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 rounded-md text-white font-medium hover:bg-red-700 transition-colors duration-300"
              onClick={handleReviewSubmit}
            >
              Submit Review
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default MyorderCard;