"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePageNavigation } from "../../../features/features";

import Navbar from "../../../components/navbar";
import Sidebar from "../../../components/sidebar";
import General from "./general";
import Payment from "./payment";

const StoreSettings = () => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState("general");
  useEffect(() => {
    dispatch(updatePageNavigation("store-settings"));
  }, [dispatch]);
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 mt-[30px] px-[22px]">
          <div className="py-[30px] px-[20px] bg-white rounded-[8px] shadow-sm">
            <div className="flex gap-10 mb-[15px]">
              <p
                className={`cursor-pointer hover:text-[var(--text-color)] font-[500] border-b-[2px] hover:border-[var(--text-color)] ${
                  selectedTab === "general"
                    ? "text-[var(--text-color)] border-[var(--text-color)]"
                    : "text-[var(--text-color-body)] border-transparent"
                }`}
                onClick={() => setSelectedTab("general")}
              >
                General
              </p>
              {/* <p
                className={`cursor-pointer hover:text-[var(--text-color)] font-[500] border-b-[2px] hover:border-[var(--text-color)] ${
                  selectedTab === "payment"
                    ? "text-[var(--text-color)] border-[var(--text-color)]"
                    : "text-[var(--text-color-body)] border-transparent"
                }`}
                onClick={() => setSelectedTab("payment")}
              >
                Payment
              </p> */}
            </div>
            {selectedTab === "general" ? <General /> : <Payment />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
