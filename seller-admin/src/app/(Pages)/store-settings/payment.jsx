import React, { useEffect, useState } from "react";
import { BiLoader } from "react-icons/bi";
import { axiosPrivate } from "../../../axios";
import { toast } from "react-toastify";

const Payment = () => {
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    account_number: "",
    account_name: "",
    bank_name: "",
    bank_code: "",
  });
  const [files, setFiles] = useState({
    business_license: null,
    tax_id: null,
    proof_of_address: null,
  });

  const changeHandler = (e) => {
    setBankDetails({
      ...bankDetails,
      [e.target.name]: e.target.value,
    });
  };

  const fileChangeHandler = (e) => {
    setFiles({
      ...files,
      [e.target.name]: e.target.files[0],
    });
  };

  useEffect(() => {
    fetchStoreProfile();
  }, []);

  const fetchStoreProfile = async () => {
    try {
      const { data } = await axiosPrivate.get("/store-profile", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (data?.user?.store_profile) {
        const profile = data.user.store_profile;
        setBankDetails({
          account_number: profile.account_number || "",
          account_name: profile.account_name || "",
          bank_name: profile.bank_name || "",
          bank_code: profile.bank_code || "",
        });
        // Store file names or URLs
        setFiles({
          business_license: profile.business_license || null,
          tax_id: profile.tax_id || null,
          proof_of_address: profile.proof_of_address || null,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch store profile");
    }
  };

  const extractFileName = (fileOrUrl) => {
    if (!fileOrUrl) return "No file chosen";
    if (fileOrUrl instanceof File) return fileOrUrl.name;
    if (typeof fileOrUrl === 'string') {
      const parts = fileOrUrl.split('/');
      const fullFileName = parts[parts.length - 1];
      return fullFileName.replace(/^\d+-\d+-/, '');
    }
    return "Unknown file";
  };

  const updateStoreAccountDetails = async () => {
    setLoading(true);
    const formData = new FormData();
    Object.keys(bankDetails).forEach((key) => {
      if (bankDetails[key]) {
        formData.append(key, bankDetails[key]);
      }
    });
    Object.keys(files).forEach((key) => {
      if (files[key]) {
        if (files[key] instanceof File) {
          formData.append(key, files[key]);
        } else if (typeof files[key] === 'string') {
          // If it's a string (URL), we don't need to append it to formData
          // The backend should keep the existing file if no new file is uploaded
        }
      }
    });

    try {
      const { data } = await axiosPrivate.put("/store-profile", formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
      if (data?.success) {
        toast.success("Account Info updated successfully");
        fetchStoreProfile(); // Refetch the profile to ensure we have the latest data
      } else {
        toast.error("Failed to update account info: " + (data?.message || "Unknown error"));
      }
    } catch (error) {
      toast.error("Failed to update account info: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-[20px]">
      <p className="text-[20px] font-[500]">Payment</p>
      <p className="text-[17px] text-[var(--text-color-body)] mt-2">
        Your earnings will be paid out monthly if they reach at least ₹100.00.
      </p>
      <p className="text-[20px] font-[500] mt-7">Bank Details</p>
      <div className="flex flex-col gap-5 pb-5 mt-5">
        <InputField
          label="Account Name"
          name="account_name"
          value={bankDetails.account_name}
          onChange={changeHandler}
        />
        <InputField
          label="Account Number"
          name="account_number"
          value={bankDetails.account_number}
          onChange={changeHandler}
        />
        <InputField
          label="Bank Name"
          name="bank_name"
          value={bankDetails.bank_name}
          onChange={changeHandler}
        />
        <InputField
          label="Bank Code"
          name="bank_code"
          value={bankDetails.bank_code}
          onChange={changeHandler}
        />
        <FileInputField
          label="Business License"
          name="business_license"
          onChange={fileChangeHandler}
          fileName={extractFileName(files.business_license)}
        />
        <FileInputField
          label="Tax ID"
          name="tax_id"
          onChange={fileChangeHandler}
          fileName={extractFileName(files.tax_id)}
        />
        <FileInputField
          label="Proof of Address"
          name="proof_of_address"
          onChange={fileChangeHandler}
          fileName={extractFileName(files.proof_of_address)}
        />
        <button
          className="h-[50px] rounded-[8px] bg-[#FE4242] flex items-center justify-center text-white font-[500] w-[200px] mt-10 disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none"
          onClick={updateStoreAccountDetails}
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

const FileInputField = ({ label, name, onChange, fileName }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[#777777]">{label}</label>
    <div className="flex items-center">
      <input
        type="file"
        name={name}
        onChange={onChange}
        className="hidden"
        id={name}
      />
      <label
        htmlFor={name}
        className="cursor-pointer bg-[#FE4242] text-white border border-gray-300 px-4 py-2 rounded-l-md w-44"
      >
        Choose File
      </label>
      <span className="border border-gray-300 rounded-r-md px-4 py-2 w-full truncate">
        {fileName}
      </span>
    </div>
  </div>
);

export default Payment;