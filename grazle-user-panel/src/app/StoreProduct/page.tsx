"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PiSealCheckFill } from "react-icons/pi";
import { FaAngleDown, FaStar } from "react-icons/fa6";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import { useSearchParams } from "next/navigation";
import { getBrandDetails } from "@/apis";
import ProductCard from "@/components/ProductCard";

export default function StoreProduct() {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef(null);
  const [currentStore, setCurrentStore] = useState({});
  const [storeProduct, setStoreProduct] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("name");

  const id = useSearchParams().get("id");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const res = await getBrandDetails(id);
      setCurrentStore(res.data.store);
      setStoreProduct(res.data.products);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortOptions = [
    { value: "rating", label: "Rating" },
    { value: "name", label: "Name" },
    { value: "priceLowToHigh", label: "Price: Low to High" },
    { value: "priceHighToLow", label: "Price: High to Low" },
    { value: "discount", label: "Discount" },
    { value: "latestArrival", label: "Latest Arrival" },
    { value: "topRated", label: "Top Rated" },
  ];

  const sortProducts = () => {
    const sortedArray = [...storeProduct].sort((a, b) => {
      switch (sortCriteria) {
        case "name":
          return a.title.localeCompare(b.title);
        case "priceLowToHigh":
          return a.price - b.price;
        case "priceHighToLow":
          return b.price - a.price;
        case "rating":
        case "topRated":
          return b.rating - a.rating;
        case "discount":
          return b.discount - a.discount;
        case "latestArrival":
          return new Date(b.arrivalDate) - new Date(a.arrivalDate);
        default:
          return 0;
      }
    });
    setStoreProduct(sortedArray);
  };

  useEffect(sortProducts, [sortCriteria]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="relative mb-24 sm:mb-32">
        <div className="h-32 sm:h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden shadow-lg">
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
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 sm:-bottom-20">
          <div className="w-32 h-32 sm:w-40 sm:h-40 flex justify-center items-center rounded-2xl border-2 border-[#F70000] bg-white shadow-md">
            {currentStore.image && (
              <Image
                width={150}
                height={150}
                src={currentStore.image}
                alt="Logo"
                className="rounded-xl object-contain"
              />
            )}
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mr-2">{currentStore.store_name}</h1>
          <PiSealCheckFill className="text-[#F70000] text-xl sm:text-2xl" />
        </div>
        <div className="flex justify-center items-center space-x-4 sm:space-x-6 mb-4">
          <div>
            <div className="flex items-center">
              <FaStar className="text-[#FF7A00] mr-1" />
              <span className="font-semibold">{currentStore.store_rating}</span>
              <span className="text-gray-500 ml-1 text-sm">({currentStore.store_reviews})</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Ratings</p>
          </div>
          <div className="h-8 border-l border-gray-300"></div>
          <div>
            <p className="font-semibold">{currentStore.store_products}</p>
            <p className="text-xs sm:text-sm text-gray-500">Products</p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-xs" ref={cardRef}>
            <button
              className="border border-gray-300 rounded-full py-2 px-4 w-full flex justify-between items-center text-sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="truncate">
                {sortOptions.find(option => option.value === sortCriteria)?.label || 'Sort by'}
              </span>
              <FaAngleDown className="text-gray-500 ml-2 flex-shrink-0" />
            </button>
            {isOpen && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {sortOptions.map((option) => (
                  <div
                    key={option.value}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center text-sm"
                    onClick={() => {
                      setSortCriteria(option.value);
                      setIsOpen(false);
                    }}
                  >
                    {sortCriteria === option.value ? (
                      <ImCheckboxChecked className="w-4 h-4 text-[#F70000] mr-2 flex-shrink-0" />
                    ) : (
                      <ImCheckboxUnchecked className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                ))}
                <div
                  className="px-4 py-2 text-[#F70000] hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    setSortCriteria("");
                    setIsOpen(false);
                  }}
                >
                  Clear Sort
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {storeProduct?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}