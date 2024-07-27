"use client";
import Image from "next/image";
import heart from "@/assets/like.png";
import React, { useState } from "react";
import { FaHeart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import Cart from "@/assets/CartVector.png";
import { useRouter } from "next/navigation";
import { favoriteProductApi } from "@/apis";
import { updateCart } from "@/features/features";
import { IconButton, Rating } from "@mui/material";
import { calculateDiscountPercentage } from "@/utils";
import { calculateFinalPrice } from "@/utils/priceCalculation";
import Link from "next/link";
import { toast } from "react-toastify";
import LikeButton from "./LikeButton";

const ProductCard = ({
  product,
  width,
  offerId,
}: {
  product: any;
  width?: string;
  offerId?: string;
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isPending, setPending] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<number[]>([]);

  const { basePrice, price, discountInfo } = calculateFinalPrice(product, null);

  const goToDetail = () => {
    const id = product.id;
    if (typeof window !== "undefined") {
      const ids = localStorage.getItem("productIds")
        ? JSON.parse(localStorage.getItem("productIds")!)
        : [];

      if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem("productIds", JSON.stringify(ids));
      }
    }
    router.push("/detailProduct/" + id);
  };

  async function onLiked(
    e: React.MouseEvent<HTMLButtonElement>,
    productId: any
  ) {
    e.stopPropagation();
    if (isPending) return; //purpose : to avoid user from calling multiple api

    try {
      setPending(true);
      const formdata = new FormData();
      formdata.append("product_id", productId);
      const favoriteProductIds = [...favoriteProducts];
      if (favoriteProductIds.includes(productId)) {
        let filterArray = favoriteProductIds.filter(
          (itemId) => itemId !== productId
        );
        setFavoriteProducts(filterArray);
      } else {
        setFavoriteProducts([...favoriteProductIds, productId]);
      }
      await favoriteProductApi(formdata);
    } catch (error) {
      console.log("error in liking product");
    } finally {
      setTimeout(() => {
        setPending(false);
      }, 200);
    }
  }

  const onAddingCart = (e: any, product: any) => {
    e.stopPropagation();
    const updateProduct = {
      ...product,
      qty: 1,
      discountPrice: price,
      originalPrice: basePrice,
      discountInfo: discountInfo,
    };
    dispatch(updateCart({ type: null, product: updateProduct }));
    toast.success("Item has been added to cart!");
  };

  if (offerId) {
    if (offerId != product?.offer_id) return null;
  }

  return (
    <div
      // onClick={goToDetail}
      style={{
        boxShadow: "3px 4px 15.6px 0px rgba(0, 0, 0, 0.05)",
      }}
      className={`group ${
        width ? `lg:w-[${width}%]` : "lg:w-[20%]"
      } w-[100%] md:w-[100%] sm:w-[100%]  mt-[24px]  rounded-2xl hover:border-[1px] border-[#F70001] hh-[450px] relative`}
    >
      <Image
        alt=""
        width={303}
        height={303}
        src={"/" + product?.featured_image}
        className="w-full h-[203px] relative rounded-2xl"
      />

      <div className="flex w-full justify-between items-center absolute px-[16px] top-[10px]">
        <button
          style={{ backgroundColor: "rgba(247, 0, 0, 0.1)" }}
          className="text-[12px] font-semibold border-[1px] rounded-3xl border-[#F70000] text-[#F70000] w-[96px] h-[34px]"
        >
          {discountInfo?.toUpperCase() || `0% OFF`}
        </button>
        {/* <IconButton size="medium" onClick={(e) => onLiked(e, product?.id)}>
          {favoriteProducts?.includes(product?.id) ? (
            <FaHeart className="text-red-500" />
          ) : (
            <Image src={heart} alt="like" />
          )}
        </IconButton> */}
        <LikeButton productId={product?.id} />
      </div>

      <Link
        href={`/detailProduct/${product?.id}`}
        className="p-3 cursor-pointer"
      >
        <p className="text-[16px] w-[80%] font-semibold px-3">
          {product?.title}
        </p>
        <div className="flex items-center mt-[16px] px-3">
          <p className="text-[12px] text-[#F69B26] ">
            {product?.rating} ({product?.reviews > 0 ? product?.reviews : 0})
          </p>

          <Rating
            precision={0.5}
            name="read-only"
            readOnly
            mt-3
            defaultValue={Number(product?.rating)}
          />
        </div>

        <p
          className={`text-[20px] font-semibold mt-[16px] text-red-500  px-3
            `}
        >
          ₹{price}
        </p>

        <div className="flex items-center mt-[16px] px-3">
          <p className="text-[16px] text-[#909198] line-through font-normal">
            ₹{basePrice}
          </p>
          {/* 
          <p className="text-[16px] text-[#4FAD2E] ml-[24px] font-semibold">
            {discountInfo?.toUpperCase()}
            {""}
          </p> */}
        </div>
      </Link>

      <div className="flex justify-center  w-full">
        <button
          className="text-[#F70000] w-[90%] h-[40px] border-[1px] border-[#F70001] rounded-full"
          onClick={(e) => onAddingCart(e, product)}
        >
          <div className="flex items-center justify-center">
            <p className="font-semibold text-[14px]">Add to cart</p>
            <Image alt="" src={Cart} className="w-[17px] h-[17px] ml-[12px]" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
