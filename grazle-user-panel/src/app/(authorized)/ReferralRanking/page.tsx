"use client";
import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import airpod from "@/assets/airpod.png";
import { getCurrentUserRefsApi, createReferralApi } from "@/apis";
import { BiCopy, BiLoader } from "react-icons/bi";
import { toast } from "react-toastify"; // Ensure toast is imported

export default function ReferralRanking() {
  const [referrals, setReferrals] = useState([]);
  const [pending, startTransition] = useTransition();
  const [referralLink, setReferralLink] = useState(""); // State to store generated referral link

  const generateRefLink = () => {
    startTransition(async () => {
      if (currentUser) {
        const formdata = new FormData();
        formdata.append("sender_user_id", currentUser.id);
        const { data } = await createReferralApi(formdata);
        setReferralLink(data?.referral.referral_code || ""); // Update referralLink with the newly generated code
      }
    });
  };

  const copyToClipboard = () => {
    const linkToCopy = referralLink || (referrals[0] && referrals[0].referral_link) || ""; // Fallback to referrals[0].referral_link if referralLink is empty
    navigator.clipboard
      .writeText(linkToCopy)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  useEffect(() => {
    (async () => {
      try {
        const user = JSON.parse(localStorage.getItem('theUser'));
        const id = user.id;
        const { data } = await getCurrentUserRefsApi(id);
        setReferrals(data.referrals);
        console.log(data);
      } catch (error) {
        console.error("Error fetching referrals:", error);
      }
    })();
  }, []);

  return (
    <>
      <div className="lg:my-[50px] my-[20px] sm:my-[20px] md:my-[30px] lg:mx-[150px] mx-[20px] sm:mx-[20px] md:mx-[30px]">
        <div>
          {referrals && referrals.length > 0 && (
            <>
              <p className="text-[16px] font-medium text-[#777777]">
                Referral Code
              </p>
              <input
                value={referralLink || referrals[0].referral_link || ""}
                readOnly
                className="border-[1px] mt-[9px] border-[#777777] w-full rounded-md h-[50px] p-3 focus:outline-none"
              />
              {referralLink.trim() === "" && referrals[0].referral_link.trim() === "" ? (
                <button
                  disabled={pending}
                  type="button"
                  onClick={generateRefLink}
                  className="bg-[#F70000] rounded-full mx-auto h-[50px] mt-[30px] w-[275px] text-[18px] font-medium text-white"
                >
                  {pending ? (
                    <BiLoader className="animate-spin h-5 w-5 mx-auto" />
                  ) : (
                    "Generate"
                  )}
                </button>
              ) : (
                <button
                  className="bg-[#F70000] rounded-full mx-auto p-2 px-3 mt-[30px] text-[18px] font-medium text-white"
                  onClick={copyToClipboard}
                >
                  <BiCopy className="h-5 w-5" />
                </button>
              )}
            </>
          )}
        </div>
        <p className="text-[24px] font-semibold text-black mt-3">
          Referral Ranking
        </p>

        {/* Large screen layout */}
        <div className="hidden lg:flex justify-between w-full items-center p-3">
          <div className="w-1/3">
            <p className="text-[24px] font-medium text-[#777777] mt-3">Name</p>
          </div>
          <div className="w-1/3 text-center">
            <p className="text-[24px] font-medium text-[#777777] mt-3">
              Referral Code
            </p>
          </div>
          <div className="w-1/3 text-center">
            <p className="text-[24px] font-medium text-[#777777] mt-3">
              Ranking No
            </p>
          </div>
        </div>

        {referrals &&
          referrals.map((item, index) => (
            <React.Fragment key={index}>
              {/* Large screen item */}
              <div className="hidden lg:flex justify-between w-full items-center mt-2 p-3">
                <div className="w-1/3 flex items-center gap-3">
                  <Image
                    alt=""
                    src={item.receiver_user?.profile?.image ? "https://api.grazle.co.in/" + item.receiver_user?.profile?.image : airpod}
                    height={42}
                    width={42}
                  />
                  <p className="text-[16px] font-medium text-[#191919]">
                    {item.receiver_user?.profile?.first_name || item.receiver_user?.username}
                  </p>
                </div>
                <div className="w-1/3 text-center">
                  <p className="text-[16px] font-medium text-[#191919]">
                    {item.referral_code}
                  </p>
                </div>
                <div className="w-1/3 flex justify-center">
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
                    src={item.receiver_user?.profile?.image ? "https://api.grazle.co.in/" + item.receiver_user?.profile?.image : airpod}
                    height={42}
                    width={42}
                  />
                  <div className="flex-grow">
                    <p className="text-[16px] font-medium text-[#191919]">
                      {item.receiver_user?.profile?.first_name || item.receiver_user?.username}
                    </p>
                  </div>

                  <div className="flex-shrink-0 mr-8">
                    <p className="text-[13px] text-[#777777]">
                      {item.referral_code}
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
