"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { FaStar } from "react-icons/fa";
import { calculateFinalPrice } from "@/utils/priceCalculation";
import { updateCart } from "@/features/features";
import { toast } from "react-toastify";
import Cart from "@/assets/CartVector.png";
import LikeButton from "./LikeButton";

interface ProductCardProps {
  product: any;
  offerId?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, offerId }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [touchedProductId, setTouchedProductId] = useState<number | null>(null);

  const { basePrice, price, discountInfo } = calculateFinalPrice(product, null);

  const goToDetail = () => {
    router.push(`/detailProduct/${product.id}`);
  };

  const onAddingCart = (e: React.MouseEvent) => {
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

  if (offerId && offerId !== product?.offer_id) return null;

  return (
    <div
      className={`group lg:w-[98%] w-[95%] border mb-1 mt-1 lg:mt-[16px] rounded-2xl hover:border-[1px] border-[#b9b5b5] relative ${
        touchedProductId === product.id ? 'active' : ''
      }`}
      onClick={() => setTouchedProductId(product.id)}
    >
      <div
        onClick={goToDetail}
        className="cursor-pointer"
      >
        {product?.featured_image ? (
          <Image
            alt="Product Image"
            width={203}
            height={203}
            src={product.featured_image}
            className="w-full h-[160px] md:h-[170px] object-cover rounded-2xl cursor-pointer"
            onError={(e: any) => {
              console.error('Image failed to load:', e);
              e.target.src = '/path/to/fallback-image.jpg';
            }}
          />
        ) : (
          <div className="w-full h-[160px] md:h-[170px] bg-gray-200 rounded-2xl"></div>
        )}

        <div className="flex w-full justify-between items-center absolute px-[16px] top-[10px]">
          <div></div>
          <LikeButton productId={product?.id} />
        </div>

        <div className="p-2">
          <p className="text-[14px] md:text-[15px] w-[80%] font-semibold">
            {product?.title}
          </p>
          <div className="flex items-center mt-[4px] md:mt-[8px] gap-1">
            <span className="text-[8px] md:text-[10px] text-[#F69B26]">
              {product?.rating} ({product?.reviews})
            </span>
            <FaStar size={10} color="#F69B26" />
          </div>

          <p className="text-[12px] md:text-[18px] text-[#FC3030] font-semibold mt-[4px] md:mt-[8px]">
            ₹{typeof price === 'number' ? price.toFixed(2) : price}
          </p>

          <div className="flex items-center mt-[4px] md:mt-[8px]">
            <p className="text-[8px] md:text-[14px] text-[#909198] line-through font-normal">
              ₹{typeof basePrice === 'number' ? basePrice.toFixed(2) : basePrice}
            </p>

            <p className="text-[8px] md:text-[14px] text-[#4FAD2E] ml-[12px] md:ml-[20px] font-semibold">
              {discountInfo}
            </p>
          </div>
        </div>
      </div>

      <div className="h-[40px] flex items-center justify-center">
        <button
          className="text-[#F70000] w-[90%] h-[32px] border-[1px] border-[#F70001] rounded-lg bg-white opacity-0 group-hover:opacity-100 group-[.active]:opacity-100 transition-opacity duration-300"
          onClick={(e) => onAddingCart(e)}
        >
          <div className="flex items-center justify-center">
            <p className="font-semibold text-[12px] md:text-[13px]">Add to cart</p>
            <Image
              alt="cart"
              src={Cart}
              className="w-[16px] h-[16px] ml-[8px]"
            />
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;