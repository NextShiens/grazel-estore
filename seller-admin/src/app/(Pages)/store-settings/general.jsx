import React, { useEffect, useState } from "react";
import Image from "next/image";
import { IoMdCamera } from "react-icons/io";
import { axiosPrivate } from "../../../axios";
import { toast } from "react-toastify";
import { BiLoader } from "react-icons/bi";

const General = () => {
  const [storeLogo, setStoreLogo] = useState("");
  const fileInput = React.useRef(null);
  const [storeProfile, setStoreProfile] = useState({
    store_name: "",
    store_description: "",
    store_image: "",
    store_about: "",
    store_url: "",
    gst: "",
    pan: "",
    city: "",
    state: "",
    pin_code: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await axiosPrivate.get("/store-profile", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setStoreProfile(data?.user.store_profile);
    })();
  }, []);

  const openInputFile = () => {
    fileInput.current.click();
  };

  const handleInputChange = (e) => {
    setStoreProfile({
      ...storeProfile,
      [e.target.name]: e.target.value,
    });
  };

  const updateStoreProfile = async () => {
    setLoading(true);
    const formData = new FormData();
    if (storeLogo) formData.append("store_image", storeLogo);
    Object.keys(storeProfile).forEach((key) => {
      formData.append(key, storeProfile[key]);
    });

    try {
      const { data } = await axiosPrivate.put("/store-profile", formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (data?.success) toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-[20px]">
      <p className="text-[20px] font-[500]">Logo</p>
      <div className="my-[30px] flex gap-10 items-center flex-col sm:flex-row">
        <div
          onClick={openInputFile}
          className="w-[110px] h-[110px] bg-[#d9dff3] border border-[#D6D6D6] rounded-full flex justify-center items-center"
        >
          {storeLogo ? (
            <Image
              className="w-full h-full rounded-full"
              width={50}
              height={50}
              src={URL?.createObjectURL(storeLogo)}
              alt="Store Logo"
            />
          ) : storeProfile.store_image ? (
            <Image
              className="w-full h-full rounded-full"
              width={50}
              height={50}
              src={storeProfile?.store_image || "https://via.placeholder.com/50x50?text=No+Image+Available"}
              onError={(e) => {
                console.error("Image failed to load:", e);
                e.target.src = "https://via.placeholder.com/50x50?text=No+Image+Available";
              }}
              alt="Store Logo"
            />
          ) : (
            <IoMdCamera className="text-gray-500 text-[40px]" />
          )}
        </div>
        <input
          onChange={(e) => {
            const filesArray = Array.from(e.target.files);
            setStoreLogo(filesArray[0]);
          }}
          type="file"
          className="hidden"
          ref={fileInput}
        />
      </div>
      <div className="flex flex-col gap-5 pb-5">
        <InputField
          label="Store Name"
          name="store_name"
          value={storeProfile.store_name}
          onChange={handleInputChange}
        />
        <TextAreaField
          label="Store Description"
          name="store_description"
          value={storeProfile.store_description}
          onChange={handleInputChange}
        />
        <TextAreaField
          label="Store About"
          name="store_about"
          value={storeProfile.store_about}
          onChange={handleInputChange}
        />
        <InputField
          label="Store URL"
          name="store_url"
          value={storeProfile.store_url}
          onChange={handleInputChange}
        />
        <InputField
          label="GST Number"
          name="gst"
          value={storeProfile.gst}
          onChange={handleInputChange}
        />
        <InputField
          label="PAN Number"
          name="pan"
          value={storeProfile.pan}
          onChange={handleInputChange}
        />
        <InputField
          label="City"
          name="city"
          value={storeProfile.city}
          onChange={handleInputChange}
        />
        <InputField
          label="State"
          name="state"
          value={storeProfile.state}
          onChange={handleInputChange}
        />
        <InputField
          label="PIN Code"
          name="pin_code"
          value={storeProfile.pin_code}
          onChange={handleInputChange}
        />
        <button
          className="h-[50px] rounded-[8px] bg-[#FE4242] flex items-center justify-center text-white font-[500] w-[200px] mt-10 disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none"
          onClick={updateStoreProfile}
          disabled={loading}
        >
          {loading ? (
            <BiLoader className="animate-spin h-6 w-6" />
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[#777777]">{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={label}
      className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[#777777]">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={label}
      className="focus:outline-none py-2 border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[100px] text-[15px]"
    />
  </div>
);

export default General;