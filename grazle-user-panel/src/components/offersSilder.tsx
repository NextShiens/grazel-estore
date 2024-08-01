import React, { useState } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { FaStar, FaShoppingCart } from "react-icons/fa";
import { updateCart } from "@/features/features";
import { calculateFinalPrice } from "@/utils/priceCalculation";
import LikeButton from "./LikeButton";

const responsive = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 1600 }, items: 5 },
  desktop: { breakpoint: { max: 1600, min: 1024 }, items: 5 },
  tablet: { breakpoint: { max: 1024, min: 464 }, items: 2 },
  mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
};

const OfferViewSlider = React.forwardRef(({ Data }, ref) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const onAddingCart = (e, product, price, basePrice, discountInfo) => {
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

  const ProductCard = ({ item }) => {
    const { basePrice, price, discountInfo } = calculateFinalPrice(item, null);
    
    return (
      <div className="group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl m-2">
        <div onClick={() => router.push(`/detailProduct/${item.id}`)} className="cursor-pointer">
          <div className="relative">
            <Image
              alt={item.title}
              width={300}
              height={300}
              src={item.featured_image}
              className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {discountInfo?.toUpperCase()}
            </div>
            <div className="absolute top-2 right-2">
              <LikeButton productId={item?.id} />
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{item?.title}</h3>
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="text-sm font-medium text-gray-700">{item?.rating}</span>
              </div>
              <span className="text-sm text-gray-500 ml-2">({item?.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-xl font-bold text-red-600">₹{typeof price === 'number' ? price.toFixed(2) : price}</p>
                <p className="text-sm text-gray-500 line-through">₹{typeof basePrice === 'number' ? basePrice.toFixed(2) : basePrice}</p>
              </div>
              <button
                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors duration-300 opacity-0 group-hover:opacity-100"
                onClick={(e) => onAddingCart(e, item, price, basePrice, discountInfo)}
              >
                <FaShoppingCart size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Extract offer products from the data structure
  const offerProducts = Data?.[0]?.offer_products || [];

  return (
    <div className="py-8">
      <Carousel
        ref={ref}
        responsive={responsive}
        swipeable={true}
        draggable={true}
        arrows={true}
        showDots={false}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={3000}
        keyBoardControl={true}
        customTransition="all .5"
        transitionDuration={500}
        containerClass="carousel-container"
        removeArrowOnDeviceType={["tablet", "mobile"]}
        dotListClass="custom-dot-list-style"
        itemClass="carousel-item-padding-40-px"
      >
        {loading ? (
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="animate-pulse bg-gray-200 h-72 rounded-lg m-2"></div>
          ))
        ) : offerProducts.length <= 0 ? (
          <div className="text-center text-gray-500 text-lg font-medium py-8">No Products Found!</div>
        ) : (
          offerProducts.map((item, index) => (
            <ProductCard key={index} item={item} />
          ))
        )}
      </Carousel>
    </div>
  );
});

export default OfferViewSlider;