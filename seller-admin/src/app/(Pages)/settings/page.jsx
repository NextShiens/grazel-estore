"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePageLoader, updatePageNavigation, updateUser } from "../../../features/features";
import Navbar from "../../../components/navbar";
import Sidebar from "../../../components/sidebar";
import { toast } from "react-toastify";
import { axiosPrivate } from "../../../axios/index.js";
import Loading from "../../../components/loading.jsx";
import Image from "next/image";
import { IoMdCamera } from "react-icons/io";

const Settings = () => {
  const dispatch = useDispatch();
  const [isPending, setPending] = useState(false);
  const [profile, setProfile] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const formRef = useRef(null);
  const fileInput = useRef(null);

  useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation("settings"));
  }, [dispatch]);

  const fetchProfileData = async () => {
    try {
      const { data } = await axiosPrivate.get(`/profile`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setProfile(data?.user);
      updateLocalStorage(data?.user);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to fetch profile data.");
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const updateLocalStorage = (userData) => {
    localStorage.setItem("name", userData.username || "");
    localStorage.setItem("image", userData.profile?.image || "");
    dispatch(updateUser(userData));
  };

  const openInputFile = () => {
    fileInput.current.click();
  };

  async function onEditProfile(formdata) {
    try {
      setPending(true);
      const userId = localStorage.getItem("userId");
      const updatedFormData = new FormData();
      for (let [key, value] of formdata.entries()) {
        updatedFormData.append(key, value);
      }

      if (profileImage) {
        updatedFormData.append("image", profileImage);
      }
      const response = await axiosPrivate.put(`/profile/${userId}/edit`, updatedFormData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile has been Updated");
      await fetchProfileData(); // Refetch the profile data and update localStorage
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
        return toast.error("New and confirm password didn't match");
      }
      await axiosPrivate.post("/profile/reset-password", formdata, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success("Password has been changed");
    } catch (error) {
      if (error?.request?.status === 400) {
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
              action={onEditProfile}
              ref={formRef}
              className="mt-[30px] px-[22px] w-full"
            >
              <div className="bg-white rounded-[8px] shadow-sm p-[20px]">
                <div className="border-[2px] border-gray-200 rounded-[8px] p-[20px]">
                  <p className="text-[20px] font-[500]">Profile</p>
                  <div className="my-[30px] flex gap-10 items-center flex-col sm:flex-row">
                    <div className="w-[110px] h-[110px] bg-[#d9dff3] border border-[#D6D6D6] rounded-full flex justify-center items-center">
                      {profileImage ? (
                        <Image
                          className="w-full h-full rounded-full object-cover"
                          width={110}
                          height={110}
                          src={URL.createObjectURL(profileImage)}
                          alt="Profile"
                        />
                      ) : profile?.profile?.image ? (
                        <Image
                          className="w-full h-full rounded-full object-cover"
                          width={110}
                          height={110}
                          src={profile?.profile?.image}
                          alt="Profile"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/110x110?text=No+Image";
                          }}
                        />
                      ) : (
                        <IoMdCamera className="text-gray-500 text-[40px]" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={openInputFile}
                      className="px-4 py-2 bg-[#FE4242] text-white rounded-md hover:bg-[#e63b3b] transition-colors"
                    >
                      Upload Image
                    </button>
                    <input
                      ref={fileInput}
                      type="file"
                      className="hidden"
                      onChange={(e) => setProfileImage(e.target.files[0])}
                      accept="image/*"
                    />
                  </div>
                  <div className="flex flex-col gap-5 pb-2 mt-5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[#777777]">Your Name</label>
                      <input
                        placeholder="John Doe"
                        name="username"
                        defaultValue={profile?.username}
                        required
                        className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#777777]">Email Address</label>
                      <input
                        placeholder="john_doe@gmail.com"
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
                        placeholder="Enter city name"
                        name="city"
                        defaultValue={profile?.profile?.city}
                        required
                        className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#777777]">State</label>
                      <input
                        placeholder="Enter state name"
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
                      <label className="text-[#777777]">
                        Confirm New Password
                      </label>
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
