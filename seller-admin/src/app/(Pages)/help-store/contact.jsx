import React, { useState, useEffect } from "react";
import axios from "axios";
import MessageSentSuccessfully from "../../../components/messageSentSuccessfully";
import { useRouter } from "next/navigation";
import Loading from "../../../components/loading";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formSubmit, setFormSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [loggedIn, setLoggedIn] = useState(true);
  const [loginChecked, setLoginChecked] = useState(false);
  const router = useRouter();

  const getLocalStorage = (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

  const token = getLocalStorage("token");

  useEffect(() => {
    handleCheckLogin();
  }, []);

  const handleCheckLogin = () => {
    if (!token) {
      setLoggedIn(false);
      router.push("/");
    } else {
      setLoggedIn(true);
    }
    setLoginChecked(true);
  };

  const handleChange = (e) => {
    if (!loggedIn) return;
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://api.grazle.co.in/api";

  const fn_submit = async (e) => {
    if (!loggedIn) return;
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/global/customer-support`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setShowMessage(true);

      if (response.status === 200) {
        setFormSubmit(true);
        setFormData({ name: "", email: "", message: "" });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  if (!loginChecked || !loggedIn) {
    return <Loading />;
  }
  return (
    <div className="bg-white px-[20px] py-[30px] shadow-sm rounded-[8px]">
      <p className="text-[20px] font-[600]">Contact Us</p>
      <div>
        <form className="mt-5 flex flex-col gap-5" onSubmit={fn_submit}>
          <div className="flex flex-col gap-1">
            <label className="text-[#777777]">Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[#777777]">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[#777777]">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write about your message"
              className="focus:outline-none border-[2px] border-gray-200 py-2 rounded-[8px] px-[15px] h-[120px] text-[15px]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="h-[50px] rounded-[8px] bg-[#FE4242] text-white font-[500] w-[220px] mt-5 cursor-pointer"
          >
            {isLoading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
      {showMessage && <MessageSentSuccessfully setFormSubmit={setShowMessage} />}
    </div>
  );
};

export default Contact;