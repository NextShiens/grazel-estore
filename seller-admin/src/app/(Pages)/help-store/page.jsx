"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  updatePageLoader,
  updatePageNavigation,
} from "../../../features/features";
import Navbar from "../../../components/navbar";
import Sidebar from "../../../components/sidebar";
import Contact from "./contact";
import { IoSearch } from "react-icons/io5";
import { FaCircleMinus, FaCirclePlus } from "react-icons/fa6";
import data from "../../../components/faqs";
import Loading from "../../../components/loading";
import { useRouter } from "next/navigation";

const HelpStore = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [selectedFaqs, setSelectedFaqs] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState(data);
  const [showContactForm, setShowContactForm] = useState(false);
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
      dispatch(updatePageNavigation("help-store"));
    }
  }, [dispatch, loginChecked, loggedIn]);

  const handleSearch = useCallback(() => {
    if (!loggedIn) return;
    const filtered = data.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFaqs(filtered);
  }, [searchTerm, loggedIn]);

  useEffect(() => {
    if (loginChecked && loggedIn) {
      handleSearch();
    }
  }, [searchTerm, handleSearch, loginChecked, loggedIn]);

  const toggleAnswer = (id) => {
    if (!loggedIn) return;
    setSelectedFaqs((prevId) => (prevId === id ? 0 : id));
  };

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
            {!showContactForm ? (
              <div className="bg-white px-[20px] py-[30px] shadow-sm rounded-[8px]">
                <h1 className="text-[30px] font-[600]">How can we help you?</h1>
                <div className="flex items-center gap-10 my-5">
                  <div className="flex flex-1 items-center gap-3 px-5 h-[50px] rounded-[8px] border-[2px] border-gray-200">
                    <IoSearch className="scale-[1.15]" />
                    <input
                      className="focus:outline-none w-full"
                      placeholder="Search Here"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    className="h-[50px] rounded-[8px] bg-[#FE4242] w-[150px] text-white font-[500]"
                    onClick={handleSearch}
                  >
                    Search
                  </button>
                </div>
                <div className="mt-8">
                  <h2 className="text-[26px] font-[500]">FAQs</h2>
                  <p className="text-[17px] font-[500] mt-2">
                    Find answers to your questions and more
                  </p>
                  <div className="mt-6 flex flex-col gap-4">
                    {filteredFaqs.map((item) => (
                      <React.Fragment key={item.id}>
                        <div className="border-[2px] border-gray-200 rounded-[8px] p-5 flex justify-between items-center">
                          <p className="text-[17px] font-[500]">
                            {item.question}
                          </p>
                          <button onClick={() => toggleAnswer(item.id)}>
                            {selectedFaqs === item.id ? (
                              <FaCircleMinus className="w-[35px] h-[35px] text-[var(--text-color)]" />
                            ) : (
                              <FaCirclePlus className="w-[35px] h-[35px] text-[var(--text-color)]" />
                            )}
                          </button>
                        </div>
                        {selectedFaqs === item.id && (
                          <div className="faq-answer expanded">{item.answer}</div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <button 
  onClick={() => setShowContactForm(true)}
  className="mt-8 px-6 py-3 bg-[#FE4242] text-white font-semibold rounded-lg shadow-md hover:bg-[#E03939] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FE4242] focus:ring-opacity-75"
>
  Contact Us
</button>
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