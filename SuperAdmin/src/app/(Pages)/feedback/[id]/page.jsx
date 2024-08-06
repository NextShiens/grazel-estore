"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from 'date-fns';
import { Copy } from 'lucide-react';

import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { updatePageNavigation } from "@/features/features";
import { axiosPrivate } from "@/axios";

import img from "@/assets/customer.png";
import Loading from "@/components/loading";

const FeedbackById = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const [feedbackDetails, setFeedbackDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dispatch(updatePageNavigation("feedback"));
    if (params.id) {
      fetchFeedbackDetails(params.id);
    }
  }, [dispatch, params.id]);

  const fetchFeedbackDetails = async (id) => {
    try {
      const response = await axiosPrivate.get(`/admin/customer-support/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (response.data.success) {
        setFeedbackDetails(response.data.address);
      } else {
        console.error("Failed to fetch feedback details:", response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching feedback details:", error);
      setLoading(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!feedbackDetails) return;

    try {
      await axiosPrivate.post(`/admin/customer-support/${feedbackDetails.id}/reply`, 
        { reply },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      // Optionally, you can refresh the feedback details or show a success message
      fetchFeedbackDetails(feedbackDetails.id);
      setReply("");
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!feedbackDetails) {
    return <div>Feedback not found</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 mt-[30px] px-[22px]">
          <div className="bg-white rounded-[8px] shadow-sm p-[10px] sm:p-[25px]">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              {/* <Image
                alt=""
                src={img}
                className="h-[50px] w-[50px] rounded-full bg-[#E0D5C9]"
              /> */}
              <p className="text-[14px] font-semibold">{feedbackDetails.name}</p>
              <p className="text-[11px] text-[var(--text-color-body)] mt-[-9px] sm:mt-0 sm:ms-10">
                {formatDate(feedbackDetails.created_at)}
              </p>
            </div>
            <div className="flex items-center mt-4 justify-center sm:justify-start">
              <p className="font-[500] mr-2">{feedbackDetails.email}</p>
              <div className="relative">
                <button
                  onClick={() => copyToClipboard(feedbackDetails.email)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Copy email"
                >
                  <Copy size={16} className="text-gray-500" />
                </button>
                {copied && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow">
                    Copied!
                  </div>
                )}
              </div>
            </div>
            <p className="text-[14px] text-[var(--text-color-body)] mt-3 sm:w-[85%] text-center sm:text-start">
              {feedbackDetails.message}
            </p>
            {/* <div className="mt-8">
              <p className="text-[#777777] mb-2 font-semibold">Reply</p>
              <textarea
                className="w-full h-[120px] border border-gray-200 rounded-[8px] p-[10px] text-[15px] focus:outline-none focus:border-gray-400"
                placeholder="Write your reply here..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
            </div>
            <button 
              className="h-[50px] px-[20px] sm:w-[220px] rounded-[8px] font-[500] bg-[#FE4242] mt-5 text-white border border-[#FE4242] hover:bg-transparent hover:text-[#FE4242] transition duration-300"
              onClick={handleSubmitReply}
            >
              Submit Reply
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackById;