"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { FaHeart, FaStar } from 'react-icons/fa';
import { calculateFinalPrice } from '@/utils/priceCalculation';
import { updateCart } from '@/features/features';
import { toast } from 'react-toastify';
import Cart from "@/assets/CartVector.png";
import { IconButton } from '@mui/material';
import {
  favoriteProductApi,
  addRecenetViewedApi,
  getAllFavoriteProductApi,
} from "@/apis";
import heart from "@/assets/like.png";
import LikeButton from "./LikeButton";

interface ProductCardProps {
  product: any;
  width?: string;
  offerId?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, width, offerId }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [favoriteProducts, setFavoriteProducts] = useState<number[]>([]);
  const [isPending, setPending] = useState(false);


  const {item, basePrice, price, discountInfo } = calculateFinalPrice(product, null);

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
    toast.success('Item has been added to cart!');
  };

  async function onLiked(e: any, productId: any) {
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


  if (offerId && offerId !== product?.offer_id) return null;

  return (
    <div 
  onClick={goToDetail}
  className="group lg:w-[98%] w-[95%] border mb-1 mt-2 lg:mt-[24px] rounded-2xl hover:border-[1px] border-[#b9b5b5] relative"
>
  <div className="cursor-pointer">
    <Image
      alt="Product Image"
      width={203}
      height={203}
      src={'/' + product.featured_image}
      className="w-full h-[203px] object-cover rounded-2xl cursor-pointer"
    />

    <div className="flex w-full justify-between items-center absolute px-[16px] top-[10px]">
      <button className="md:text-[8px] text-[9px] rounded-3xl text-white bg-[#F70000] md:py-2 py-1 md:px-3">
        {discountInfo?.toUpperCase()}
      </button>

        {/* <IconButton
          size="medium"
          onClick={(e) => onLiked(e, product.id)}
        >
          {favoriteProducts?.includes(product.id) ? (
            <FaHeart className="text-[#F70000]" />
          ) : (
            <Image src={heart} alt="like" />
          )}
        </IconButton> */}
        <LikeButton productId={item?.id} />
    </div>

    <div className="p-3">
      <p className="text-[16px] w-[80%] font-semibold line-clamp-2 flex justify-center items-center mr-2">
        {product.title}
      </p>
      <div className="flex items-center md:mt-[16px] mt-[8px] gap-1">
        <span className="md:text-sm text-[9px] text-[#F69B26]">
          {product.rating} ({product.reviews})
        </span>
        <FaStar size={12} color="#F69B26" />
      </div>

      <p className="md:text-[20px] text-[14px] text-[#FC3030] font-semibold md:mt-[16px] mt-[8px]">
        ₹{typeof price === 'number' ? price.toFixed(2) : price}
      </p>

      <div className="flex items-center md:mt-[16px] mt-[8px]">
        <p className="md:text-[16px] text-[10px] text-[#909198] line-through font-normal">
          ₹{typeof basePrice === 'number' ? basePrice.toFixed(2) : basePrice}
        </p>

        <p className="md:text-[16px] text-[10px] text-[#4FAD2E] ml-[24px] font-semibold">
          {discountInfo}
        </p>
      </div>
    </div>
  </div>

  <div className="hidden mb-3 flex justify-center opacity-0 group-hover:opacity-100 group-hover:flex w-full">
    <button
      className="text-[#F70000] w-[90%] h-[40px] border-[1px] border-[#F70001] rounded-lg"
      onClick={(e) =>
        onAddingCart(e, product, price, basePrice, discountInfo)
      }
    >
      <div className="flex items-center justify-center">
        <p className="font-semibold text-[14px]">Add to cart</p>
        <Image
          alt="cart"
          src={Cart}
          className="w-[20px] h-[20px] ml-[12px]"
        />
      </div>
    </button>
  </div>
</div>
  );
};

export default ProductCard;