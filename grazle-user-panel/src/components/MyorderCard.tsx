"use client";
import Image from "next/image";
import BBB from "@/assets/Box.png";
import close from "@/assets/close.png";
import { Rating } from "@mui/material";
import { toast } from "react-toastify";
import CustomModal from "./CustomModel";
import CCC from "@/assets/Shipping.png";
import { FaTrashAlt } from "react-icons/fa";
import DDD from "@/assets/sort by time.png";
import AAA from "@/assets/Health Report.png";
import { PiCameraThin } from "react-icons/pi";
import { FaCheckCircle } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi";
import React, { useEffect, useRef, useState } from "react";
import { IoCloseSharp, IoLockClosed } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { addReviewApi, cancelOrderApi, getOrderTrackingApi } from "@/apis";

const MyorderCard = ({
  order,
  status,
  setHasOrderCanceled,
  getMyAllOrders,
}: {
  order: any;
  status?: any;
  setHasOrderCanceled?: any;
  getMyAllOrders: () => void;
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [productId, setProductId] = useState("");
  const [showleave, setShowLeave] = useState(false);
  const [showcancel, setShowcancel] = useState(false);
  const [orderTracking, setOrderTracking] = useState({});
  const [isDivVisible, setIsDivVisible] = useState(false);
  const [showSendModel, setShowSendModel] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showCancelMap, setShowCancelMap] = useState({});
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  console.log(order, status, "status");

  useEffect(() => {
    (async () => {
      const { data } = await getOrderTrackingApi(order.id);
      setOrderTracking(data.order);
    })();
  }, [order.id]);

  const handleOpeneModel = () => {
    setShowSendModel(true);
  };

  const handleCloseModel = () => {
    setShowSendModel(false);
  };

  const handleButtonClick = () => {
    setIsDivVisible((prev) => !prev);
  };

  const handleRevModal = () => {
    setShowLeave((prev) => !prev);
  };
  const toggleShowCancel = (orderId) => {
    setShowCancelMap((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId],
    }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    fileInputRef?.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const imagePreviews = files.map((file) => URL.createObjectURL(file));
      setSelectedImages(imagePreviews);
    }
  };

  const revSubHandler = async () => {
    const files = fileInputRef?.current?.files;
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
        // Close the modal
        setShowLeave(false);
        // Reset the form state
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
        // setHasOrderCanceled((prev) => !prev);
        toast.success("Order has been cancelled");
      }
    } catch (error) {
      toast.error("failed to cancel order");
    }
  };

  const orderPlaced = orderTracking?.status_history?.find((status: any) => {
    return status.status === "new";
  });
  const inProgressOrder = orderTracking?.status_history?.find((status: any) => {
    return status.status === "in_progress";
  });

  const shippedOrder = orderTracking?.status_history?.find((status: any) => {
    return status.status === "shipped";
  });
  const deliveredOrder = orderTracking?.status_history?.find((status: any) => {
    return status.status === "completed";
  });
  // console.log("iam updated", orderTracking);

  const orderStatus = orderTracking?.status_history?.slice(-1)[0]?.status;

  if (status?.length > 0 && !status.includes(orderStatus)) return null;

  return (
    <>
      {order.products.map((prod: any) => (
        <div
          key={prod.id}
          className="w-full rounded-2xl p-4 sm:p-6 mt-4 sm:mt-6 border border-gray-200 hover:border-red-500 transition-colors duration-300 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="border border-gray-300 rounded-full px-3 py-1 flex items-center">
                <IoLockClosed className="w-3 h-3 mr-2 text-gray-500" />
                <p className="text-xs sm:text-sm text-gray-600">{order.date}</p>
              </div>
            </div>

            {orderTracking?.status_history?.slice(-1)[0].status !==
              "cancelled" &&
              orderTracking?.status_history?.slice(-1)[0].status !==
                "completed" && (
                <div className="flex items-center">
                  {showCancelMap[order.id] && (
                    <button
                      onClick={() => setIsModalVisible(true)}
                      className="hidden sm:flex items-center px-4 py-2 rounded-lg bg-white border border-red-500 text-red-500 hover:bg-red-50 transition-colors duration-300 mr-3"
                    >
                      <IoCloseSharp className="text-lg mr-2" />
                      <span className="text-sm font-medium">Cancel Order</span>
                    </button>
                  )}
                  <button
                    onClick={() => toggleShowCancel(order.id)}
                    className="p-2 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors duration-300"
                  >
                    <HiOutlineDotsVertical className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4">
            <div className="flex items-center">
              <div className="h-30 w-20 bg-red-50  flex items-center justify-center mr-4">
                <Image
                  alt="Product Image"
                  width={90}
                  height={90}
                  src={prod.featured_image}
                  className="rounded-xl object-cover"
                  onError={(e: any) => {
                    console.error("Image failed to load:", e);
                    e.target.src = "/path/to/fallback-image.jpg";
                  }}
                />
              </div>
              <div>
                <p className="font-medium text-gray-800">{prod.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Quantity: {prod.quantity}
                </p>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
              <p className="text-lg font-medium text-gray-800">
                Price:₹{" "}
                {prod.discounted_price
                  ? prod.discounted_price
                  : prod.price * prod.quantity}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${
                    orderTracking?.status_history?.slice(-1)[0].status ===
                    "completed"
                      ? "bg-green-50 text-green-600 border-green-200"
                      : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {orderTracking?.status_history?.slice(-1)[0].status}
                </button>
                {orderTracking?.status_history?.slice(-1)[0].status !==
                  "completed" && (
                  <button
                    className="flex items-center px-4 py-2 bg-orange-50 rounded-full text-sm font-medium text-orange-500 border border-orange-200"
                    onClick={handleButtonClick}
                  >
                    <span>Order Tracking</span>
                    {isDivVisible ? (
                      <IoIosArrowUp className="ml-1" />
                    ) : (
                      <IoIosArrowDown className="ml-1" />
                    )}
                  </button>
                )}
                {orderTracking?.status_history?.slice(-1)[0].status ===
                  "completed" && (
                  <button
                    className="px-4 py-2 bg-yellow-50 rounded-full text-sm font-medium text-yellow-600 border border-yellow-200"
                    onClick={() => {
                      setProductId(prod.id);
                      handleRevModal();
                    }}
                  >
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          </div>

          {isDivVisible && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="mb-4">
                <p className="text-base font-semibold text-gray-800">
                  Delivery Details
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-8 gap-2 mb-4">
                <div className="flex items-center">
                  <p className="text-sm text-gray-600 mr-2">
                    Expected Delivery Date:
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {orderTracking.expected_delivery_date}
                  </p>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-gray-600 mr-2">Tracking ID:</p>
                  <p className="text-sm font-medium text-gray-800">
                    {orderTracking.tracking_id}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-base font-semibold text-gray-800">
                  Order Status
                </p>
              </div>

              <div className="hidden sm:flex justify-between mb-4">
                {[
                  {
                    icon: AAA,
                    label: "Order placed",
                    date: orderTracking.date,
                  },
                  {
                    icon: BBB,
                    label: "In Progress",
                    date: inProgressOrder
                      ? new Date(inProgressOrder.changed_at).toLocaleString()
                      : "Not available",
                  },
                  {
                    icon: CCC,
                    label: "Shipped",
                    date: shippedOrder
                      ? new Date(shippedOrder.changed_at).toLocaleString()
                      : "Not available",
                  },
                  {
                    icon: DDD,
                    label: "Delivered",
                    date: deliveredOrder
                      ? new Date(deliveredOrder.changed_at).toLocaleString()
                      : "Not available",
                  },
                ].map((step, index) => (
                  <div key={index} className="flex items-center">
                    <Image src={step.icon} alt="" className="w-8 h-8 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-600">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="sm:hidden space-y-4">
                {[
                  {
                    icon: AAA,
                    label: "Order placed",
                    date: orderTracking.date,
                    status: true,
                  },
                  {
                    icon: BBB,
                    label: "In Progress",
                    date: inProgressOrder
                      ? new Date(inProgressOrder.changed_at).toLocaleString()
                      : "Not available",
                    status: inProgressOrder,
                  },
                  {
                    icon: CCC,
                    label: "Shipped",
                    date: shippedOrder
                      ? new Date(shippedOrder.changed_at).toLocaleString()
                      : "Not available",
                    status: shippedOrder,
                  },
                  {
                    icon: DDD,
                    label: "Delivered",
                    date: deliveredOrder
                      ? new Date(deliveredOrder.changed_at).toLocaleString()
                      : "Not available",
                    status: deliveredOrder,
                  },
                ].map((step, index, array) => (
                  <div key={index} className="flex">
                    <div className="mr-3 flex flex-col items-center">
                      <FaCheckCircle
                        className={`h-6 w-6 ${
                          step.status ? "text-red-500" : "text-gray-300"
                        }`}
                      />
                      {index < array.length - 1 && (
                        <div
                          className={`h-full w-0.5 ${
                            array[index + 1].status
                              ? "bg-red-500"
                              : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex items-center">
                      <Image src={step.icon} alt="" className="w-8 h-8 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {step.label}
                        </p>
                        <p className="text-xs text-gray-600">{step.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      <CustomModal showModal={isModalVisible}>
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
          <div className="flex flex-col items-center text-center">
            <Image
              src={close}
              alt="close"
              className="h-24 w-24 text-red-500 mb-6"
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Cancel Order
            </h2>
            <p className="text-base text-gray-600 mb-6">
              Are you sure you want to cancel the order?
            </p>
            <div className="flex gap-4">
              <button
                className="px-6 py-2 bg-gray-200 rounded-md text-gray-800 font-medium hover:bg-gray-300 transition-colors duration-300"
                onClick={() => setIsModalVisible(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-red-500 rounded-md text-white font-medium hover:bg-red-600 transition-colors duration-300"
                onClick={handleOrderCancel}
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      </CustomModal>
      <CustomModal showModal={showleave}>
        <div className="flex-col justify-center w-[400px]">
          <div className="w-full rounded-[20px] p-[24px] bg-white shadow-lg">
            <h2 className="text-[24px] font-semibold text-gray-800 mb-4">
              Write a Review
            </h2>
            <h3 className="text-[16px] font-medium text-gray-700 mb-2">
              Rate the Product
            </h3>
            <Rating
              name="product-rating"
              defaultValue={5}
              value={rating}
              onChange={(_, val) => setRating(val as number)}
              sx={{
                "& .MuiSvgIcon-root": {
                  fontSize: 32,
                },
              }}
            />

            <div className="mt-4">
              <label className="text-[14px] font-medium text-gray-600 block mb-1">
                Your Review
              </label>
              <textarea
                onChange={(e) => setComment(e.target.value)}
                className="border border-gray-300 w-full rounded-md h-[80px] p-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Share your thoughts..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
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
              <div className="w-[60px] h-[60px] border-2 rounded-lg border-red-500 flex justify-center items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                />
                <PiCameraThin
                  className="h-[36px] w-[36px] text-red-500 cursor-pointer"
                  onClick={handleIconClick}
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="bg-red-600 hover:bg-red-700 rounded-lg px-4 py-2 text-[14px] font-medium text-white transition duration-300"
                onClick={revSubHandler}
              >
                Submit Review
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-300 rounded-lg px-4 py-2 text-[14px] font-medium text-gray-800 transition duration-300"
                onClick={handleRevModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default MyorderCard;
