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
  width?: string;
  offerId?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  width,
  offerId,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isPending, setPending] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const { item, basePrice, price, discountInfo } = calculateFinalPrice(
    product,
    null
  );

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

  const handleTouchStart = () => {
    setIsActive(true);
  };

  const handleTouchEnd = () => {
    setIsActive(false);
  };

  if (offerId && offerId !== product?.offer_id) return null;

  return (
    <div
      onClick={goToDetail}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`group lg:w-[98%] w-[95%] border mb-1 mt-2 lg:mt-[20px] rounded-2xl hover:border-[1px] border-[#b9b5b5] relative ${isActive ? 'active' : ''}`}
    >
      <div className="cursor-pointer">
        <Image
          alt="Product Image"
          width={203}
          height={203}
          src={product.featured_image}
          className="w-full h-[110px] sm:h-[140px] md:h-[160px] object-cover rounded-2xl cursor-pointer"
          onError={(e: any) => {
            console.error("Image failed to load:", e);
            e.target.src = "/path/to/fallback-image.jpg";
          }}
        />

        <div className="flex w-full justify-between items-center absolute px-[12px] top-[8px]">
          <div></div>
          <LikeButton productId={item?.id} />
        </div>

        <div className="p-1 sm:p-2">
          <p className="text-[13px] sm:text-[15px] w-[80%] font-semibold line-clamp-2 flex mr-2">
            {product.title}
          </p>
          <div className="flex items-center mt-[3px] sm:mt-[6px] md:mt-[12px] gap-1">
            <span className="text-[8px] sm:text-[9px] md:text-sm text-[#F69B26]">
              {product.rating} ({product.reviews})
            </span>
            <FaStar size={9} color="#F69B26" />
          </div>

          <p className="text-[11px] sm:text-[13px] md:text-[18px] text-[#FC3030] font-semibold mt-[3px] sm:mt-[6px] md:mt-[12px]">
            ₹{typeof price === "number" ? price.toFixed(2) : price}
          </p>

          <div className="flex items-center mt-[3px] sm:mt-[6px] md:mt-[12px]">
            <p className="text-[7px] sm:text-[9px] md:text-[14px] text-[#909198] line-through font-normal">
              ₹
              {typeof basePrice === "number" ? basePrice.toFixed(2) : basePrice}
            </p>

            <p className="text-[7px] sm:text-[9px] md:text-[14px] text-[#4FAD2E] ml-[10px] sm:ml-[20px] font-semibold">
              {discountInfo}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-1 sm:mb-2 flex justify-center w-full h-0 overflow-hidden transition-all duration-300 group-hover:h-[28px] sm:group-hover:h-[36px] group-[.active]:h-[28px] sm:group-[.active]:h-[36px]">
        <button
          className="text-[#F70000] w-[90%] border-[1px] border-[#F70001] rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-[.active]:opacity-100"
          onClick={(e) => onAddingCart(e)}
        >
          <div className="flex items-center justify-center">
            <p className="font-semibold text-[11px] sm:text-[13px]">Add to cart</p>
            <Image
              alt="cart"
              src={Cart}
              className="w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] ml-[6px] sm:ml-[10px]"
            />
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;