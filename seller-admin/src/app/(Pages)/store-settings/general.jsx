import React, { useEffect, useState } from "react";
import Image from "next/image";

import uploadPhoto from "../../../assets/svgs/upload-photo.svg";
import saveChanges from "../../../assets/svgs/save-changes.svg";

import { IoMdCamera } from "react-icons/io";
import { axiosPrivate } from "../../../axios";
import { toast } from "react-toastify";
import { BiLoader } from "react-icons/bi";

const General = () => {
  const [storeLogo, setStoreLogo] = useState("");
  const fileInput = React.useRef(null);
  const [storeDescription, setStoreDescription] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeProfile, setStoreProfile] = useState();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      const { data } = await axiosPrivate.get("/store-profile", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setStoreName(data?.user.store_profile?.store_name);
      setStoreDescription(data?.user.store_profile?.store_description);
      setStoreProfile(data?.user.store_profile?.store_image);
    })();
  }, []);

  const openInputFile = () => {
    fileInput.current.click();
  };

  const updateStoreProfile = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("store_image", storeLogo);
    formData.append("store_description", storeDescription);
    formData.append("store_name", storeName);
    const { data } = await axiosPrivate.put("/store-profile", formData, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    setLoading(false);
    if (data?.success) toast.success("Profile updated successfully");
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
              src={URL.createObjectURL(storeLogo)}
            />
          ) : storeProfile ? (
            <Image
              className="w-full h-full rounded-full"
              width={50}
              height={50}
              src={storeProfile}
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
        {/* <Image alt="" src={uploadPhoto} className="cursor-pointer" /> */}
      </div>
      <div className="flex flex-col gap-5 pb-5">
        <div className="flex flex-col gap-1">
          <label className="text-[#777777]">Name</label>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            defaultValue={storeProfile?.store_name}
            placeholder="Store Name"
            className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[#777777]">Description</label>
          <textarea
            onChange={(e) => setStoreDescription(e.target.value)}
            value={storeDescription}
            defaultValue={storeProfile?.store_description}
            placeholder="Write about your store"
            className="focus:outline-none py-2 border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[100px] text-[15px]"
          />
        </div>
        <button
          className="h-[50px]  rounded-[8px] bg-[#FE4242] flex items-center justify-center  text-white font-[500] w-[200px] mt-10 disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none"
          onClick={updateStoreProfile}
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

export default General;
