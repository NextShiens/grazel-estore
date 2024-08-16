"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Radio } from "@mui/material";
import { toast } from "react-toastify";
import { FiEdit } from "react-icons/fi";
import { MdClose, MdOutlineAddToPhotos, MdOutlineDeleteOutline } from "react-icons/md";
import { SlLocationPin } from "react-icons/sl";
import { AiOutlineDelete } from "react-icons/ai";
import Home from "@/assets/Vectorhome.png";
import {
  getAddressApi,
  editAddressApi,
  createAddressApi,
  deleteAddressApi,
  setPrimaryAddressApi,
} from "@/apis";

export default function AddressPage() {
  const [addressId, setAddressId] = useState("");
  const [isPending, setPending] = useState(false);
  const [showAddress, setAddress] = useState(false);
  const [allAddress, setAllAddress] = useState<any>([]);
  const [indexDialog, setDialogIndex] = useState("");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await getAddressApi();
      setAllAddress(res?.data?.addresses || []);
    })();
  }, []);

  const onShowDialog = (i: any) => setDialogIndex(i);
  const onChangeAddress = (id: any) => {
    setDialogIndex("");
    setAddressId(id);
  };

  const onCreateAddress = async (event) => {
    event.preventDefault();
    try {
      
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Please login to continue");
      setPending(true);

      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData);
      console.log('Form data:', data);

      const res = await createAddressApi(data, token);
      setAllAddress([...allAddress, res?.data?.address]);
      toast.success("Address has been created");
      setAddress(false); // Close the form after successful submission
    } catch (error) {
      console.error('Error creating address:', error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setPending(false);
    }
  };
  const onEditAddress = async (id: any) => {
    try {
      setPending(true);
      await setPrimaryAddressApi(id);
      toast.success("Primary address selected");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      onShowDialog("");
      setPending(false);
    }
  };

  const onDeleteAddress = async (id: any) => {
    if (!id) return toast.error("Please select the address");
    try {
      setPending(true);
      await deleteAddressApi(id);
      setAllAddress(allAddress.filter((item: any) => item.id !== id));
      toast.success("Address has been deleted");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setPending(false);
    }
  };

  const onCheckout = () => {
    if (!addressId) return toast.error("Please select address");
    router.push(`/PaymentAndAddress?addressId=${addressId}`);
  };

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Shipping Address</h1>
        <p className="text-lg text-gray-600">({allAddress?.length} addresses)</p>
      </div>

      <div className="space-y-4">
        {allAddress?.map((item: any, index: any) => (
          <div key={item.id} className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-lg font-medium">{item?.address_label?.toUpperCase()}</p>
              <Radio
                checked={addressId === item?.id}
                onChange={() => onChangeAddress(item?.id)}
                sx={{
                  color: "#F70000",
                  "&.Mui-checked": { color: "#F70000" },
                }}
              />
            </div>

            <div className="flex items-start">
              <Image src={Home} alt="" className="w-6 h-6 mt-1 mr-3" />
              <div>
                <p className="font-semibold">{item?.recipient_name} <span className="text-sm font-normal text-gray-600">({item?.recipient_phone})</span></p>
                <p className="text-sm text-gray-600 mt-1">{item?.address}</p>
              </div>
            </div>

            <div className="flex justify-end mt-3 space-x-2">
              <button
                onClick={() => onShowDialog(index)}
                className="p-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors duration-200"
              >
                <FiEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onShowDialog(index)}
                className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors duration-200"
              >
                <MdOutlineDeleteOutline className="w-4 h-4" />
              </button>

              {indexDialog === index && (
                <div className="absolute mt-2 p-3 bg-white rounded-md shadow-lg">
                  <button onClick={() => onEditAddress(item?.id)} className="flex items-center text-gray-600 hover:text-gray-800 mb-2">
                    <SlLocationPin className="mr-2" /> Set as primary address
                  </button>
                  <button onClick={() => onDeleteAddress(item?.id)} className="flex items-center text-gray-600 hover:text-gray-800">
                    <AiOutlineDelete className="mr-2" /> Delete address
                  </button>
                  <MdClose className="absolute top-2 right-2 cursor-pointer" onClick={() => setDialogIndex("")} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={() => setAddress((prev) => !prev)}
          className="flex items-center text-lg font-semibold text-gray-800 hover:text-gray-600 mb-4"
        >
          <MdOutlineAddToPhotos className="mr-2" /> Add New Delivery Address
        </button>

        <button
          disabled={isPending || !addressId}
          onClick={onCheckout}
          className="w-full bg-red-600 text-white py-3 rounded-md font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-red-700"
        >
          Proceed to Checkout
        </button>
      </div>

      {showAddress && (
        <form onSubmit={onCreateAddress} className="mt-8 bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                name="recipient_name"
                required
                placeholder="Enter Your Name"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address Title</label>
              <input
                name="address_label"
                required
                placeholder="Address Title e.g Home/Office etc"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Street Address</label>
              <input
                name="address"
                required
                placeholder="Address"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                name="recipient_phone"
                required
                placeholder="Phone Number"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Note</label>
              <input
                name="note"
                placeholder="Note"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="mt-6 w-full bg-red-600 text-white py-3 rounded-md font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-red-700"
          >
            Add Address
          </button>
        </form>
      )}
    </div>
  );
}