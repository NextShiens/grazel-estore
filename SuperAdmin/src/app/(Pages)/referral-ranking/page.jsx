"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { axiosPrivate } from "@/axios";

import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import SearchOnTop from "@/components/SearchOnTop";
import { updatePageLoader, updatePageNavigation } from "@/features/features";

import electronicLED from "@/assets/document-image.png";
import Loading from "@/components/loading";

const ReferralRanking = () => {
  const dispatch = useDispatch();
  const [topUsers, setTopUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dispatch(updatePageNavigation("referral-ranking"));
    fetchTopUsers();
  }, [dispatch]);

  const fetchTopUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axiosPrivate.get("/top-referrals", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (response.data.success) {
        setTopUsers(response.data.top_users);
      } else {
        console.error("Failed to fetch top users");
      }
    } catch (error) {
      console.error("Error fetching top users:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
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
            <SearchOnTop />
            <div className="my-[20px] px-[30px] py-[20px] bg-white rounded-[8px] shadow-sm overflow-x-auto w-[94vw] md:w-[67vw] lg:w-[75vw] xl:w-auto">
              {isLoading ? (
                <p>Loading top Referals...</p>
              ) : (
                <table className={`w-[850px] xl:w-[100%]`}>
                  <thead>
                    <tr className="font-[500] text-[var(--text-color-body)] text-[15px] h-[50px]">
                      <td>Username</td>
                      <td>Email</td>
                      <td>Ranking No</td>
                      <td>Score</td>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map((user, index) => (
                      <tr key={user.id} className="h-[50px] text-[14px]">
                        <td className="flex items-center gap-1.5 h-[50px]">
                          <Image
                            alt=""
                            src={user?.profile?.image ? "https://api.grazle.co.in/" + user?.profile?.image : electronicLED}
                            className="h-[26px] w-[26px]"
                            width={26}
                            height={26}
                          />
                          {user.username}
                        </td>
                        <td>{user.email}</td>
                        <td className="ps-[25px]">
                          <div
                            className="w-[20px] h-[20px] rounded-[5px] shadow-sm text-[11px] flex justify-center items-center text-white font-[500]"
                            style={{
                              backgroundImage:
                                "linear-gradient(to left ,#F70000, #FFA1A1)",
                            }}
                          >
                            <p>{index + 1}</p>
                          </div>
                        </td>
                        <td className="px-[17px] relative">
                          <p>{user.score}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferralRanking;