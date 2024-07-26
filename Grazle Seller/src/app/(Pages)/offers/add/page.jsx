"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePageNavigation } from "../../../../features/features";
import Image from "next/image";
import Navbar from "../../../../components/navbar";
import Sidebar from "../../../../components/sidebar";
import SearchOnTop from "../../../../components/SearchOnTop";

import cancel from "../../../../assets/svgs/cancel.svg";
import submit from "../../../../assets/svgs/submit.svg";
import { Radio } from "antd";
import { axiosPrivate } from "../../../../axios/index";
import { toast } from "react-toastify";

const AddOffers = () => {
  const dispatch = useDispatch();
  const [allCategories, setAllCategories] = useState([]);
  const [value, setValue] = useState("");
  const [isPending, setPending] = useState(false);

  useEffect(() => {
    dispatch(updatePageNavigation("offers"));
  }, [dispatch]);

  useEffect(() => {
    const getAllCategories = async () => {
      const { data } = await axiosPrivate.get("/global/categories", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      !allCategories.length && setAllCategories(data?.categories); // to show data on web
    };
    getAllCategories();
  }, []);
  const onChange = (e) => {
    setValue(e.target.value);
  };
  async function onCreateOffer(formdata) {
    try {
      setPending(true);
      await axiosPrivate.post("/vendor/create-offer", formdata, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success("Feedback given....");
    } catch (error) {
      toast.error("something went wrong");
    } finally {
      setTimeout(() => {
        setPending(false);
      }, 700);
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 mt-[30px] px-[22px]">
          <SearchOnTop />
          <form
            action={onCreateOffer}
            className="my-[20px] px-[20px] py-[30px] bg-white rounded-[8px] shadow-sm"
          >
            <p className="text-[21px] font-[600]">Add New Offer</p>

            <div className="flex flex-col gap-5 pb-2 mt-5">
              <div className="flex flex-col gap-1">
                <label className="text-[#777777]">Offer Title</label>
                <input
                  name="title"
                  required
                  placeholder="Offer Title"
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#777777]">Description</label>
                <input
                  placeholder="Description"
                  name="description"
                  required
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>

              {/* <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Product Category</label>
                <select
                  name="category_id"
                  required
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px] text-[var(--text-color-body)]"
                >
                  <option selected disabled>
                    Select an option
                  </option>
                  {allCategories?.map((item) => (
                    <option key={item?.id} value={item?.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div> */}

              <div className="flex flex-col gap-1">
                <label className="text-[#777777]">Discount Type</label>
                <Radio.Group
                  className="custom-radio-group"
                  buttonStyle="outline"
                  onChange={onChange}
                  value={value}
                  name="discount_type"
                  required
                >
                  <Radio value="percentage">Percentage</Radio>
                  <Radio value="fixed">Fixed</Radio>
                </Radio.Group>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#777777]">Discount Value</label>
                <input
                  type="number"
                  name="discount_value"
                  required
                  placeholder="Discount Value"
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-5">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[#777777]">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    required
                    placeholder="Start Date"
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[#777777]">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    required
                    placeholder="End Date"
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-5 mt-5 flex-col sm:flex-row items-center sm:items-start">
                <button
                  disabled={isPending}
                  type="submit"
                  className="h-[50px] rounded-[8px] bg-[#FE4242]  text-white font-[500] w-[200px] mt-10 disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none"
                >
                  Submit
                </button>{" "}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOffers;
