import React, { useEffect, useState } from "react";
import Image from "next/image";

import grazleLogo from "../assets/grazle-logo.png";
import profile from "../assets/profile.jpeg";
import useLocalStorage from "../hooks/use-local-storage";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useSelector } from "react-redux";
const Navbar = () => {
  const user = useSelector((state) => state.user);
  const [isMounted, setIsMounted] = useState(false);
  const [name] = useLocalStorage("name", "");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <div className="bg-white h-[70px] shadow-sm flex items-center justify-between">
      <div className="md:w-[240px] flex justify-center items-center px-5 md:ps-0">
        <Image alt="" src={grazleLogo} className="h-[80px] w-auto mt-3.5" />
      </div>
      <div className="sm:flex-1 flex justify-between items-center px-[22px]">
        <div className="hidden sm:block">
          <p className="text-[16px] font-[600] leading-[24px]">
            Hello,
            {user?.username?.toUpperCase() || name?.toUpperCase()}
          </p>
          <p className="text-[13px] font-[400] leading-[19.5px] text-[#777777]">
            Welcome Back
          </p>
        </div>
        <div className="flex justify-center items-center gap-2 sm:gap-5">
          <IoIosNotificationsOutline className="bg-gray-200 rounded-[5px] h-[23px] w-[23px] p-1" />
          <p className="text-[14px] font-[500]">
            {user?.username?.toUpperCase() || name?.toUpperCase()}
          </p>
          <div className="w-[40px] h-[40px] rounded-[9px] bg-gray-200">
            <Image
              alt=""
              src={profile || user?.profile?.image}
              width={40}
              height={40}
              className="rounded-[9px] w-[100%] h-[100%]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
