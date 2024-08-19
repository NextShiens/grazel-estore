"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import SearchOnTop from "@/components/SearchOnTop";
import Loading from "@/components/loading";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import { axiosPrivate } from "@/axios";

const AdminNotification = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    data: "",
  });

  React.useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation("admin-notification"));
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('body', formData.body);
    formDataToSend.append('data', formData.data);

    try {
      dispatch(updatePageLoader(true));
      await axiosPrivate.post("/admin/push-notification", formDataToSend, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success("Notification sent successfully");
      setFormData({ title: "", body: "", data: "" });
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      dispatch(updatePageLoader(false));
    }
  };

  return (
    <>
      <Loading />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[10px] sm:px-[22px]">
            <SearchOnTop showButton={false} />
            <div className="mt-[20px] bg-white rounded-[8px] shadow-sm p-[30px]">
              <h2 className="text-2xl font-semibold mb-6">Send Notification</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block mb-2 font-medium">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="body" className="block mb-2 font-medium">
                    Body
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="data" className="block mb-2 font-medium">
                    Data (Optional)
                  </label>
                  <input
                    type="text"
                    id="data"
                    name="data"
                    value={formData.data}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Send Notification
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminNotification;