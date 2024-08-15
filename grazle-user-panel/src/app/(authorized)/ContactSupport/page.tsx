"use client";
import Image from "next/image";
import React, { useState } from "react";
import { contactSupportApi } from "@/apis";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebookF, FaPinterestP, FaTwitter } from "react-icons/fa";

// Import images (assuming these imports are correct)
import fb from "@/assets/fb.png";
import whatapp from "@/assets/whatapp.png";
import support from "@/assets/support.png";
import Tiwtter from "@/assets/Vector (5).png";
import web from "@/assets/Group 1820549998.png";
import Insta from "@/assets/Group 1820550000.png";
import Google from "@/assets/Group 1820549999.png";

const SocialLink = ({ href, icon, alt }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="w-full">
    <div className="w-full rounded-lg border border-[#777777] p-3 flex items-center mb-3 transition-colors hover:bg-gray-100">
      <Image src={icon} alt={alt} className="w-5 h-5 mr-3" />
      <p className="text-base font-normal">{alt}</p>
    </div>
  </a>
);

const InputField = ({ id, label, type = "text", value, onChange, placeholder }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-base font-semibold mb-2">
      {label} *
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border border-[#777777] w-full rounded-md h-12 px-3 focus:outline-none focus:ring-2 focus:ring-[#F70000] transition-all"
    />
  </div>
);

export default function ContactSupport() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (Object.values(formData).some(field => !field)) {
      setError("All fields are required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    try {
      const { data } = await contactSupportApi(formDataToSend);
      console.log(data);
      setSuccess("Message sent successfully! Our team will get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again later.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/4 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Options</h2>
              <SocialLink href="#" icon={support} alt="Contact Support" />
              <SocialLink href="https://www.grazle.co.in/" icon={web} alt="Website" />
              <SocialLink href="https://www.facebook.com/grazlefb/" icon={fb} alt="Facebook" />
              <SocialLink href="https://www.grazle.co.in/" icon={Google} alt="Google" />
              <SocialLink href="https://www.instagram.com/homewarebygrazle" icon={Insta} alt="Instagram" />
              <SocialLink href="https://x.com/GrazleHomeware" icon={Tiwtter} alt="Twitter" />
              <SocialLink href="#" icon={whatapp} alt="WhatsApp" />
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <form onSubmit={submitForm} className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <p className="text-base text-gray-600 mb-6">
                Your email address will not be published. Required fields are marked*
              </p>

              {error && <p className="text-red-500 mb-4">{error}</p>}
              {success && <p className="text-green-500 mb-4">{success}</p>}

              <InputField
                id="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                name="name"
              />
              <InputField
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                name="email"
              />
              <InputField
                id="subject"
                label="Subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Message Subject"
                name="subject"
              />

              <div className="mb-6">
                <label htmlFor="message" className="block text-base font-semibold mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Your Message"
                  className="border border-[#777777] resize-none w-full rounded-md h-32 p-3 focus:outline-none focus:ring-2 focus:ring-[#F70000] transition-all"
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="bg-[#F70000] rounded-full py-3 px-6 font-medium text-white hover:bg-[#D60000] transition-colors duration-300 w-full sm:w-auto"
              >
                Send Message
              </button>
            </form>
          </div>

          <div className="w-full lg:w-1/4">
            <div className="bg-[#5F0505] text-white rounded-2xl shadow-md p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Address</h3>
                <p className="text-sm">
                  S/O Mr. RISHI PAL S/O SH. RISHI PAL MHP NO. 5306 K-819 G/F
                  MAHIPALPUR EXTN OPP. -APRAVTO MARUTI SHOWROOM, NEW DELHI 110037
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Contact</h3>
                <p className="text-sm mb-1">Phone: +9108202334</p>
                <p className="text-sm">Email: www.grazle.co.in</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Open Time</h3>
                <p className="text-sm mb-1">Monday - Friday: 11:00 - 22:00</p>
                <p className="text-sm">Saturday - Sunday: 11:00 - 22:00</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Social Media</h3>
                <div className="flex items-center gap-4">
                  {[
                    { href: "https://www.facebook.com/grazlefb/", Icon: FaFacebookF },
                    { href: "https://x.com/GrazleHomeware", Icon: FaTwitter },
                    { href: "https://www.instagram.com/homewarebygrazle", Icon: AiFillInstagram },
                    { href: "https://www.linkedin.com/company/grazle", Icon: FaPinterestP },
                  ].map(({ href, Icon }, index) => (
                    <a
                      key={index}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 w-10 rounded-full bg-[#F70000] flex items-center justify-center hover:bg-[#D60000] transition-colors duration-300"
                    >
                      <Icon className="text-lg" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}