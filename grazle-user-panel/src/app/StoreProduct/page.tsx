"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Main from "@/assets/Rectangle 2020.png";
import logo from "@/assets/Grazle Logo.png";
import Card1 from "@/assets/a5a6296b2158604a47215a2b0a00bde0.png";
import { PiSealCheckFill } from "react-icons/pi";
import { FaAngleDown, FaStar } from "react-icons/fa6";
import { IoSearchOutline } from "react-icons/io5";
import Star from "@/assets/Star 1.png";
import Cart from "@/assets/CartVector.png";
import Like from "@/assets/Frame 1820551183.png";
import { Checkbox, Radio } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { getBrandDetails } from "@/apis";
import ProductCard from "@/components/ProductCard";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
export default function StoreProduct() {
  const [isChecked, setIsChecked] = useState(false);

  const handleRadioChange = () => {
    setIsChecked(!isChecked);
  };
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [currentStore, setCurrentStore] = useState({});
  const [storeProduct, setStoreProduct] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("name");

  const toggleCard = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      isOpen &&
      cardRef.current &&
      !cardRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  const id = useSearchParams().get("id");

  useEffect(() => {
    (async () => {
      if (!id) return;
      const res = await getBrandDetails(id);
      setCurrentStore(res.data.store);
      setStoreProduct(res.data.products);
    })();
  }, [id]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const clearSort = () => {
    setSortCriteria("");
    setIsOpen(false);
  };

  useEffect(() => {
    const sortProducts = () => {
      let sortedArray = [...storeProduct];
      switch (sortCriteria) {
        case "name":
          sortedArray.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "priceLowToHigh":
          sortedArray.sort((a, b) => a.price - b.price);
          break;
        case "priceHighToLow":
          sortedArray.sort((a, b) => b.price - a.price);
          break;
        case "rating":
          sortedArray.sort((a, b) => b.rating - a.rating);
          break;
        case "discount":
          sortedArray.sort((a, b) => b.discount - a.discount);
          break;
        case "latestArrival":
          sortedArray.sort(
            (a, b) => new Date(b.arrivalDate) - new Date(a.arrivalDate)
          );
          break;
        case "topRated":
          sortedArray.sort((a, b) => b.rating - a.rating);
          break;
        default:
          break;
      }
      setStoreProduct(sortedArray);
    };

    sortProducts();
  }, [sortCriteria]);

  return (
    <div className="lg:my-[50px] my-[20px] sm:my-[20px] md:my-[30px] lg:mx-[150px] mx-[20px] sm:mx-[20px] md:mx-[30px]">
      <div className="relative w-[100%] h-[250px]">
        <div className="relative w-full h-[150px] sm:h-[200px] md:h-[250px] lg:h-[300px] overflow-hidden">
          <div className="absolute inset-0 bg-white rounded-2xl border-[.5px] shadow-md">
            {currentStore.image && (
              <Image
                src={currentStore.image}
                alt="Store Banner"
                layout="fill"
                objectFit="cover"
                className="rounded-2xl"
                priority
              />
            )}
          </div>
        </div>
        <div
          className="absolute left-1/2 transform -translate-x-1/2"
          style={{ top: "calc(50% - -50px)" }}
        >
          <div className="w-[190px] h-[190px] flex justify-center items-center rounded-2xl  border-[.5px] border-[#F70000]  duration-300">
            {currentStore.image && (
              <Image
                width={190}
                height={190}
                src={currentStore.image}
                alt="Logo"
                className="w-full h-full object-fill rounded-2xl"
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center mt-[150px]">
        <div className="flex  items-center">
          <p className="text-[24px] font-semibold">{currentStore.store_name}</p>
          <PiSealCheckFill className="text-[#F70000] text-[24px] ml-2" />
        </div>
        <div className="flex mt-4  items-center justify-center gap-6">
          <div>
            <div className="flex  items-center gap-2">
              <FaStar className="text-[16px] text-[#FF7A00]" />
              <p className="text-[20px] font-semibold">
                {currentStore.store_rating}{" "}
              </p>
              <p className="text-[18px] font-medium ml-2 text-[#777777]">
                ({currentStore.store_reviews})
              </p>
            </div>
            <p className="text-[14px] font-medium text-[#777777]">Ratings</p>
          </div>
          <div className="border-l-[2px] border-[#777777] h-[30px]"></div>
          <div>
            <div className="flex  items-center gap-2">
              <p className="text-[20px] font-semibold align-baseline">
                {currentStore.store_products}
              </p>
            </div>
            <p className="text-[14px] font-medium text-[#777777]">Products</p>
          </div>
        </div>
        <div className="flex mt-4 justify-center">
          <div
            className="border-[1px]  rounded-lg p-2 w-[370px] flex mt-4 justify-between items-center border-[#777777]"
            onClick={toggleCard}
            ref={cardRef}
          >
            <p className="text-[16px] font-medium">Sort by</p>
            <FaAngleDown className="text-[#777777]  text-[16px]" />
          </div>
          {isOpen && (
            <div className="absolute z-50 mt-[60px] p-3 w-[370px] border-[1px] rounded-lg p-4 bg-white shadow-lg">
              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-2 text-[13px] font-[500] flex items-center gap-2 cursor-pointer"
                  onClick={() => setSortCriteria("rating")}
                >
                  {sortCriteria === "rating" ? (
                    <ImCheckboxChecked className="w-[20px] h-[20px] text-[red]" />
                  ) : (
                    <ImCheckboxUnchecked className="w-[20px] h-[20px] text-gray-400" />
                  )}
                  Rating
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-2  text-[13px] font-[500] flex items-center gap-2 cursor-pointer"
                  onClick={() => setSortCriteria("name")}
                >
                  {sortCriteria === "name" ? (
                    <ImCheckboxChecked className="w-[20px] h-[20px] text-[red]" />
                  ) : (
                    <ImCheckboxUnchecked className="w-[20px] h-[20px] text-gray-400" />
                  )}
                  Name
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-2  text-[13px] font-[500] flex items-center gap-2 cursor-pointer"
                  onClick={() => setSortCriteria("priceLowToHigh")}
                >
                  {sortCriteria === "priceLowToHigh" ? (
                    <ImCheckboxChecked className="w-[20px] h-[20px] text-[red]" />
                  ) : (
                    <ImCheckboxUnchecked className="w-[20px] h-[20px] text-gray-400" />
                  )}
                  <p className="flex items-center gap-3">Price low to high</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-2  text-[13px] font-[500] flex items-center gap-2 cursor-pointer"
                  onClick={() => setSortCriteria("priceHighToLow")}
                >
                  {sortCriteria === "priceHighToLow" ? (
                    <ImCheckboxChecked className="w-[20px] h-[20px] text-[red]" />
                  ) : (
                    <ImCheckboxUnchecked className="w-[20px] h-[20px] text-gray-400" />
                  )}
                  <p className="flex items-center gap-3">Price high to low</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-2 text-[13px] font-[500] flex items-center gap-2 cursor-pointer"
                  onClick={() => setSortCriteria("discount")}
                >
                  {sortCriteria === "discount" ? (
                    <ImCheckboxChecked className="w-[20px] h-[20px] text-[red]" />
                  ) : (
                    <ImCheckboxUnchecked className="w-[20px] h-[20px] text-gray-400" />
                  )}
                  Discount
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-2 text-[13px] font-[500] flex items-center gap-2 cursor-pointer"
                  onClick={() => setSortCriteria("latestArrival")}
                >
                  {sortCriteria === "latestArrival" ? (
                    <ImCheckboxChecked className="w-[20px] h-[20px] text-[red]" />
                  ) : (
                    <ImCheckboxUnchecked className="w-[20px] h-[20px] text-gray-400" />
                  )}
                  Latest Arrival
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-2 text-[13px] font-[500] flex items-center gap-2 cursor-pointer"
                  onClick={() => setSortCriteria("topRated")}
                >
                  {sortCriteria === "topRated" ? (
                    <ImCheckboxChecked className="w-[20px] h-[20px] text-[red]" />
                  ) : (
                    <ImCheckboxUnchecked className="w-[20px] h-[20px] text-gray-400" />
                  )}
                  Top Rated
                </div>
              </div>
              <div
                  className="px-3 py-2 text-[13px] font-[500] flex items-center gap-2 cursor-pointer text-red-500 hover:bg-gray-100"
                  onClick={clearSort}
                >
                  Clear Sort
                </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-6 lg:p-10 overflow-x-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
        {storeProduct?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
