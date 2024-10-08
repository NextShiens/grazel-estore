"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  updatePageLoader,
  updatePageNavigation,
} from "../../../features/features";
import Image from "next/image";
import Navbar from "../../../components/navbar";
import Sidebar from "../../../components/sidebar";
import SearchOnTop from "../../../components/SearchOnTop";

import { axiosPrivate } from "../../../axios/index";
import { toast } from "react-toastify";
import Loading from "../../../components/loading";
import { FiLoader } from "react-icons/fi";
import { LuLoader2 } from "react-icons/lu";
import { useRouter } from "next/navigation";

const Feedback = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isPending, setPending] = useState(false);
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
    if (loginChecked && loggedIn) {
      dispatch(updatePageLoader(false));
      dispatch(updatePageNavigation("feedback"));
    }
  }, [dispatch, loginChecked, loggedIn]);

  async function onAddFeedback(formdata) {
    if (!loggedIn) return;
    try {
      setPending(true);
      await axiosPrivate.post("/give-feedback", formdata, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success("Feedback given....");
    } catch (error) {
      toast.error("something went wrong");
    } finally {
      setTimeout(() => {
        setPending(false);
      }, 700);
    }
  }

  if (!loginChecked || !loggedIn) {
    return <Loading />;
  }

  return (
    <>
      <Loading />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[22px]">
            {/* <SearchOnTop /> */}
            <form
              action={onAddFeedback}
              className="my-[20px] px-[20px] py-[30px] bg-white rounded-[8px] shadow-sm"
            >
              <p className="text-[21px] font-[600]">Help us improve Grazle</p>
              <p className="text-[15px] text-[var(--text-color-body)] mt-2">
                We are always working to improve the app and your feedback is an
                important part of that process.
              </p>
              <div className="flex flex-col gap-5 pb-2 mt-5">
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Your name</label>
                  <input
                    placeholder="Your name"
                    name="name"
                    required
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Email Address</label>
                  <input
                    placeholder="Email"
                    name="email"
                    type="email"
                    required
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Subject</label>
                  <input
                    placeholder="Subject"
                    name="subject"
                    required
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Your Feedback</label>
                  <textarea
                    name="message"
                    required
                    placeholder="What's going well? What could be better?"
                    className="focus:outline-none border-[2px] border-gray-200 py-2 rounded-[8px] px-[15px] h-[100px] text-[15px]"
                  />
                </div>
                <p className="text-[16px] text-[var(--text-color-body)] mt-2">
                  Your feedback will help us make the app better for everyone.
                </p>
                <div className="flex justify-end gap-5 mt-5 flex-col sm:flex-row items-center sm:items-start">
                  {/* <Image alt="" src={cancel} className="cursor-pointer" /> */}
                  <button
                    disabled={isPending}
                    type="submit"
                    className="h-[50px] flex items-center justify-center rounded-[8px] bg-[#FE4242]  text-white font-[500] w-[200px] mt-10 disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none"
                  >
                    {isPending ? (
                      <LuLoader2 className="animate-spin" />
                    ) : (
                      "Submit"
                    )}
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

export default Feedback;
