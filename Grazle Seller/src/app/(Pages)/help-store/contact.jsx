import React, { useState } from "react";
import MessageSentSuccessfully from "../../../components/messageSentSuccessfully";

const Contact = () => {
  const [formSubmit, setFormSubmit] = useState(false);
  const fn_submit = (e) => {
    e.preventDefault();
    setFormSubmit(true);
  };
  return (
    <div className="bg-white px-[20px] py-[30px] shadow-sm rounded-[8px]">
      <p className="text-[20px] font-[600]">Contact Us</p>
      <div>
        <form
          className="mt-5 flex flex-col gap-5"
          onSubmit={(e) => fn_submit(e)}
        >
          <div className="flex flex-col gap-1">
            <label className="text-[#777777]">Full Name</label>
            <input
              placeholder="Full Name"
              className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[#777777]">Email</label>
            <input
              placeholder="Email"
              className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[#777777]">Message</label>
            <textarea
              placeholder="Write about your message"
              className="focus:outline-none border-[2px] border-gray-200 py-2 rounded-[8px] px-[15px] h-[120px] text-[15px]"
            />
          </div>
          <input
            type="submit"
            value={"Send Message"}
            className="h-[50px] rounded-[8px] bg-[#FE4242] text-white font-[500] w-[220px] mt-5 cursor-pointer"
          />
        </form>
      </div>
      {formSubmit && <MessageSentSuccessfully setFormSubmit={setFormSubmit} />}
    </div>
  );
};

export default Contact;
