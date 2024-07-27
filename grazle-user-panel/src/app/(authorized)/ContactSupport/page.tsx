"use client";
import Image from "next/image";
import fb from "@/assets/fb.png";
import React, { useState } from "react";
import whatapp from "@/assets/whatapp.png";
import support from "@/assets/support.png";
import { contactSupportApi } from "@/apis";
import Tiwtter from "@/assets/Vector (5).png";
import web from "@/assets/Group 1820549998.png";
import { AiFillInstagram } from "react-icons/ai";
import Insta from "@/assets/Group 1820550000.png";
import Google from "@/assets/Group 1820549999.png";
import { FaFacebookF, FaPinterestP, FaTwitter } from "react-icons/fa";

export default function ContactSupport() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  const submitForm = async (e: any) => {
    e.preventDefault();

    const formdata = new FormData();
    formdata.append("name", name);
    formdata.append("message", message);
    formdata.append("subject", subject);
    formdata.append("email", email);

    const { data } = await contactSupportApi(formdata);
    console.log(data);
  };

  return (
    <div className="mx-[150px] my-[80px]">
      <div className="flex items-center gap-6">
        <div
          style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
          className="rounded-3xl p-[20px] w-[25%] h-[554px]"
        >
          <div className="w-full rounded-lg border-[1px]  border-[#777777] p-[10px] flex items-center">
            <Image
              src={support}
              alt=""
              className="w-[18px] h-[18px] mr-[10px]"
            />

            <p className="text-[18px] font-normal">Contact Support</p>
          </div>

          <div className="w-full rounded-lg border-[1px]  border-[#777777] mt-[14px] p-[10px] flex items-center">
            <Image src={web} alt="" className="w-[18px] h-[18px] mr-[10px]" />
            <p className="text-[18px] font-normal">Website</p>
          </div>

          <div className="w-full rounded-lg border-[1px]  border-[#777777] mt-[14px] p-[10px] flex items-center">
            <Image src={fb} alt="" className="w-[18px] h-[18px] mr-[10px]" />
            <p className="text-[18px] font-normal">Facebook</p>
          </div>

          <div className="w-full rounded-lg border-[1px]  border-[#777777] mt-[14px] p-[10px] flex items-center">
            <Image
              src={Google}
              alt=""
              className="w-[18px] h-[18px] mr-[10px]"
            />
            <p className="text-[18px] font-normal">Google</p>
          </div>

          <div className="w-full rounded-lg border-[1px]  border-[#777777] mt-[14px] p-[10px] flex items-center">
            <Image src={Insta} alt="" className="w-[18px] h-[18px] mr-[10px]" />
            <p className="text-[18px] font-normal">Instagram</p>
          </div>

          <div className="w-full rounded-lg border-[1px]  border-[#777777] mt-[14px] p-[10px] flex items-center">
            <Image
              src={Tiwtter}
              alt=""
              className="w-[18px] h-[18px] mr-[10px]"
            />
            <p className="text-[18px] font-normal">Twitter</p>
          </div>

          <div className="w-full rounded-lg border-[1px]  border-[#777777] mt-[14px] p-[10px] flex items-center">
            <Image
              src={whatapp}
              alt=""
              className="w-[18px] h-[18px] mr-[10px]"
            />
            <p className="text-[18px] font-normal">WhatsApp</p>
          </div>
        </div>

        <form
          onSubmit={submitForm}
          style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
          className="rounded-3xl p-[30px] w-[50%] h-[554px]"
        >
          <p className="text-[24px] font-bold ">Get in Touch</p>

          <p className="text-[16px] font-normal mt-[12px] text-[#777777]">
            Your email Address will not be published. Required fields are
            marked*
          </p>

          <div className="flex-col mt-[20px]">
            <label className="text-[16px] font[semibold"> Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              name="name"
              placeholder="Name"
              className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
            />
          </div>

          <div className="flex-col mt-[20px]">
            <label className="text-[16px] font[semibold"> Email *</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name="email"
              placeholder="email"
              className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
            />
          </div>

          <div className="flex-col mt-[20px]">
            <label className="text-[16px] font[semibold"> Subject *</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              name="subject"
              placeholder="Subject"
              className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
            />
          </div>

          <div className="flex-col mt-[20px]">
            <label className="text-[16px] font[semibold"> Message *</label>
            <textarea
              name="message"
              placeholder="Message "
              className="border-[1px] mt-[9px] border-[#7777777]resize-none  w-full rounded-md h-[100px] p-3
              focus:outline-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className=" bg-[#F70000] rounded-full h-[50px] mt-[20px] w-[275px] font-medium text-white"
          >
            Send Message
          </button>
        </form>

        <div
          style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
          className="rounded-3xl p-[20px] w-[25%] bg-[#5F0505] h-[554px] text-white"
        >
          <div>
            <p className="text-[24px] font-semibold "> Address</p>
            <p className="text-[16px] font-medium mt-[12px]">
              8567 Preston Rd. Inglewood, Maine 9875
            </p>
          </div>

          <div className="mt-[26px]">
            <p className="text-[24px] font-semibold "> Contact</p>
            <p className="text-[16px] font-medium mt-[12px]">
              Phone : +0876-776-887
            </p>
            <p className="text-[16px] font-medium mt-[6px]">
              Email : user888@gmail.com
            </p>
          </div>

          <div className="mt-[26px]">
            <p className="text-[24px] font-semibold "> Open Time</p>
            <p className="text-[16px] font-medium mt-[12px]">
              Monday - Friday : 11:00 - 22:00
            </p>
            <p className="text-[16px] font-medium mt-[6px]">
              Sonday - Friday : 11:00 - 22:00
            </p>
          </div>

          <p className="text-[24px] font-semibold mt-[30px] "> Open Time</p>

          <div className="flex items-center gap-4 mt-[16px]">
            <div className="h-[46px] w-[46px] rounded-full bg-[#F70000] flex items-center justify-center">
              <FaFacebookF className="text-[20px]  " />
            </div>

            <div className="h-[46px] w-[46px] rounded-full bg-[#F70000] flex items-center justify-center">
              <FaTwitter className="text-[20px]  " />
            </div>

            <div className="h-[46px] w-[46px] rounded-full bg-[#F70000] flex items-center justify-center">
              <AiFillInstagram className="text-[20px]  " />
            </div>

            <div className="h-[46px] w-[46px] rounded-full bg-[#F70000] flex items-center justify-center">
              <FaPinterestP className="text-[20px]  " />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
