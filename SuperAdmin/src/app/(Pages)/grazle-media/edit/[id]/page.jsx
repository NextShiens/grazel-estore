"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePageNavigation } from "@/features/features";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { FaCamera } from "react-icons/fa6";
import { IoMdRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";
import { axiosPrivate } from "@/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const EditGrazleMedia = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibility, setVisibility] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    position: "",
    banner_image: null,
    hyperlink: "",
  });

  useEffect(() => {
    dispatch(updatePageNavigation("grazle-media"));
    const id = window.location.pathname.split("/").pop();
    if (id) {
      fetchBanner(id);
    }
  }, [dispatch]);

  const fetchBanner = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosPrivate.get(`/admin/banners/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const banner = response.data?.banner;
      setFormData({
        title: banner.title,
        position: banner.position,
        banner_image: null,
        hyperlink: banner.hyperlink || "",
      });
      setImagePreview(banner.image);
      setVisibility(banner.is_visible ? "show" : "hide");
    } catch (err) {
      console.error("Error fetching banner:", err);
      setError("Failed to fetch banner. Please try again.");
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      banner_image: file,
    }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const submitFormData = new FormData();
    if (formData.banner_image) {
      submitFormData.append("banner_image", formData.banner_image);
    }
    submitFormData.append("position", formData.position);
    submitFormData.append("title", formData.title);
    submitFormData.append("hyperlink", formData.hyperlink);
    submitFormData.append("is_visible", visibility === "show");

    try {
      const id = window.location.pathname.split("/").pop();
      await axiosPrivate.put(`/admin/banners/${id}`, submitFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Banner updated successfully");
      router.push("/grazle-media");
    } catch (err) {
      console.error("Error updating banner:", err);
      setError("Failed to update banner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 mt-[30px] px-[10px] sm:px-[22px]">
          <div className="bg-white shadow-sm rounded-[8px] p-[10px] sm:p-[25px]">
            <p className="text-[24px] font-[600]">Edit Banner</p>
            <form className="mt-[20px] flex flex-col gap-5" onSubmit={onSubmit}>
              <div className="flex flex-col gap-1">
                <label className="text-[var(--text-color-body)]">
                  Banner Name
                </label>
                <input
                  placeholder="Banner Name"
                  className="border border-gray-200 rounded-[8px] h-[45px] text-[15px] px-3 focus:outline-none focus:border-gray-400"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[var(--text-color-body)]">
                  Image Upload
                </label>
                <div className="h-[180px] rounded-[10px] border-[2px] border-dashed border-blue-100 bg-[#F8F8FF] flex items-center justify-center flex-col relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="banner-image"
                  />
                  {imagePreview ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={imagePreview}
                        alt="Banner preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <label
                      htmlFor="banner-image"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <FaCamera className="h-[40px] w-[45px] text-[var(--text-color-body)] mb-4" />
                      <p className="font-[500] text-[13px] text-center">
                        <span className="underline text-[var(--text-color)]">
                          Browse
                        </span>
                      </p>
                     
                    </label>
                  )}
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prevData) => ({
                          ...prevData,
                          banner_image: null,
                        }));
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[var(--text-color-body)]">
                  Hyperlink
                </label>
                <input
                  placeholder="https://example.com/summer-sale"
                  className="border border-gray-200 rounded-[8px] h-[45px] text-[15px] px-3 focus:outline-none focus:border-gray-400"
                  name="hyperlink"
                  value={formData.hyperlink}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[var(--text-color-body)]">
                  Display Order
                </label>
                <input
                  placeholder="Enter display order"
                  className="border border-gray-200 rounded-[8px] h-[45px] text-[15px] px-3 focus:outline-none focus:border-gray-400"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                  type="number"
                  min="1"
                  max="5"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[var(--text-color-body)]">
                  Visibility
                </label>
                <div className="flex gap-10 sm:gap-32 mt-1">
                  <div
                    className={`flex items-center gap-2 cursor-pointer ${
                      visibility === "show"
                        ? "text-[var(--text-color)]"
                        : "text-[var(--text-color-body)]"
                    }`}
                    onClick={() => setVisibility("show")}
                  >
                    {visibility === "show" ? (
                      <IoMdRadioButtonOn className="w-[20px] h-[20px]" />
                    ) : (
                      <IoMdRadioButtonOff className="w-[20px] h-[20px]" />
                    )}
                    Show
                  </div>
                  <div
                    className={`flex items-center gap-2 cursor-pointer ${
                      visibility === "hide"
                        ? "text-[var(--text-color)]"
                        : "text-[var(--text-color-body)]"
                    }`}
                    onClick={() => setVisibility("hide")}
                  >
                    {visibility === "hide" ? (
                      <IoMdRadioButtonOn className="w-[20px] h-[20px]" />
                    ) : (
                      <IoMdRadioButtonOff className="w-[20px] h-[20px]" />
                    )}
                    Hide
                  </div>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="h-[50px] px-[20px] sm:px-[80px] w-[max-content] bg-[#FE4242] rounded-[8px] font-[500] text-white my-3 cursor-pointer border border-[#FE4242] hover:bg-transparent transition-all duration-100 hover:text-[#FE4242]"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Banner"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditGrazleMedia;