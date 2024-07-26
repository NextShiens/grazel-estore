import React from "react";
import Image from "next/image";

import saveChanges from "../../../assets/svgs/save-changes.svg";

const Payment = () => {
  return (
    <div className="mt-[20px]">
      <p className="text-[20px] font-[500]">Payment</p>
      <p className="text-[17px] text-[var(--text-color-body)] mt-2">
        Your earnings will be paid out monthly if they reach at least ₹100.00.
      </p>
      <p className="text-[20px] font-[500] mt-7">Bank Details</p>
      <div className="flex flex-col gap-5 pb-5 mt-5">
        <div className="flex flex-col gap-1">
          <label className="text-[#777777]">Account Name</label>
          <input
            placeholder="Account Name"
            className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[#777777]">Account Number</label>
          <input
            placeholder="Account Number"
            className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[#777777]">Bank Name</label>
          <input
            placeholder="Bank Name"
            className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[#777777]">Bank Code</label>
          <input
            placeholder="Bank Code"
            className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
          />
        </div>
        <Image alt="" src={saveChanges} className="mt-5 cursor-pointer" />
      </div>
    </div>
  );
};

export default Payment;
