"use client";
import {
  favoriteProductApi,
  addRecenetViewedApi,
  getAllFavoriteProductApi,
} from "@/apis";
import Image from "next/image";
import heart from "@/assets/like.png";
import { toast } from "react-toastify";
import { Rating } from "@mui/material";
import { FaStar } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import Cart from "@/assets/CartVector.png";
import Carousel from "react-multi-carousel";
import { useRouter } from "next/navigation";
import "react-multi-carousel/lib/styles.css";
import { updateCart } from "@/features/features";
import IconButton from "@mui/material/IconButton";
import React, { useEffect, useState } from "react";
import SkeletonLoader from "./SkeletonLoader";
import { calculateFinalPrice } from "@/utils/priceCalculation";
import LikeButton from "./LikeButton";

interface Props {
  Data: any;
}

const responsive = {
  lgdesktop: {
    breakpoint: { max: 3000, min: 1441 },
    items: 5,
    slidesToSlide: 1,
  },
  desktop: {
    breakpoint: { max: 1440, min: 1041 },
    items: 5,
    slidesToSlide: 1,
  },
  Laptop: {
    breakpoint: { max: 1040, min: 769 },
    items: 5,
    slidesToSlide: 1,
  },
  tablet: {
    breakpoint: { max: 768, min: 481 },
    items: 2,
    slidesToSlide: 1,
  },
  mobile: {
    breakpoint: { max: 480, min: 320 },
    items: 2,
    slidesToSlide: 1,
  },
};

const RecentViewSlider = React.forwardRef((props: Partial<Props>, ref: any) => {
  const { Data } = props;
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isPending, setPending] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [favoriteProducts, setFavoriteProducts] = useState<number[]>([]);
  const [touchedProductId, setTouchedProductId] = useState(null);

  const onAddingCart = (
    e: any,
    product: any,
    price: any,
    basePrice: any,
    discountInfo: any
  ) => {
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

  async function onLiked(e: any, productId: any) {
    e.stopPropagation();
    if (isPending) return;

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
      console.log("error in liking product", error);
    } finally {
      setTimeout(() => {
        setPending(false);
      }, 200);
    }
  }

  return (
    <div className="parent md:h-[380px] h-[320px]">
      <Carousel
        key={Data?.length}
        ref={ref}
        arrows={false}
        swipeable={true}
        draggable={true}
        showDots={false}
        infinite={true}
        responsive={responsive}
        itemClass="carousel-item"
        dotListClass="custom-dot-list-style"
      >
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, index) => <SkeletonLoader key={index} />)
        ) : !Data || Data.length <= 0 ? (
          <div>No Product Found!</div>
        ) : (
          Data.map((item: any, index: any) => {
            const { basePrice, price, discountInfo } = calculateFinalPrice(
              item,
              null
            );
            return (
              <div
                key={index}
                className={`group lg:w-[98%] w-[95%] border mb-1 mt-1 lg:mt-[16px] rounded-2xl hover:border-[1px] border-[#b9b5b5] relative ${touchedProductId === item.id ? 'active' : ''
                  }`}
                onClick={() => setTouchedProductId(item.id)}
              >
                <div
                  onClick={() => router.push(`/detailProduct/${item.id}`)}
                  className="cursor-pointer"
                >
                  {item?.featured_image ? (
                    <Image
                      alt="Product Image"
                      width={203}
                      height={203}
                      src={item.featured_image}
                      className="w-full h-[160px] md:h-[170px] object-cover rounded-2xl cursor-pointer"
                      onError={(e: any) => {
                        console.error('Image failed to load:', e);
                        e.target.src = '/path/to/fallback-image.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-[160px] md:h-[170px] bg-gray-200 rounded-2xl"></div>
                  )}

                  {/* <div className="flex w-full justify-between items-center absolute px-[16px] top-[10px]">
                    <div></div>
                    <LikeButton productId={item?.id} />
                  </div> */}

                  <div className="p-2">
                    <p className="text-[14px] md:text-[15px] w-[80%] font-semibold">
                      {item?.title}
                    </p>
                    <div className="flex items-center mt-[4px] md:mt-[8px] gap-1">
                      <span className="text-[8px] md:text-[10px] text-[#F69B26]">
                        {item?.rating} ({item?.reviews})
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
                <div className="flex w-full justify-between items-center absolute px-[16px] top-[10px]">
                    <div></div>
                    <LikeButton productId={item?.id} />
                  </div>

                <div className="mb-2 flex justify-center w-full opacity-0 group-hover:opacity-100 group-[.active]:opacity-100">
                  <button
                    className="text-[#F70000] w-[90%] h-[32px] border-[1px] border-[#F70001] rounded-lg bg-white hidden group-hover:block group-[.active]:block"
                    onClick={(e) =>
                      onAddingCart(e, item, price, basePrice, discountInfo)
                    }
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
          })
        )}
      </Carousel>
    </div>
  );
});

export default RecentViewSlider;