import React, { useEffect, useState } from "react";
import Image from "next/image";

import saveChanges from "../../../assets/svgs/save-changes.svg";
import { BiLoader } from "react-icons/bi";
import { axiosPrivate } from "../../../axios";
import { toast } from "react-toastify";

const Payment = () => {
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    accountName: "",
    bankName: "",
    BankCode: "",
  });

  const changeHandler = (e) => {
    setBankDetails({
      ...bankDetails,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    (async () => {
      const { data } = await axiosPrivate.get("/store-profile", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setBankDetails({
        accountNumber: data?.user.store_profile?.account_number,
        accountName: data?.user.store_profile?.account_name,
        bankName: data?.user.store_profile?.bank_name,
        BankCode: data?.user.store_profile?.bank_code,
      });
    })();
  }, []);

  const updateStoreAccountDetails = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("account_name", bankDetails.accountName);
    formData.append("account_number", bankDetails.accountNumber);
    formData.append("bank_name", bankDetails.bankName);
    formData.append("bank_code", bankDetails.BankCode);

    const { data } = await axiosPrivate.put("/store-profile", formData, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    setLoading(false);
    console.log(data);
    if (data?.success) toast.success("Account Info updated successfully");
  };
  return (
    <div className="mt-[20px]">
      <p className="text-[20px] font-[500]">Payment</p>
      <p className="text-[17px] text-[var(--text-color-body)] mt-2">
        Your earnings will be paid out monthly if they reach at least ₹100.00.
      </p>
      <p className="text-[20px] font-[500] mt-7">Bank Details</p>
      <div className="flex flex-col gap-5 pb-5 mt-5">
        <div className="flex flex-col gap-1">
          <label className="text-[#777777]">Account Name</label>
          <input
            value={bankDetails.accountName}
            onChange={changeHandler}
            name="accountName"
            placeholder="Account Name"
            className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[#777777]">Account Number</label>
          <input
            value={bankDetails.accountNumber}
            onChange={changeHandler}
            name="accountNumber"
            placeholder="Account Number"
            className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[#777777]">Bank Name</label>
          <input
            value={bankDetails.bankName}
            onChange={changeHandler}
            name="bankName"
            placeholder="Bank Name"
            className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[#777777]">Bank Code</label>
          <input
            value={bankDetails.BankCode}
            onChange={changeHandler}
            name="BankCode"
            placeholder="Bank Code"
            className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
          />
        </div>
        <button
          className="h-[50px]  rounded-[8px] bg-[#FE4242] flex items-center justify-center  text-white font-[500] w-[200px] mt-10 disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none"
          onClick={updateStoreAccountDetails}
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

export default Payment;
