import React from "react";
import Image from "next/image";

import uploadPhoto from "../../../assets/svgs/upload-photo.svg";
import saveChanges from "../../../assets/svgs/save-changes.svg";

import { IoMdCamera } from "react-icons/io";

const General = () => {
  return (
    <div className="mt-[20px]">
      <p className="text-[20px] font-[500]">Logo</p>
      <div className="my-[30px] flex gap-10 items-center flex-col sm:flex-row">
        <div className="w-[110px] h-[110px] bg-[#ECEDF0] border border-[#D6D6D6] rounded-full flex justify-center items-center">
          <IoMdCamera className="text-gray-500 text-[40px]" />
        </div>
        <Image alt="" src={uploadPhoto} className="cursor-pointer" />
      </div>
      <div className="flex flex-col gap-5 pb-5">
        <div className="flex flex-col gap-1">
          <label className="text-[#777777]">Name</label>
          <input
            placeholder="Store Name"
            className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[#777777]">Description</label>
          <textarea
            placeholder="Write about your store"
            className="focus:outline-none py-2 border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[100px] text-[15px]"
          />
        </div>
        <Image alt="" src={saveChanges} className="mt-5 cursor-pointer" />
      </div>
    </div>
  );
};

export default General;
