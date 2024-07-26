"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  updatePageLoader,
  updatePageNavigation,
} from "../../../features/features";
import Navbar from "../../../components/navbar";
import Sidebar from "../../../components/sidebar";

import { toast } from "react-toastify";
import { axiosPrivate } from "../../../axios/index.js";
import Loading from "../../../components/loading.jsx";

const Settings = () => {
  const dispatch = useDispatch();
  const [isPending, setPending] = useState(false);
  const [profile, setProfile] = useState({});
  const formRef = useRef(null);
  useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation("settings"));
  }, [dispatch]);
  useEffect(() => {
    async function onGetProfile() {
      const { data } = await axiosPrivate.get(`/profile`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setProfile(data?.user);
    }
    onGetProfile();
  }, []);
  async function onEditProfit(formdata) {
    try {
      setPending(true);
      const userId = localStorage.getItem("userId");
      await axiosPrivate.put(`/profile/${userId}/edit`, formdata, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success("Profile has been edited");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      formRef.current?.reset();
      setTimeout(() => {
        setPending(false);
      }, 1000);
    }
  }
  async function onPasswordChange(formdata) {
    try {
      const newPassword = formdata.get("new_password");
      const confirmPassword = formdata.get("confirm_password");
      setPending(true);
      if (newPassword !== confirmPassword) {
        return toast.error("New and confirm password did'nt match");
      }
      await axiosPrivate.post("/profile/change-password", formdata, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success("Password has been changed");
    } catch (error) {
      if (error?.request?.status === 400) {
        //error.data.message
        return toast.error("Invalid old password");
      }
      toast.error("Something went wrong");
    } finally {
      setTimeout(() => {
        setPending(false);
      }, 1000);
    }
  }
  return (
    <>
      <Loading />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="grid lg:grid-cols-2 flex-1">
            <form
              action={onEditProfit}
              ref={formRef}
              className="mt-[30px] px-[22px] w-full"
            >
              <div className="bg-white rounded-[8px] shadow-sm p-[20px]">
                <div className="border-[2px] border-gray-200 rounded-[8px] p-[20px]">
                  <p className="text-[20px] font-[500]">Profile</p>
                  <div className="flex flex-col gap-5 pb-2 mt-5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[#777777]">Your Name</label>
                      <input
                        placeholder="John Due"
                        name="first_name"
                        defaultValue={profile?.profile?.first_name}
                        required
                        className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#777777]">Email Address</label>
                      <input
                        placeholder="john_due@gmail.com"
                        name="email"
                        defaultValue={profile?.email}
                        required
                        type="email"
                        className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#777777]">Phone Number</label>
                      <input
                        placeholder="+9856575775"
                        name="phone"
                        required
                        defaultValue={profile?.profile?.phone}
                        type="tel"
                        className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#777777]">City</label>
                      <input
                        placeholder="Select an option"
                        name="city"
                        defaultValue={profile?.profile?.city}
                        required
                        className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#777777]">State</label>
                      <input
                        placeholder="Select an option"
                        defaultValue={profile?.profile?.state}
                        name="state"
                        required
                        className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#777777]">Address</label>
                      <input
                        placeholder="Street 23, Apartment Sector"
                        name="address"
                        defaultValue={profile?.profile?.address}
                        required
                        className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                      />
                    </div>
                    {/* <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Pin Code</label>
                  <input
                    placeholder="Pin Code"
                    name="pin"
                    defaultValue={profile?.profile?.address}
                    required
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div> */}
                    {/* <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">About</label>
                  <textarea
                    placeholder="Write Here"
                    name="description"
                    required
                    className="focus:outline-none py-2 border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[100px] text-[15px]"
                  />
                </div> */}
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-10 mt-[10px]">
                  <button
                    disabled={isPending}
                    type="submit"
                    className="h-[50px] rounded-[8px] bg-[#FE4242] text-white font-[500] w-[200px] mt-10"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
            <form
              action={onPasswordChange}
              className="mt-[30px] px-[22px] w-full"
            >
              <div className="bg-white rounded-[8px] shadow-sm p-[20px]">
                <div className="border-[2px] border-gray-200 rounded-[8px] p-[20px]">
                  <p className="text-[20px] font-[500]">Password Setting</p>
                  <div className="flex flex-col gap-5 pb-2 mt-5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[#777777]">Current Password</label>
                      <input
                      type="password"
                        name="old_password"
                        required
                        className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#777777]">New Password</label>
                      <input
                        name="new_password"
                        required
                        type="password"
                        className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#777777]">Confirm New Password</label>
                      <input
                        name="confirm_password"
                        required
                        type="password"
                        className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-10 mt-[10px]">
                  <button
                    disabled={isPending}
                    type="submit"
                    className="h-[50px] rounded-[8px] bg-[#FE4242] text-white font-[500] w-[200px] mt-10"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
