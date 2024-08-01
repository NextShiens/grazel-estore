// src/app/(Pages)/products/Manage.jsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Rating from "../../../components/Rating";
import fvrtIcon from "../../../assets/svgs/Favourite-icon.svg";
// import fvrtIconFilled from "../../../assets/svgs/Favourite-icon-filled.svg"; // Import filled favorite icon
// import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
// import FavoriteIcon from '@mui/icons-material/Favorite';
const Manage = ({ allProducts, setSelectedTab, setProduct, searchTerm }) => {
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites((prevFavorites) => ({
      ...prevFavorites,
      [id]: !prevFavorites[id],
    }));
  };

  const filteredProducts = allProducts.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex gap-5 flex-wrap pb-[30px]">
      {filteredProducts.map(item => (
        <div
          key={item.id}
          className="w-[340px] bg-white rounded-[8px] shadow-sm pb-[20px]"
        >
          <div className="rounded-[8px] flex justify-center pt-[20px] pb-[15px]">
            <Image
              alt={item.title}
              width={290}
              height={290}
              src={item?.featured_image || 'https://via.placeholder.com/290x290?text=No+Image+Available'}
              onError={(e) => {
                console.error('Image failed to load:', e);
                e.target.src = 'https://via.placeholder.com/290x290?text=No+Image+Available';
              }}
              className="h-[290px] rounded-[8px] object-contain"
            />
          </div>
          <div className="px-[20px] flex">
            <div className="flex flex-col gap-0.5 flex-1">
              <p className="font-[600] text-[17px]">
                {item.title.toUpperCase()}
              </p>
              <p
                className={`${item.discount ? "line-through" : ""} text-[var(--price-color)] text-[15px] font-[600]`}
              >
                ₹ {item.price}
              </p>
              {item.discount && (
                <p className="text-[var(--price-color)] text-[15px] font-[600]">
                  ₹ {item.discounted_price}
                </p>
              )}
              <div className="flex gap-0.5 mt-1 items-center">
                <Rating value={item.rating || 0} size="small" />
                ({item.reviews || 0})
              </div>
              <button
                onClick={() => {
                  setSelectedTab("edit");
                  setProduct(item);
                }}
                className="bg-[#E2EAF8] rounded-[8px] text-[14px] font-[600] h-[38px] w-[max-content] px-[13px] mt-[20px]"
              >
                Edit Product
              </button>
            </div>
            {/* <div className="flex items-center">
              <Image
                alt="fvrtIcon"
                src={favorites[item.id] ? fvrtIcon : fvrtIcon} // Switch between filled and empty icon
                onClick={() => toggleFavorite(item.id)}
                className="cursor-pointer"
              />
            </div> */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Manage;
