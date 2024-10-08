"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import { updatePageLoader, updatePageNavigation } from "@/features/features";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

import { TfiEmail } from "react-icons/tfi";
import { BsTelephone } from "react-icons/bs";
import { GrLocation } from "react-icons/gr";
import { MdOutlineStorefront } from "react-icons/md";
import { HiOutlineCreditCard } from "react-icons/hi2";
import Loading from "@/components/loading";
import { axiosPrivate } from "@/axios";
import { toast } from "react-toastify";

const CreditLimit = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loggedIn, setLoggedIn] = useState(true);
  const [loginChecked, setLoginChecked] = useState(false);

  const getLocalStorage = (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

  const token = getLocalStorage("token");

  useEffect(() => {
    handleCheckLogin();
  }, []);

  const handleCheckLogin = () => {
    if (!token) {
      setLoggedIn(false);
      router.push("/");
    } else {
      setLoggedIn(true);
    }
    setLoginChecked(true);
  };

  useEffect(() => {
    if (loggedIn && loginChecked) {
      dispatch(updatePageLoader(false));
      dispatch(updatePageNavigation("credit-limit"));
      fetchCreditRequests();
    }
  }, [loggedIn, loginChecked, dispatch]);

  const fetchCreditRequests = async () => {
    if (!loggedIn) return;
    try {
      const { data } = await axiosPrivate.get("/admin/credit-limit-requests", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setRequests(data.request);
    } catch (error) {
      console.error("Error fetching credit requests:", error);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (!loggedIn) return;
    const validStatuses = ['completed', 'reject'];

    if (!validStatuses.includes(status)) {
      console.error("Invalid status value. Status must be either 'completed' or 'reject'.");
      return;
    }

    const formData = new FormData();
    formData.append('status', status);

    try {
      await axiosPrivate.put(`/admin/credit-limit-requests/${id}`, formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchCreditRequests();
      toast.success(`Request status updated to ${status}`);
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!loggedIn) return;
    try {
      await axiosPrivate.delete(`/admin/credit-limit-requests/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      fetchCreditRequests(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  if (!loggedIn) {
    return null; // Render nothing if not logged in
  }


  return (
    <>
      <Loading />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[10px] sm:px-[22px]">
            <div className="bg-white rounded-[8px] shadow-sm p-[10px] sm:p-[25px]">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <SellerViewCard
                    key={request.id}
                    request={request}
                    onUpdateStatus={handleUpdateStatus}
                    onDeleteRequest={handleDeleteRequest}
                  />
                ))
              ) : (
                <div className="text-center text-lg">No Requests</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const SellerViewCard = ({ request, onUpdateStatus, onDeleteRequest }) => {
  return (
    <div className="border border-gray-200 rounded-[8px] p-[25px] mb-[20px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
        <div>
          <p className="text-[18px] sm:text-[20px] font-[500] mb-5">Seller Overview</p>
          <div className="text-[var(--text-color-body)]">
            <p className="text-[17px]">{request.shop_name}</p>
            <p className="text-[15px]">ID: {request.id}</p>
            <p
              className={`h-[30px] w-[85px] rounded-[5px] text-[14px] font-[500] flex items-center justify-center mt-[20px] ${request.status === 'reject'
                  ? 'bg-red-200 text-red-500'
                  : 'bg-[var(--bg-color-delivered)] text-[var(--text-color-delivered)]'
                }`}
            >
              {request.status === 'reject' ? 'rejected' : request.status}
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-2">
          <div className="flex gap-3 items-center text-[var(--text-color-body)]">
            <TfiEmail className="h-[19px] w-[19px]" />
            <p>{request.email}</p>
          </div>
          <div className="flex gap-3 items-center text-[var(--text-color-body)]">
            <BsTelephone className="h-[19px] w-[19px]" />
            <p>{request.phone_number}</p>
          </div>
          <div className="flex gap-3 items-center text-[var(--text-color-body)]">
            <GrLocation className="h-[19px] w-[19px]" />
            <p>{request.shop_address}</p>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-2">
          <div className="flex gap-3 items-center text-[var(--text-color-body)]">
            <MdOutlineStorefront className="h-[19px] w-[19px]" />
            <p >Aadhar Card: {request.aadhar_card}</p>
          </div>
          <div className="flex gap-3 items-center text-[var(--text-color-body)]">
            <HiOutlineCreditCard className="h-[19px] w-[19px]" />
            <p>PIN Card: {request.pin_card_number}</p>
          </div>
        </div>
      </div>
      <div className="mt-[20px]">
        <p className="text-[20px] font-[500] mb-[10px]">Actions</p>
        <div className="flex gap-3 sm:gap-10">
          <button
            className="h-[35px] w-[100px] sm:h-[45px] sm:w-[130px] rounded-[8px] bg-[#06E775] flex justify-center items-center text-white font-[500] border border-[#06E775] hover:bg-transparent transition-all duration-100 hover:text-[#06E775]"
            onClick={() => onUpdateStatus(request.id, 'completed')}
          >
            Accept
          </button>
          <button
            className="h-[35px] w-[100px] sm:h-[45px] sm:w-[130px] rounded-[8px] bg-[#FE4242] flex justify-center items-center text-white font-[500] border border-[#FE4242] hover:bg-transparent transition-all duration-100 hover:text-[#FE4242]"
            onClick={() => onUpdateStatus(request.id, 'reject')}
          >
            Decline
          </button>
          <button
            className="h-[35px] w-[100px] sm:h-[45px] sm:w-[130px] rounded-[8px] bg-[#FF9900] flex justify-center items-center text-white font-[500] border border-[#FF9900] hover:bg-transparent transition-all duration-100 hover:text-[#FF9900]"
            onClick={() => onDeleteRequest(request.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditLimit;