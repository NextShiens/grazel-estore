"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import airpod from "@/assets/airpod.png";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { getTopReferralApi } from "@/apis";

export default function ReferralRanking() {
  const [topUser, setTopUser] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getTopReferralApi();
        setTopUser(data.top_users);
        console.log(data);
      } catch (error) {}
    })();
  }, []);

  return (
    <>
      <div className=" lg:my-[50px] my-[20px] sm:my-[20px] md:my-[30px] lg:mx-[150px] mx-[20px] sm:mx-[20px] md:mx-[30px]">
        <p className="text-[24px] font-semibold text-black mt-3">
          Referral Ranking
        </p>

        {/* Large screen layout */}
        <div className="hidden lg:flex justify-center gap-3 w-[100%] items-center p-3">
          <div className="w-[20%]">
            <p className="text-[24px] font-medium text-[#777777] mt-3">Name</p>
          </div>
          {/* <div className="w-[20%]">
            <p className="text-[24px] font-medium text-[#777777] mt-3">
              Referral Id
            </p>
          </div> */}
          <div className="w-[20%]">
            <p className="text-[24px] font-medium text-[#777777] mt-3">
              Referral Score
            </p>
          </div>
          <div className="w-[20%]">
            <p className="text-[24px] text-center font-medium text-[#777777] mt-3">
              Ranking No
            </p>
          </div>
        </div>

        {topUser.length > 0 &&
          topUser.map((item, index) => (
            <React.Fragment key={index}>
              {/* Large screen item */}
              <div className="hidden lg:flex gap-3 w-[100%] justify-center items-center mt-2 p-3 ">
                <div className="w-[20%] flex items-center gap-3">
                  <Image
                    alt=""
                    src={
                      item?.profile?.image
                        ? "https://api.grazle.co.in/" + item?.profile?.image
                        : airpod
                    }
                    className="h-[42px] w-[42px] rounded-3xl"
                    width={26}
                    height={26}
                  />
                  <p className="text-[16px] font-medium text-[#191919]">
                    {item?.profile?.first_name || item?.username}
                  </p>
                </div>
                {/* <div className="w-[20%]">
                  <p className="text-[16px] font-medium text-[#191919]">
                    #ey79ikmn
                  </p>
                </div> */}
                {/* <div className="w-[20%] pl-[50px]">
                  <div className="bg-gradient-to-br from-[#FFA1A1] to-[#F70000] h-[32px] rounded-lg w-[32px] flex justify-center items-center">
                    <p className="text-[20px] font-semibold text-white">
                      {index + 1}
                    </p>
                  </div>
                </div> */}
                <div className="w-[20%]">
                  <p className="text-[16px] text-center font-medium text-[#191919]">
                    {item?.score}
                  </p>
                </div>
                <div className="w-[20%] pl-[50px]">
                  <div className="bg-gradient-to-br from-[#FFA1A1] to-[#F70000] h-[32px] rounded-lg w-[32px] flex justify-center items-center">
                    <p className="text-[20px] font-semibold text-white">
                      {index + 1}
                    </p>
                  </div>
                </div>
              </div>

              {/* Small screen item */}
              <div className="flex lg:hidden items-center justify-between bg-white p-3 rounded-lg mb-2">
                <div className="flex items-center gap-4 w-full">
                <Image
                    alt=""
                    src={
                      item?.profile?.image
                        ? "https://api.grazle.co.in/" + item?.profile?.image
                        : airpod
                    }
                    className="h-[42px] w-[42px] rounded-3xl"
                    width={26}
                    height={26}
                  />

                  <div className="flex-grow">
                    <p className="text-[16px] font-medium text-[#191919]">
                      {item?.profile?.first_name || item?.username}
                    </p>
                  </div>

                  <div className="flex-shrink-0 mr-8">
                    <p className="text-[13px] text-[#777777]">
                      {item?.score} referrals
                    </p>
                  </div>

                  <div className="flex-shrink-0 bg-gradient-to-br from-[#FFA1A1] to-[#F70000] h-[32px] w-[32px] rounded-lg flex justify-center items-center">
                    <p className="text-[20px] font-semibold text-white">
                      {index + 1}
                    </p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
      </div>
    </>
  );
}
