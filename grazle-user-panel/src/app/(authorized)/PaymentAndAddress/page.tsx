"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { toast } from "react-toastify";
import { Badge, Checkbox, Radio } from "@mui/material";
import { BiLoader } from "react-icons/bi";
import { FaCircleCheck } from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";

import {
  getProfileApi,
  placeOrderApi,
  editAddressApi,
  ccavCheckoutApi,
  ccavResponseApi,
  phonePeInitiatePaymentApi,
  phonePeCheckStatusApi,
  getAddressByIdApi,
} from "@/apis";
import { updateCart, clearCart } from "@/features/features";


import FedEx from "@/assets/image 9.png";
import Cash from "@/assets/image 12.png";
import visa from "@/assets/pngwing 7.png";
import Dots from "@/assets/Group 1820549907.png";
import card from "@/assets/credit-card (3) 1.png";
import Delivery from "@/assets/Group 1820549945.png";
import axios from "axios";
const CustomModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        {children}
        <button
          className="mt-4 bg-gray-200 text-gray-800 px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};
export default function PaymentAndAddress() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState(false);
  const [isPending, setPending] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [otherFields, setOtherFields] = useState({});
  const [addressDetail, setAddressDetail] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showSendModel, setShowSendModel] = useState(false);
  const cartProducts = useSelector((state: any) => state.cartProducts);
  const cartTotal = useSelector((state: any) => state.cartTotal);
  const cartDiscount = useSelector((state: any) => state.cartDiscount);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [creditCardData, setCreditCardData] = useState({
    cardType: "Credit Card",
    cardName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    nameOfCard: "",
  });

  useEffect(() => {
    const addressId = searchParams.get("addressId");
    if (!addressId) return router.back();
    !cartProducts.length && dispatch(updateCart({ type: "onRefresh" }));
    (async () => {
      const { data } = await getAddressByIdApi(addressId);
      setAddressDetail(data?.address);
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreditCardData({
      ...creditCardData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCloseModel = () => {
    router.push("/");
    setShowSendModel(false);
  };

  async function onEditAddress(formdata: FormData) {
    const addressId = searchParams.get("addressId");
    if (!addressId) return;
    try {
      setPending(true);
      const { data } = await editAddressApi(formdata, addressId);
      setAddressDetail(data?.address);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update address");
    } finally {
      setTimeout(() => {
        setPending(false);
      }, 500);
    }
  }

  const generateRandomTransactionId = () => {
    return "trx_" + Math.random().toString(36).substr(2, 9);
  };

  function onChangeFields(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setOtherFields((prev) => ({ ...prev, [name]: value }));
  }

  async function onPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);


    const formdata = new FormData();
    const productIds = cartProducts.map((item: any) => item.id);
    const productQty = cartProducts.map((item: any) => item.qty);
    const prices = cartProducts.map((item: any) => item.discountPrice);

    try {
      const addressId = searchParams.get("addressId");
      if (!addressId || !paymentMethod || !productQty.length || !productIds.length) {
        toast.error("Missing address / payment method / product detail");
        setLoading(false);
        return;
      }

      formdata.append("address_id", addressId);
      formdata.append("payment_type", paymentMethod);
      const transactionId = otherFields?.transaction_id || generateRandomTransactionId();

      formdata.append("quantities", productQty.join(','));
      formdata.append("coupon_code", otherFields?.coupon_code || '');
      formdata.append("discount", otherFields?.discount || '0');
      formdata.append("payment", "notpaid");
      formdata.append("transaction_id", transactionId);
      formdata.append("product_ids", productIds.join(','));
      formdata.append("prices", prices.join(','));

      // const { data } = await placeOrderApi(formdata);


      if (paymentMethod === "creditcard") {
        await handleCCAvenue();
      } else if (paymentMethod === "phonepe") {
        await handlePhonePe();
      } else if (paymentMethod === "cod") {
        handleCOD();
      }

    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  const generateRandomOrderId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    return `ORD-${timestamp}-${randomNum}`;
  };
  const handleCCAvenue = async (orderId: string) => {
    const formdata = new FormData();
    formdata.append("order_id", generateRandomOrderId());
    formdata.append("amount", cartTotal.toString());
    formdata.append("redirect_url", `${window.location.origin}/payment-success`);
    formdata.append("cancel_url", `${window.location.origin}/payment-failure`);
    formdata.append("currency", "INR");

    try {
      const checkOutResponse = await ccavCheckoutApi(formdata);
      console.info("CCAvenue payment initiation response:", checkOutResponse);

      if (!checkOutResponse.data.encRequest || !checkOutResponse.data.accessCode || !checkOutResponse.data.ccavenueUrl) {
        throw new Error("Missing required data from checkout response");
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = checkOutResponse.data.ccavenueUrl;

      const encRequestInput = document.createElement('input');
      encRequestInput.type = 'hidden';
      encRequestInput.name = 'encReq';
      encRequestInput.value = checkOutResponse.data.encRequest;
      form.appendChild(encRequestInput);

      const accessCodeInput = document.createElement('input');
      accessCodeInput.type = 'hidden';
      accessCodeInput.name = 'access_code';
      accessCodeInput.value = checkOutResponse.data.accessCode;
      form.appendChild(accessCodeInput);

      console.log("Form data:", {
        action: form.action,
        encReq: encRequestInput.value,
        access_code: accessCodeInput.value
      });

      document.body.appendChild(form);

      // Add an event listener for form submission errors
      form.addEventListener('submit', (event) => {
        if (event.submitter !== form) {
          console.error("Form submission intercepted or failed");
          toast.error("Payment initiation failed. Please try again.");
        }
      });

      form.submit();

      document.body.removeChild(form);

      toast.info("Redirecting to payment gateway...");
    } catch (error) {
      console.error("CCAvenue payment initiation failed:", error);
      toast.error("Failed to initiate CCAvenue payment. Please try again later.");
    }
  };
  const handlePhonePe = async (orderId: string) => {


    try {
      const formData = new FormData();
      formData.append("user_id", String(otherFields.username || "14"));
      formData.append("amount", String(cartTotal));
      formData.append("redirect_url", `${window.location.origin}/payment-success`);
      formData.append("redirect_mode", "REDIRECT");

      // Debugging: Log the form data
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await axios.post("https://api.grazle.co.in/api/phonepe/initiate-payment", formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success("Payment initiated");
        dispatch(clearCart());
        router.replace(response.data.data.payment_url);
      } else {
        toast.error("Failed to initiate payment");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("An error occurred while initiating payment");
    }
  };

  const handleCOD = () => {
    setShowSendModel(true);
    dispatch(clearCart());
  };

  return (
    <>
      <div className="lg:my-[50px] my-[20px] sm:my-[20px] md:my-[30px] lg:mx-[150px] mx-[10px] sm:mx-[10px] md:mx-[30px] flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-start gap-8">
        <div className="lg:w-[70%] w-[100%] sm:w-[100%] md:w-[100%] rounded-3xl p-[20px]">
          <form
            onSubmit={onEditAddress}
            style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
            className="w-[100%] rounded-3xl p-[20px]"
          >
            <div className="flex items-center">
              <IoLocationOutline color="#777777" className="md:size-10 size-7 mr-3" />
              <p className="md:text-[40px] text-lg font-medium">Shipping Address</p>
            </div>

            <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center gap-4 mt-6">
              <div className="flex-col ">
                <label className="text-[16px] font-normal text-[#777777]">
                  First Name
                </label>
                <input
                  name="recipient_name"
                  defaultValue={addressDetail?.recipient_name}
                  className="border-[1px] mt-[9px] border-[#777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                />
              </div>

              <div className="flex-col ">
                <label className="text-[16px] font-normal text-[#777777]">
                  Last Name
                </label>

                <input
                  name="address_label"
                  defaultValue={addressDetail?.address_label}
                  className="border-[1px] mt-[9px] border-[#777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-col mt-6">
              <label className="text-[16px] font-normal text-[#777777]">
                Street Address
              </label>
              <input
                name="address"
                defaultValue={addressDetail?.address}
                className="border-[1px] mt-[9px] border-[#777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center gap-4 mt-6">
              <div className="flex-col ">
                <label className="text-[16px] font-normal text-[#777777]">
                  Phone
                </label>
                <input
                  name="recipient_phone"
                  defaultValue={addressDetail?.recipient_phone}
                  className="border-[1px] mt-[9px] border-[#777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                />
              </div>

              <div className="flex-col">
                <label className="text-[16px] font-normal text-[#777777]">
                  Note
                </label>
                <input
                  name="note"
                  defaultValue={addressDetail?.note}
                  className="border-[1px] mt-[9px] border-[#777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-7 flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center">
              <button
                type="button"
                disabled={isPending}
                className="lg:mr-4 mr-0 disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none bg-[#D2D4DA] rounded-md h-[50px] lg:w-[150px] w-[100%] sm:w-[100%] text-[18px] font-medium text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-[#F70000] disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none mt-4 lg:mt-0 rounded-md h-[50px] lg:w-[210px] w-[100%] sm:w-[100%] text-[18px] font-medium text-white"
              >
                Use this Address
              </button>
            </div>
          </form>

          <div
            style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
            className="w-[100%] rounded-3xl p-[20px] mt-4 "
          >
            {delivery ? (
              <div className="flex items-center gap-2 mt-2">
                <MdKeyboardArrowLeft
                  size={22}
                  onClick={() => setDelivery(false)}
                  className="cursor-pointer"
                />
                <div
                  onClick={() => setDelivery(false)}
                  className="flex items-center gap-2 mt-2"
                >
                  <Image
                    src={FedEx}
                    alt="Delivery"
                    className="w-auto h-[25px]"
                  />
                  <p className="md:text-lg text-base font-medium ">
                    FedEx Company
                  </p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setDelivery(true)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={Delivery}
                    alt="Delivery"
                    className="w-[35px] h-[25px]"
                  />
                  <p className="md:text-lg text-base font-medium ">
                    Delivery Partner
                  </p>
                </div>

                <MdKeyboardArrowRight size={22} />
              </div>
            )}
          </div>

          {/* Payment method form */}
          <form
            onSubmit={onPayment}
            style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
            className="w-[100%] rounded-3xl p-[20px] mt-4"
          >
            <div className="flex items-center gap-2 mt-2">
              <Image src={card} alt="Card" className="w-[30px] h-[30px] mr-2" />
              <p className="lg:text-[30px] text-[20px] sm:text-[24px] font-medium">
                All Payment Options
              </p>
            </div>

            {/* Payment options */}
            <div
              onClick={() => setPaymentMethod("creditcard")}
              className={`border-[1px] mt-4 p-3 flex items-center justify-between rounded-xl w-full ${paymentMethod === "creditcard" ? "border-[#F70000]" : "border-[#777777]"
                }`}
            >
              <div className="flex items-center gap-2">
                <p className="text-lg text-[#2284b5] font-medium ml-2">CC</p>
                <p className="font-medium">Avenue</p>
              </div>
              <Radio
                sx={{
                  color: "#F70000",
                  "& .MuiSvgIcon-root": { fontSize: 24 },
                  "&.Mui-checked": { color: "#F70000" },
                }}
                checked={paymentMethod === "creditcard"}
              />
            </div>

            <div
              onClick={() => setPaymentMethod("phonepe")}
              className={`border-[1px] mt-4 p-3 flex items-center justify-between rounded-xl w-full ${paymentMethod === "phonepe" ? "border-[#F70000]" : "border-[#777777]"
                }`}
            >
              <div className="flex items-center gap-2"
              >
                <p className="text-lg text-[#5f259f] font-medium ml-2">PhonePe</p>
              </div>
              <Radio
                sx={{
                  color: "#F70000",
                  "& .MuiSvgIcon-root": { fontSize: 24 },
                  "&.Mui-checked": { color: "#F70000" },
                }}
                checked={paymentMethod === "phonepe"}
              />
            </div>

            <div
              onClick={() => setPaymentMethod("cod")}

              className={`border-[1px] mt-4 p-3 flex items-center justify-between rounded-xl w-full ${paymentMethod === "cod" ? "border-[#F70000]" : "border-[#777777]"
                }`}
            >
              <div className="flex items-center">
                <Radio
                  sx={{
                    color: "#F70000",
                    "& .MuiSvgIcon-root": { fontSize: 24 },
                    "&.Mui-checked": { color: "#F70000" },
                  }}
                  checked={paymentMethod === "cod"}
                />
                <p className="">Cash on Delivery</p>
              </div>
              <Image src={Cash} alt="Cash" className="w-[43px] h-[30px] mr-2" />
            </div>


            <button
              type="submit"
              disabled={isPending || !agreedTerms || paymentMethod === ""}
              className="mt-10 bg-[#F70000] disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none rounded-md h-[50px] w-[100%] text-[18px] font-medium text-white"
            >
              {paymentMethod === "cod" ? (
                "Place Order"
              ) : (
                <>Pay ₹{cartTotal.toFixed(0)}</>
              )}
              {loading && <BiLoader className="animate-spin h-6 w-6 ml-4 inline" />}
            </button>

            <div className="mt-3 flex items-center">
              <Checkbox
                sx={{
                  color: "#FF8A1D",
                  "& .MuiSvgIcon-root": { fontSize: 24 },
                  "&.Mui-checked": { color: "#FF8A1D" },
                }}
                onChange={(e) => setAgreedTerms(e.target.checked)}
              />
              <p className="text-black font-normal text-sm">
                By clicking, I agree to all terms of services and{' '}
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={() => router.push('/Terms&Conditions')}
                >
                  Privacy & Policy
                </span>.
              </p>
            </div>
          </form>
        </div>

        {/* Cart Summary */}
        <div className="lg:w-[30%] w-[100%] sm:w-[100%] md:w-[100%] h-auto">
          <div
            style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
            className="w-full rounded-3xl p-5"
          >
            <p className="text-sm font-medium text-[#777777]">
              We will contact you to confirm order
            </p>
            <input
              className="border-[1px] mt-4 border-[#0000061] w-full rounded-xl h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
              placeholder="Name"
              name="username"
              onChange={onChangeFields}
            />
          </div>

          <div
            style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
            className="w-full rounded-3xl p-5 mt-5 relative"
          >
            <p className="text-[16px] font-medium text-[#777777]">
              Have a Coupon
            </p>
            <button
              onClick={() => toast.success("Coupon Added")}
              className="absolute bg-[#F70000] right-8 top-[68px] rounded-md h-[35px] w-[70px] text-[18px] font-medium text-white"
            >
              Add
            </button>
            <input
              name="coupon_code"
              onChange={onChangeFields}
              className="border-[1px] mt-4 border-[#0000061] w-full rounded-xl h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
              placeholder="Add Coupon"
            />
          </div>

          <div
            style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
            className="w-full h-full rounded-3xl p-5 mt-5 relative"
          >
            {cartProducts?.map((item: any, index: number) => (
              <div
                key={item.id}
                className={`flex items-center justify-between ${index !== 0 ? "mt-[10px]" : "mt-[0px]"
                  } mb-[20px]`}
              >
                <div className="relative w-[90px] h-[90px] mr-2">
                  <Badge
                    badgeContent={item.qty}
                    color="primary"
                    className="mr-3"
                  >
                    {item.featured_image ? (
                      <Image
                        src={item.featured_image}
                        height={50}
                        width={50}
                        alt={item.title}
                        className="rounded-2xl w-full h-full"
                      />
                    ) : (
                      <div className="w-[50px] h-[50px] flex items-center text-center justify-center bg-gray-200 rounded-xl">
                        <span className="text-xs text-gray-500">No Image</span>
                      </div>
                    )}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <p className="text-[16px] font-medium text-black mr-2">
                    {item.title}
                  </p>
                </div>
                <p className="text-[16px] font-medium text-[#777777]">
                  ₹{Number(item.discountPrice * item.qty).toFixed(0)}
                </p>
              </div>
            ))}

            <div className="mt-5 border-b-[1px] border-[#777777]"></div>
            <p className="text-[24px] font-medium text-black mt-2">
              Cart Total
            </p>
            <div className="flex items-center mt-4 justify-between">
              <p className="text-[18px] font-medium text-[#777777]">
                Cart Subtotal
              </p>
              <p className="text-[18px] font-bold text-[#777777]">
                ₹{Number(cartTotal).toFixed(0)}
              </p>
            </div>
            <div className="flex items-center mt-4 justify-between">
              <p className="text-[18px] font-medium text-[#777777]">Shipping</p>
              <p className="text-[18px] font-bold text-black">Free</p>
            </div>
            <div className="flex items-center mt-4 justify-between">
              <p className="text-[18px] font-medium text-[#777777]">Discount</p>
              <p className="text-[18px] font-bold text-black">
                ₹{Number(cartDiscount).toFixed(0)}
              </p>
            </div>
            <div className="my-5 border-b-[1px] border-[#777777]"></div>
            <div className="flex items-center mt-4 justify-between">
              <p className="text-[18px] font-bold text-black">Cart Total</p>
              <p className="text-[18px] font-bold text-[#777777]">
                ₹{(cartTotal).toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        <CustomModal showModal={showSendModel}>
          <div className="flex flex-col justify-center items-center w-full h-full">
            <div className="flex flex-col justify-center items-center w-full max-w-[400px] h-auto p-4 bg-white rounded-lg sm:max-h-[90vh] sm:overflow-y-auto">
              <div className="flex justify-center mb-[22px]">
                <Image src={Dots} alt="" className="h-[64px] w-[64px]" />
                <FaCircleCheck className="text-[#E24C4B] h-[105px] mx-[16px] w-[105px] sm:h-[80px] sm:w-[80px]" />
                <Image src={Dots} alt="" className="h-[64px] w-[64px]" />
              </div>
              <p className="mt-5 text-[32px] text-center font-semibold text-[#434343] sm:text-[24px]">
                Your order has been successfully placed
              </p>
              <p className="mt-3 text-[16px] text-center font-semibold text-[#434343] sm:text-[14px]">
                We will be sending you an email confirmation to your email
                shortly
              </p>
              <div className="flex mt-[30px] gap-4 justify-center">
                <button
                  className="bg-[#F69B26] rounded-lg h-[50px] w-[300px] text-white font-medium sm:h-[40px] sm:w-full"
                  onClick={handleCloseModel}
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </CustomModal>
      </div>
    </>
  );
}