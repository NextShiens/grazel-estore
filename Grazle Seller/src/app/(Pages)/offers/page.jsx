"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { updatePageLoader, updatePageNavigation } from "../../../features/features";

import Navbar from "../../../components/navbar";
import Sidebar from "../../../components/sidebar";
import SearchOnTop from "../../../components/SearchOnTop";

import offerImg from "../../../assets/offer-img.png";
// import fillStar from "@/assets/svgs/Star.svg";
// import grayStar from "@/assets/svgs/Gray-Star.svg";
// import fvrtIcon from "@/assets/svgs/Favourite-icon.svg";
import whiteStar from "../../../assets/svgs/white-star.svg";
import offerLike from "../../../assets/svgs/offer-like.svg";
import Link from "next/link";
import { axiosPrivate } from "../../../axios/index";

import editButton from "../../../assets/svgs/edit-button.svg";
import deleteButton from "../../../assets/svgs/delete-button.svg";
import { toast } from "react-toastify";
import Loading from "../../../components/loading";

const Offers = () => {
  const dispatch = useDispatch();
  const [offers, setOffers] = useState([]);
  console.log(offers);
  useEffect(() => {
    const getAllOffers = async () => {
      const { data } = await axiosPrivate.get("/vendor/offers", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      !offers?.length && setOffers(data?.data); // to show data on web
    };
    getAllOffers();
  }, []);
  async function onDelete(id) {
    try {
      await axiosPrivate.delete("/vendor/offers/" + id, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success("Offer has been deleted....");
    } catch (error) {
      toast.error("something went wrong");
    }
  }
  useEffect(() => {
    dispatch(updatePageLoader(false))
    dispatch(updatePageNavigation("offers"));
  }, [dispatch]);
  return (
    <>
    <Loading />
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 mt-[30px] px-[22px]">
          <div className="flex  items-center justify-between">
            <div className="w-[70%] mr-2">
              <SearchOnTop />
            </div>
            <Link href="/offers/add">
              <button className="h-[50px] rounded-[8px] bg-[#FE4242]  text-white font-[500] w-[150px]">
                Add Offer
              </button>
            </Link>
          </div>
          <div className="mt-[20px] bg-white rounded-[8px] shadow-sm p-[30px] grid lg:grid-cols-2 gap-9">
            {!offers?.length && (
              <h1 className="text-xl text-center text-red-500 ">
                No offers exist
              </h1>
            )}

            {offers?.map((item) => (
              <OfferBox key={item?.id} item={item} onDelete={onDelete} />
            ))}
          </div>
          {/* <div className="flex gap-5 flex-wrap py-[30px]">
            {offers?.map((item, index) => (
              <div key={index} className="w-[340px] bg-white rounded-[8px] shadow-sm pb-[20px]">
                <div className="rounded-[8px] flex justify-center pt-[10px] pb-[15px] flex-col relative">
                  <Image
                    alt=""
                    src={offerImg}
                    className="h-[260px] rounded-[8px] object-cover w-[100%] px-[10px]"
                  />
                  <div className="px-[17px] absolute w-[340px] top-[17px] flex justify-between">
                    <div className="font-[300] flex gap-1 items-center bg-[#F69B26] w-[max-content] px-[5px] py-[3px] rounded-[7px] text-white">
                      4.8 (342)
                      <Image alt="" src={whiteStar} className="mt-[-2px]" />
                    </div>
                    <Image alt="" src={offerLike} />
                  </div>
                </div>
                <div className="px-[20px]">
                  <p className="capitalize text-[20px] text-center">
                    capttain pure by kapil dev xtra pure 18
                  </p>
                  <p className="mt-[17px] mb-[5px] text-center text-[32px] font-[600]">
                    ₹400{" "}
                  </p>
                  <p className="text-[var(--text-color-body)] text-[25px] text-center">
                    <span className="line-through">₹400</span>
                    &nbsp;&nbsp;
                    <span className="text-[#4FAD2E] font-[600]">20% off</span>
                  </p>
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </div>
    </>
  );
};

export default Offers;

const OfferBox = ({ item, onDelete }) => {
  return (
    <div
      key={item?.id}
      className="border border-gray-200 rounded-[8px] px-[30px] py-[20px]"
    >
      <p className="text-[19px] sm:text-[23px] font-[500]">
        {item?.description}
      </p>
      <p className="text-[15px] sm:text-[19px] mt-1">
        Up to {item?.discount_type === "fixed" && "₹"}
        {item?.discount_value}
        {item?.discount_type === "percentage" && "%"} off!
      </p>
      <p className="text-[15px] sm:text-[19px] mt-1">
        Valid up to {new Date(item?.end_date).toDateString()}
      </p>
      <div className="mt-8 flex justify-end gap-3">
        {/* <Image
          alt=""
          src={editButton}
          className="w-[75px] sm:h-[36px] sm:w-[100px] cursor-pointer"
        /> */}
        <Image
          alt=""
          src={deleteButton}
          onClick={() => onDelete(item?.id)}
          className="w-[75px] sm:h-[36px] sm:w-[100px] cursor-pointer"
        />
      </div>
    </div>
  );
};
