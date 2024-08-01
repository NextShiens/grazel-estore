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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !message || !subject) {
      setError("All fields are required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const formdata = new FormData();
    formdata.append("name", name);
    formdata.append("message", message);
    formdata.append("subject", subject);
    formdata.append("email", email);

    try {
      const { data } = await contactSupportApi(formdata);
      console.log(data);
      setSuccess(
        "Message sent successfully! our team will get back to you soon."
      );
      setName("");
      setEmail("");
      setMessage("");
      setSubject("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again later.");
    }
  };

  return (
    <>
      <div className="mx-4 md:mx-8 lg:mx-[150px] my-8 md:my-[80px]">
        <div className="flex flex-col md:flex-row items-stretch gap-6">
          <div
            style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
            className="rounded-3xl p-4 md:p-[20px] w-full md:w-[25%] mb-6 md:mb-0"
          >
            <div className="w-full rounded-lg border border-[#777777] p-[10px] flex items-center mb-3">
              <Image
                src={support}
                alt=""
                className="w-[18px] h-[18px] mr-[10px]"
              />
              <p className="text-[18px] font-normal">Contact Support</p>
            </div>

            <a
              href="https://www.grazle.co.in/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="w-full rounded-lg border border-[#777777] p-[10px] flex items-center mb-3">
                <Image
                  src={web}
                  alt=""
                  className="w-[18px] h-[18px] mr-[10px]"
                />
                <p className="text-[18px] font-normal">Website</p>
              </div>
            </a>
            <a
              href="https://www.facebook.com/grazlefb/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="w-full rounded-lg border border-[#777777] p-[10px] flex items-center mb-3">
                <Image
                  src={fb}
                  alt=""
                  className="w-[18px] h-[18px] mr-[10px]"
                />
                <p className="text-[18px] font-normal">Facebook</p>
              </div>
            </a>

            <a
              href="https://www.grazle.co.in/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="w-full rounded-lg border border-[#777777] p-[10px] flex items-center mb-3">
                <Image
                  src={Google}
                  alt=""
                  className="w-[18px] h-[18px] mr-[10px]"
                />
                <p className="text-[18px] font-normal">Google</p>
              </div>
            </a>

            <a
              href="https://www.instagram.com/homewarebygrazle?igsh=MXYxbXN0eG40MWtuNA=="
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="w-full rounded-lg border border-[#777777] p-[10px] flex items-center mb-3">
                <Image
                  src={Insta}
                  alt=""
                  className="w-[18px] h-[18px] mr-[10px]"
                />
                <p className="text-[18px] font-normal">Instagram</p>
              </div>
            </a>

            <a
              href="https://x.com/GrazleHomeware"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="w-full rounded-lg border border-[#777777] p-[10px] flex items-center mb-3">
                <Image
                  src={Tiwtter}
                  alt=""
                  className="w-[18px] h-[18px] mr-[10px]"
                />
                <p className="text-[18px] font-normal">Twitter</p>
              </div>
            </a>

            <div className="w-full rounded-lg border border-[#777777] p-[10px] flex items-center">
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
            className="rounded-3xl p-4 md:p-[30px] w-full md:w-[50%] mb-6 md:mb-0"
          >
            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
            <p className="text-base font-normal mb-6 text-[#777777]">
              Your email address will not be published. Required fields are
              marked*
            </p>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}

            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-base font-semibold mb-2"
              >
                Name *
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="border border-[#777777] w-full rounded-md h-12 px-3 focus:outline-none focus:ring-2 focus:ring-[#F70000]"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-base font-semibold mb-2"
              >
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="border border-[#777777] w-full rounded-md h-12 px-3 focus:outline-none focus:ring-2 focus:ring-[#F70000]"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="subject"
                className="block text-base font-semibold mb-2"
              >
                Subject *
              </label>
              <input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="border border-[#777777] w-full rounded-md h-12 px-3 focus:outline-none focus:ring-2 focus:ring-[#F70000]"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="message"
                className="block text-base font-semibold mb-2"
              >
                Message *
              </label>
              <textarea
                id="message"
                placeholder="Message"
                className="border border-[#777777] resize-none w-full rounded-md h-24 p-3 focus:outline-none focus:ring-2 focus:ring-[#F70000]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="bg-[#F70000] rounded-full h-12 w-full md:w-[275px] font-medium text-white hover:bg-[#D60000] transition-colors duration-300"
            >
              Send Message
            </button>
          </form>

          <div
            style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
            className="rounded-3xl p-4 md:p-[20px] w-full md:w-[25%] bg-[#5F0505] text-white"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-3">Address</h3>
              <p className="text-base font-medium">
                S/O Mr. RISHI PAL S/O SH. RISHI PAL MHP NO. 5306 K-819 G/F
                MAHIPALPUR EXTN OPP. -APRAVTO MARUTI SHOWROOM, NEW DELHI 1 10037
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-3">Contact</h3>
              <p className="text-base font-medium mb-2">Phone : +9108202334</p>
              <p className="text-base font-medium">Email : www@Grazle.com</p>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-3">Open Time</h3>
              <p className="text-base font-medium mb-2">
                Monday - Friday : 11:00 - 22:00
              </p>
              <p className="text-base font-medium">
                Saturday - Sunday : 11:00 - 22:00
              </p>
            </div>

            <h3 className="text-2xl font-semibold mb-4">Social Media</h3>

            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/grazlefb/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="h-[46px] w-[46px] rounded-full bg-[#F70000] flex items-center justify-center">
                  <FaFacebookF className="text-[20px]" />
                </div>
              </a>
              <a
                href="https://x.com/GrazleHomeware"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="h-[46px] w-[46px] rounded-full bg-[#F70000] flex items-center justify-center">
                  <FaTwitter className="text-[20px]" />
                </div>
              </a>
              <a
                href="https://www.instagram.com/homewarebygrazle?igsh=MXYxbXN0eG40MWtuNA=="
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="h-[46px] w-[46px] rounded-full bg-[#F70000] flex items-center justify-center">
                  <AiFillInstagram className="text-[20px]" />
                </div>
              </a>
              <a
                href="https://www.linkedin.com/company/grazle"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="h-[46px] w-[46px] rounded-full bg-[#F70000] flex items-center justify-center">
                  <FaPinterestP className="text-[20px]" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
