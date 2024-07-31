"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";

const LikeButton = ({ productId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isStateChanged, setIsStateCHanged] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const favoriteProducts = JSON.parse(
      localStorage.getItem("favoriteProducts") || "[]"
    );
    setFavoriteProducts(favoriteProducts);

    const checkLiked = favoriteProducts.includes(productId);
    setIsLiked(checkLiked);
  }, [productId, isStateChanged]);

  //   setIsLiked(isLiked);

  const onLike = () => {
    if (!favoriteProducts.includes(productId)) {
      localStorage.setItem(
        "favoriteProducts",
        JSON.stringify([...favoriteProducts, productId])
      );
      setIsStateCHanged(!isStateChanged);
    }
  };

  const onUnlike = () => {
    if (favoriteProducts.includes(productId)) {
      let filterArray = favoriteProducts.filter(
        (itemId) => itemId !== productId
      );
      localStorage.setItem("favoriteProducts", JSON.stringify(filterArray));
      // setIsLiked(false);
      setIsStateCHanged(!isStateChanged);
    }
  };

  return (
    <div>
      {isLiked ? (
        <button onClick={onUnlike}>
          <FaHeart className="text-red-500 size-6" />
        </button>
      ) : (
        <button className="" onClick={onLike}>
          <FaHeart className="text-gray-400 size-6" />
        </button>
      )}
    </div>
  );
};

export default LikeButton;
