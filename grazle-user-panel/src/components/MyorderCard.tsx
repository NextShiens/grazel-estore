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
    setShowCancelMap(prevState => ({
      ...prevState,
      [orderId]: !prevState[orderId]
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
        <>
          <div
            style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
            className="w-100 rounded-3xl p-6 mt-6 hover:border-[1px] border-[#F70000]"
          >
            <div className="flex items-center justify-between">
              <div className="border-[1px] border-[#777777] rounded-full w-fit px-4 py-2 flex items-center justify-center">
                <IoLockClosed className="w-[14px] h-[14px] mr-2" />
                <p className="md:text-[14px] text-[10px] font-normal text-[#777777]">
                  {order.date}
                </p>
              </div>

              {orderTracking?.status_history?.slice(-1)[0].status !==
                "cancelled" &&
                order.status !== "completed" && (
                  <div className="flex items-center justify-center">
                    {showCancelMap[order.id] && (
                      <>
                        <button
                          onClick={() => setIsModalVisible(true)}
                          className="hidden lg:flex items-center p-2 rounded-lg shadow-lg mr-3  cursor-pointer"
                        >
                          <IoCloseSharp className="text-[24px] text-[#FC0005] mr-4 cursor-pointer" />
                          <p className="text-[#FC0005] text-[16px] font-semibold">
                            Cancel Order
                          </p>
                        </button>

                        {/* <button
                          onClick={handleOrderCancel}
                          className="lg:hidden flex items-center p-2 rounded-lg shadow-lg mr-1 cursor-pointer"
                        >
                          <FaTrashAlt className="text-[12px] text-[#FC0005] mr-2 cursor-pointer" />
                          <p className="text-[#FC0005] text-[12px] font-semibold">
                            Cancel Order2
                          </p>
                        </button> */}
                      </>
                    )}
                    <div
                      onClick={() => toggleShowCancel(order.id)}
                      className="border-#00000017 border-[1px] rounded-md h-[30px] w-[30px] flex items-center justify-center"
                    >
                      <HiOutlineDotsVertical className="h-[15px] w-4 text-[#D9D9D9]" />
                    </div>
                  </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between mt-5">
              <div className="flex items-center">
                <div className="h-[100px] bg-[#F700000D] flex items-center justify-center w-[100px] rounded-2xl mr-5">
                  <Image
                    alt="Product Image"
                    width={70}
                    height={70}
                    src={prod.featured_image}
                    className="w-[100px] h-[100px] rounded-2xl"
                    onError={(e: any) => {
                      console.error("Image failed to load:", e);
                      e.target.src = "/path/to/fallback-image.jpg";
                    }}
                  />
                </div>
                <div>
                  <p className="text-[18px] font-medium">{prod.title} </p>

                  {/* <p className="text-[16px] text-[#777777] mt-3 font-medium">
                Size 10.5 UK
              </p> */}
                </div>
              </div>
              <p className="hidden lg:block lg:text-[20px] text-[18px] mt-3 lg:mt-0 sm:mt-3 md:mt-3 text-[#777777]  font-medium">
                Quantity {prod.quantity}
              </p>

              <p className="hidden lg:block lg:text-[20px] text-[18px] mt-3 lg:mt-0 sm:mt-3 md:mt-3 text-[#777777]  font-medium">
                Price:₹{" "}
                {prod.discounted_price
                  ? prod.discounted_price
                  : prod.price * prod.quantity}
              </p>

              <div className="lg:hidden flex flex-col mt-3 gap-2">
                <div className="flex items-center gap-2 font-medium text-[15px] text-[#777777]">
                  <span>Price:</span>
                  <p>
                    ₹{" "}
                    {prod.discounted_price
                      ? prod.discounted_price
                      : prod.price * prod.quantity}
                  </p>
                </div>

                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 font-medium text-[15px] text-[#777777]">
                    <span>Quantity</span>
                    <p>{prod.quantity}</p>
                  </div>

                  <div className="flex item-center gap-3">
                    <button
                      className="px-2 bg-[#00F7630F] rounded-2xl h-[40px] outline-[2px] 
                  outline-[#26F63B] outline-dashed w-fit text-[12px] font-medium text-[#07D459]"
                    >
                      {orderTracking?.status_history?.slice(-1)[0].status}
                    </button>
                    {orderTracking?.status_history?.slice(-1)[0].status !==
                      "completed" && (
                        <button
                          className="flex items-center justify-center gap-2 bg-[#FFFAF4] outline-[2px] outline-[#F69B26] outline-dashed rounded-2xl h-[40px] lg:w-[160px] w-fit text-[12px] font-medium text-[#F69B26] px-2"
                          onClick={handleButtonClick}
                        >
                          <span>Order Tracking</span>
                          {isDivVisible ? <IoIosArrowUp /> : <IoIosArrowDown />}
                        </button>
                      )}

                    {orderTracking?.status_history?.slice(-1)[0].status ===
                      "completed" && (
                        <button
                          className=" bg-[#FFFAF4] lg:mt-3 mt-0 outline-[2px] outline-[#F69B26] outline-dashed rounded-2xl h-[40px] lg:w-[181px] w-[130px] lg:w-[181px] sm:w-[100px]   lg:text-[18px] text-[14px] sm:text-[14px] font-medium text-[#F69B26]"
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

              <div className="hidden lg:block flex-col mt-3 lg:mt-0 sm:mt-3 md:mt-3 flex">
                <button className="bg-[#be8c8c0f] rounded-2xl h-[40px] outline-[2px] outline-[#F70000] outline-dashed lg:w-[160px] w-[300px] text-[15px] font-medium text-[#F70000]">
                  {orderTracking?.status_history?.slice(-1)[0].status ===
                    "cancelled"
                    ? "Cancelled"
                    : orderTracking?.status_history?.slice(-1)[0].status}
                </button>
                {orderTracking?.status_history?.slice(-1)[0].status !==
                  "completed" &&
                  orderTracking?.status_history?.slice(-1)[0].status !==
                  "cancelled" && (
                    <button
                      className="flex items-center justify-center gap-2 bg-[#FFFAF4] mt-3 
      outline-[2px] outline-[#F69B26] outline-dashed rounded-2xl h-[40px] 
      lg:w-[160px] w-[300px] text-[15px] font-medium text-[#F69B26]"
                      onClick={handleButtonClick}
                    >
                      <span>Order Tracking</span>
                      {isDivVisible ? <IoIosArrowUp /> : <IoIosArrowDown />}
                    </button>
                  )}

                {orderTracking?.status_history?.slice(-1)[0].status ===
                  "completed" && (
                    <button
                      className="bg-[#FFFAF4] rounded-2xl h-[40px] outline-[2px] outline-[#F69B26] outline-dashed lg:w-[160px] w-[300px] text-[15px] font-medium text-[#F69B26]"
                      style={{ marginLeft: "15px" }}
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

            {isDivVisible && (
              <>
                <div className="mt-4">
                  <p className="text-[16px] font-semibold">Delivery Details</p>
                </div>
                <div className="flex md:flex-row flex-col lg:gap-8 gap-2 sm:gap-2 mt-5">
                  <div className="flex items-center">
                    <p className="text-[14px] text-[#909198] font-normal">
                      Expected Delivery Date:
                    </p>
                    <p className="text-[14px]  sm:ml-7 lg:ml-7  ml-10 text-black font-semibold">
                      {orderTracking.expected_delivery_date}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <p className="text-[14px] text-[#909198] font-normal">
                      Tracking ID:
                    </p>
                    <p className="text-[14px] sm:ml-7 lg:ml-7  ml-10 text-black font-semibold">
                      {orderTracking.tracking_id}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[16px] font-semibold">Order Status</p>
                </div>
                <div className="lg:flex  sm:hidden md:hidden hidden  gap-8 mt-5">
                  <div className="flex items-center gap-4 lg:w-auto w-[100%] sm: w-[100%] md: w-[100%]">
                    <Image src={AAA} alt="" className="w-[32px] h-[32px]" />
                    <div>
                      <p className="text-[14px] text-black font-semibold">
                        Order placed
                      </p>
                      <p className="text-[14px] text-[#909198] font-normal">
                        {orderTracking.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Image src={BBB} alt="" className="w-[32px] h-[32px]" />
                    <div>
                      <p className="text-[14px] text-black font-semibold">
                        In Progress
                      </p>
                      <p className="text-[14px] text-[#909198] font-normal">
                        {inProgressOrder
                          ? new Date(
                            inProgressOrder.changed_at
                          ).toLocaleString()
                          : "Not available"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Image src={CCC} alt="" className="w-[32px] h-[32px]" />
                    <div>
                      <p className="text-[14px] text-black font-semibold">
                        Shipped
                      </p>
                      <p className="text-[14px] text-[#909198] font-normal">
                        {shippedOrder
                          ? new Date(shippedOrder.changed_at).toLocaleString()
                          : "Not available"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Image src={DDD} alt="" className="w-[32px] h-[32px]" />
                    <div>
                      <p className="text-[14px] text-black font-semibold">
                        Delivered
                      </p>
                      <p className="text-[14px] text-[#909198] font-normal">
                        {deliveredOrder
                          ? new Date(deliveredOrder.changed_at).toLocaleString()
                          : "Not available"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="lg:flex  sm:hidden md:hidden hidden items-center  gap-3 mt-5">
                  <FaCheckCircle className="text-[#F70000] h-[24px] w-[24px]" />
                  <div
                    className={`${inProgressOrder ? "border-[#F70000]" : "border-[#D2D4DA]"
                      } border-t-[2px] w-[200px] `}
                  />
                  <FaCheckCircle
                    className={`${inProgressOrder ? "text-[#F70000]" : "text-[#D2D4DA]"
                      } h-[24px] w-[24px]`}
                  />
                  <div
                    className={`${shippedOrder ? "border-[#F70000]" : "border-[#D2D4DA]"
                      } border-t-[2px] w-[200px] `}
                  />
                  <FaCheckCircle
                    className={`${shippedOrder ? "text-[#F70000]" : "text-[#D2D4DA]"
                      } h-[24px] w-[24px]`}
                  />
                  <div
                    className={`${deliveredOrder ? "border-[#F70000]" : "border-[#D2D4DA]"
                      } border-t-[2px] w-[200px] `}
                  />
                  <FaCheckCircle
                    className={`${deliveredOrder ? "text-[#F70000]" : "text-[#D2D4DA]"
                      } h-[24px] w-[24px]`}
                  />{" "}
                </div>

                <div className="mt-5 sm:block block lg:hidden">
                  <div className="flex gap-3 items-start">
                    <div className="mt-2 ">
                      <FaCheckCircle className="text-[#F70000] h-[24px] w-[24px]" />

                      <div
                        className={`${inProgressOrder
                          ? "border-[#F70000]"
                          : "border-[#D2D4DA]"
                          } ml-3 mt-2 border-l-[2px] h-[100px] `}
                      ></div>
                    </div>
                    <div className="flex items-center gap-4 lg:w-auto w-[100%] sm: w-[100%] md: w-[100%]">
                      <Image src={AAA} alt="" className="w-[32px] h-[32px]" />
                      <div>
                        <p className="text-[14px] text-black font-semibold">
                          Order placed
                        </p>
                        <p className="text-[14px] text-[#909198] font-normal">
                          {orderTracking.date}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="mt-2 ">
                      <FaCheckCircle
                        className={`${inProgressOrder ? "text-[#F70000]" : "text-[#D2D4DA]"
                          } h-[24px] w-[24px]`}
                      />{" "}
                      <div
                        className={`${shippedOrder ? "border-[#F70000]" : "border-[#D2D4DA]"
                          } ml-3 mt-2 border-l-[2px] h-[100px] `}
                      ></div>{" "}
                    </div>
                    <div className="flex items-center gap-4 lg:w-auto w-[100%] sm: w-[100%] md: w-[100%]">
                      <Image src={BBB} alt="" className="w-[32px] h-[32px]" />
                      <div>
                        <p className="text-[14px] text-black font-semibold">
                          In Progress
                        </p>
                        <p className="text-[14px] text-[#909198] font-normal">
                          {inProgressOrder
                            ? new Date(
                              inProgressOrder.changed_at
                            ).toLocaleString()
                            : "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="mt-2 ">
                      <FaCheckCircle
                        className={`${shippedOrder ? "text-[#F70000]" : "text-[#D2D4DA]"
                          } h-[24px] w-[24px]`}
                      />{" "}
                      <div
                        className={`${deliveredOrder
                          ? "border-[#F70000]"
                          : "border-[#D2D4DA]"
                          } ml-3 mt-2 border-l-[2px] h-[100px] `}
                      ></div>{" "}
                    </div>
                    <div className="flex items-center gap-4 lg:w-auto w-[100%] sm: w-[100%] md: w-[100%]">
                      <Image src={CCC} alt="" className="w-[32px] h-[32px]" />
                      <div>
                        <p className="text-[14px] text-black font-semibold">
                          Shipped
                        </p>
                        <p className="text-[14px] text-[#909198] font-normal">
                          {shippedOrder
                            ? new Date(shippedOrder.changed_at).toLocaleString()
                            : "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="mt-2 ">
                      <FaCheckCircle
                        className={`${deliveredOrder ? "text-[#F70000]" : "text-[#D2D4DA]"
                          } h-[24px] w-[24px]`}
                      />{" "}
                    </div>
                    <div className="flex items-center gap-4 lg:w-auto w-[100%] sm: w-[100%] md: w-[100%]">
                      <Image src={DDD} alt="" className="w-[32px] h-[32px]" />
                      <div>
                        <p className="text-[14px] text-black font-semibold">
                          Delivered
                        </p>
                        <p className="text-[14px] text-[#909198] font-normal">
                          {deliveredOrder
                            ? new Date(
                              deliveredOrder.changed_at
                            ).toLocaleString()
                            : "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <CustomModal showModal={isModalVisible}>
            <div className="md:w-[600px] w-[350px] my-[40px]">
              <div className="flex flex-col justify-center text-center md:px-0 px-3">
                <Image
                  src={close}
                  alt="close"
                  className="text-[#E13827] flex m-auto md:h-[162px] h-[100px] md:w-[162px] w-[100px]"
                />
                <p className="md:text-[32px] text-[20px] text-[#434343]  font-bold mt-6">
                  Cancel Order
                </p>
                <p className="md:text-[20px] text-[15px] text-[#434343]  font-medium mt-6">
                  Are you sure you want to cancel the order?
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <button
                    className=" bg-[#CFCFCF] rounded-md h-[50px]  w-[181px] text-[18px] font-medium text-white"
                    onClick={() => setIsModalVisible(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className=" bg-[#F70000]  rounded-md h-[50px]  w-[181px] text-[18px] font-medium text-white"
                    onClick={handleOrderCancel}
                  >
                    Yes
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
      ))}
    </>
  );
};

export default MyorderCard;
