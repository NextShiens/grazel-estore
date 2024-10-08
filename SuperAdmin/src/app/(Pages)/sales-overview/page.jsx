"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import { useRouter } from "next/navigation";

import Loading from "@/components/loading";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import Section1 from "./Section1";
import Section3 from "./Section3";

const SalesOverview = () => {
  const dispatch = useDispatch();
  const router = useRouter();

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
      dispatch(updatePageNavigation("sales-overview"));
    }
  }, [dispatch, loginChecked, loggedIn]);

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
          <div className="flex-1 mt-[30px] p-[10px] sm:px-[25px]">
            <Section1 />
            <Section3 />
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesOverview;
