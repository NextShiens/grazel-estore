"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePageLoader, updatePageNavigation } from "../../../features/features";

import Navbar from "../../../components/navbar";
import Sidebar from "../../../components/sidebar";
import Contact from "./contact";

import { IoSearch } from "react-icons/io5";
import { LuUsers2, LuClock3 } from "react-icons/lu";
import { BsCalendar2Date } from "react-icons/bs";
import { FaCircleMinus, FaCirclePlus } from "react-icons/fa6";

import data from "../../../components/faqs";
import Loading from "../../../components/loading";

const HelpStore = () => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState("");
  const [selectedFaqs, setSelectedFaqs] = useState(0);
  useEffect(() => {
    dispatch(updatePageLoader(false))
    dispatch(updatePageNavigation("help-store"));
  }, [dispatch]);
  const fn_showAnswer = (id) => {
    if (selectedFaqs === id) {
      return setSelectedFaqs(0);
    }
    setSelectedFaqs(id);
  };
  return (
    <>
    <Loading />
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 mt-[30px] px-[22px]">
          {selectedTab === "" ? (
            <div className="bg-white px-[20px] py-[30px] shadow-sm rounded-[8px]">
              <p className="text-[30px] font-[600]">How can we help you?</p>
              {/* <div className="flex items-center gap-10 my-5">
                <div className="flex flex-1 items-center gap-3 px-5 h-[50px] rounded-[8px] border-[2px] border-gray-200">
                  <IoSearch className="scale-[1.15]" />
                  <input
                    className="focus:outline-none"
                    placeholder="Search Here"
                  />
                </div>
                <button className="h-[50px] rounded-[8px] bg-[#FE4242] w-[150px] text-white font-[500]">
                  Search
                </button>
              </div> */}
              <div className="mt-8">
                <p className="text-[26px] font-[500]">FAQs</p>
                <p className="text-[17px] font-[500] mt-2">
                  Find answers to your questions and more
                </p>
                <div className="mt-6 flex flex-col gap-4">
                  {data?.map((item) => (
                    <>
                      <div
                        key={item.id}
                        className="border-[2px] border-gray-200 rounded-[8px] p-5 flex justify-between items-center"
                      >
                        <p className="text-[17px] font-[500]">
                          {item.question}
                        </p>
                        <div>
                          {selectedFaqs == item.id ? (
                            <FaCircleMinus
                              className="w-[35px] h-[35px] text-[var(--text-color)] cursor-pointer"
                              onClick={() => fn_showAnswer(item.id)}
                            />
                          ) : (
                            <FaCirclePlus
                              className="w-[35px] h-[35px] text-[var(--text-color)] cursor-pointer"
                              onClick={() => fn_showAnswer(item.id)}
                            />
                          )}
                        </div>
                      </div>
                      <div
                        key={item.id}
                        className={`faq-answer ${
                          selectedFaqs === item.id ? "expanded" : ""
                        }`}
                      >
                        {item.answer}
                      </div>
                    </>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Contact />
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default HelpStore;
