import React from "react";
import Image from "next/image";

import leftSuccessDots from "../assets/svgs/left-success-dots.svg";
import rightSuccessDots from "../assets/svgs/right-success-dots.svg";
import success from "../assets/svgs/success.svg";

const MessageSentSuccessfully = ({ setFormSubmit }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center backdrop-blur">
      <div className="h-[280px] w-[390px] rounded-[8px] bg-white shadow-sm flex flex-col justify-center items-center">
        <div className="flex justify-center items-center gap-1">
          <Image alt="" src={leftSuccessDots} />
          <Image alt="" src={success} className="w-[70px] h-[70px]" />
          <Image alt="" src={rightSuccessDots} />
        </div>
        <p className="text-[20px] font-[500] text-center my-4">
          Message send successfully!
        </p>
        <p className="text-center text-[14px] text-[#434343]">
          We will get to you in 24 hours
        </p>
        <button
          className="h-[34px] w-[90%] bg-[#F70000] rounded-[5px] text-white text-[15px] font-[500] mt-3"
          onClick={() => setFormSubmit(false)}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default MessageSentSuccessfully;
