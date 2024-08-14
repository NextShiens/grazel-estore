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
  editAddressApi,
  ccavCheckoutApi,
  ccavResponseApi,
  phonePeInitiatePaymentApi,
  phonePeCheckStatusApi,
  getAddressByIdApi,
  placeOrderApi,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Order Confirmation</h3>
        </div>
        <div className="px-6 py-4">
          {children}
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
          {/* <button
            className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={onClose}
          >
            Confirm
          </button> */}
        </div>
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
  const [otherFields, setOtherFields] = useState({});
  const [addressDetail, setAddressDetail] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showSendModel, setShowSendModel] = useState(false);
  const cartProducts = useSelector((state) => state.cartProducts);
  const cartTotal = useSelector((state) => state.cartTotal);
  const cartDiscount = useSelector((state) => state.cartDiscount);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const addressId = searchParams.get("addressId");
    if (!addressId) return router.back();
    !cartProducts.length && dispatch(updateCart({ type: "onRefresh" }));
    (async () => {
      const { data } = await getAddressByIdApi(addressId);
      setAddressDetail(data?.address);
    })();
  }, []);

  const handleCloseModel = () => {
    router.push("/");
    setShowSendModel(false);
  };

  async function onEditAddress(formdata) {
    const addressId = searchParams.get("addressId");
    if (!addressId) return;
    try {
      setPending(true);
      const { data } = await editAddressApi(formdata, addressId);
      setAddressDetail(data?.address);
      toast.success("Address updated successfully");
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

  function onChangeFields(e) {
    const { name, value } = e.target;
    setOtherFields((prev) => ({ ...prev, [name]: value }));
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.push("/");
  };

  async function onPayment(e) {
    e.preventDefault();
    setLoading(true);

    const formdata = new FormData();
    const productIds = cartProducts.map((item) => item.id);
    const productQty = cartProducts.map((item) => item.qty);
    const prices = cartProducts.map((item) => item.discountPrice);

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

      if (paymentMethod === "creditcard") {
        await handleCCAvenue();
      } else if (paymentMethod === "phonepe") {
        await handlePhonePe();
      } else if (paymentMethod === "cod") {
        handleCOD(formdata);
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

  const handleCCAvenue = async () => {
    const formdata = new FormData();
    formdata.append("order_id", generateRandomOrderId());
    formdata.append("amount", cartTotal.toString());
    formdata.append("redirect_url", `${window.location.origin}/payment-success`);
    formdata.append("cancel_url", `${window.location.origin}/payment-failure`);
    formdata.append("currency", "INR");

    try {
      const checkOutResponse = await ccavCheckoutApi(formdata);
      console.info("CCAvenue payment initiation response:", checkOutResponse);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = checkOutResponse.data.ccavenueUrl;

      const encRequestInput = document.createElement('input');
      encRequestInput.type = 'hidden';
      encRequestInput.name = 'encRequest';
      encRequestInput.value = checkOutResponse.data.encRequest;
      form.appendChild(encRequestInput);

      const accessCodeInput = document.createElement('input');
      accessCodeInput.type = 'hidden';
      accessCodeInput.name = 'access_code';
      accessCodeInput.value = checkOutResponse.data.accessCode;
      form.appendChild(accessCodeInput);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      toast.success("Redirecting to payment gateway...");
    } catch (error) {
      console.error("CCAvenue payment initiation failed:", error);
      toast.error("Failed to initiate CCAvenue payment");
    }
  };

  const handlePhonePe = async () => {
    try {
      const formData = new FormData();
      formData.append("user_id", String(otherFields.username || "14"));
      formData.append("amount", String(cartTotal));
      formData.append("redirect_url", `${window.location.origin}/payment-success`);
      formData.append("redirect_mode", "REDIRECT");

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

  const handleCOD = async (formdata) => {
    try {
      const { data } = await placeOrderApi(formdata);
      if (data.message === "Order Placed Successfully") {
        setShowSuccessModal(true);
        dispatch(clearCart());
        toast.success("Order placed successfully");
      } else {
        toast.error("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing COD order:", error);
      toast.error("An error occurred while placing the order");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
      <div className="flex flex-wrap -mx-4">
        <div className="w-full lg:w-2/3 px-4 mb-8 lg:mb-0">
          <form onSubmit={onEditAddress} className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-6">
              <IoLocationOutline className="text-gray-500 text-2xl mr-3" />
              <h2 className="text-2xl font-semibold">Shipping Address</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  name="recipient_name"
                  defaultValue={addressDetail?.recipient_name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  name="address_label"
                  defaultValue={addressDetail?.address_label}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                name="address"
                defaultValue={addressDetail?.address}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  name="recipient_phone"
                  defaultValue={addressDetail?.recipient_phone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <input
                  name="note"
                  defaultValue={addressDetail?.note}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap -mx-2">
              <div className="w-full md:w-auto px-2 mb-4 md:mb-0">
                <button
                  type="button"
                  disabled={isPending}
                  className="w-full md:w-auto px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Cancel
                </button>
              </div>
              <div className="w-full md:w-auto px-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full md:w-auto px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-300"
                >
                  Use this Address
                </button>
              </div>
            </div>
          </form>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            {delivery ? (
              <div className="flex items-center">
                <MdKeyboardArrowLeft
                  size={22}
                  onClick={() => setDelivery(false)}
                  className="cursor-pointer mr-2"
                />
                <Image
                  src={FedEx}
                  alt="Delivery"
                  className="w-auto h-6 mr-2"
                />
                <p className="text-lg font-medium">FedEx Company</p>
              </div>
            ) : (
              <div
                onClick={() => setDelivery(true)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center">
                  <Image
                    src={Delivery}
                    alt="Delivery"
                    className="w-8 h-6 mr-2"
                  />
                  <p className="text-lg font-medium">Delivery Partner</p>
                </div>
                <MdKeyboardArrowRight size={22} />
              </div>
            )}
          </div>

          <form onSubmit={onPayment} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <Image src={card} alt="Card" className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-semibold">All Payment Options</h2>
            </div>

            <div
              onClick={() => setPaymentMethod("creditcard")}
              className={`flex items-center justify-between p-4 border rounded-lg mb-4 cursor-pointer transition-colors ${paymentMethod === "creditcard" ? "border-red-500 bg-red-50" : "border-gray-300 hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center">
                <p className="text-lg font-medium text-blue-600 mr-2">CC</p>
                <p className="font-medium">Avenue</p>
              </div>
              <Radio
                checked={paymentMethod === "creditcard"}
                sx={{
                  color: "#F70000",
                  '&.Mui-checked': {
                    color: "#F70000",
                  },
                }}
              />
            </div>

            <div
              onClick={() => setPaymentMethod("phonepe")}
              className={`flex items-center justify-between p-4 border rounded-lg mb-4 cursor-pointer transition-colors ${paymentMethod === "phonepe" ? "border-red-500 bg-red-50" : "border-gray-300 hover:bg-gray-50"
                }`}
            >
              <p className="text-lg font-medium text-purple-600">PhonePe</p>
              <Radio
                checked={paymentMethod === "phonepe"}
                sx={{
                  color: "#F70000",
                  '&.Mui-checked': {
                    color: "#F70000",
                  },
                }}
              />
            </div>

            <div
              onClick={() => setPaymentMethod("cod")}
              className={`flex items-center justify-between p-4 border rounded-lg mb-4 cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-red-500 bg-red-50" : "border-gray-300 hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center">
                <p className="font-medium mr-2">Cash on Delivery</p>
                <Image src={Cash} alt="Cash" className="w-10 h-7" />
              </div>
              <Radio
                checked={paymentMethod === "cod"}
                sx={{
                  color: "#F70000",
                  '&.Mui-checked': {
                    color: "#F70000",
                  },
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !agreedTerms || paymentMethod === ""}
              className="w-full py-3 bg-red-600 text-white rounded-md font-medium text-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500 mt-6"
            >
              {paymentMethod === "cod" ? (
                "Place Order"
              ) : (
                <>Pay ₹{cartTotal.toFixed(0)}</>
              )}
              {loading && <BiLoader className="inline-block ml-2 animate-spin" />}
            </button>

            <div className="mt-4 flex items-center">
              <Checkbox
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                sx={{
                  color: "#FF8A1D",
                  '&.Mui-checked': {
                    color: "#FF8A1D",
                  },
                }}
              />
              <p className="text-sm text-gray-600">
                By clicking, I agree to all terms of services and{' '}
                <span
                  className="text-blue-500 cursor-pointer hover:underline"
                  onClick={() => router.push('/Terms&Conditions')}
                >
                  Privacy & Policy
                </span>.
              </p>
            </div>
          </form>
        </div>

        <div className="w-full lg:w-1/3 px-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-sm font-medium text-gray-600 mb-4">
              We will contact you to confirm order
            </p>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Name"
              name="username"
              onChange={onChangeFields}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-base font-medium text-gray-600 mb-4">
              Have a Coupon
            </p>
            <div className="relative">
              <input
                name="coupon_code"
                onChange={onChangeFields}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 pr-20"
                placeholder="Add Coupon"
              />
              <button
                onClick={() => toast.success("Coupon Added")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white px-4 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            {cartProducts?.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Badge badgeContent={item.qty} color="primary" className="mr-3">
                    {item.featured_image ? (
                      <Image
                        src={item.featured_image}
                        height={50}
                        width={50}
                        alt={item.title}
                        className="rounded-md"
                      />
                    ) : (
                      <div className="w-[50px] h-[50px] flex items-center justify-center bg-gray-200 rounded-md">
                        <span className="text-xs text-gray-500">No Image</span>
                      </div>
                    )}
                  </Badge>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                  </div>
                </div>
                <p className="font-medium">₹{Number(item.discountPrice * item.qty).toFixed(0)}</p>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Subtotal</p>
                <p className="font-medium">₹{Number(cartTotal).toFixed(0)}</p>
              </div>
              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Shipping</p>
                <p className="font-medium">Free</p>
              </div>
              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Discount</p>
                <p className="font-medium">₹{Number(cartDiscount).toFixed(0)}</p>
              </div>
              <div className="flex justify-between font-semibold text-lg mt-4">
                <p>Total</p>
                <p>₹{(cartTotal).toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomModal isOpen={showSuccessModal} onClose={handleCloseSuccessModal}>
        <div className="flex flex-col items-center">
          <div className="mb-4 text-center">
            <FaCircleCheck className="text-red-600 h-16 w-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600">
              We'll send a confirmation email to you shortly.
            </p>
          </div>
          <button
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={handleCloseSuccessModal}
          >
            Back to Home
          </button>
        </div>
      </CustomModal>
    </div>
  );
}