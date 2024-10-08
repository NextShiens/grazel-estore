"use client";
import Image from "next/image";
import sale from "@/assets/sale.png";
import heart from "@/assets/like.png";
import Apple from "@/assets/Group.png";
import banner from "@/assets/banner.png";
import Widget from "@/assets/Widget.png";
import Cardmm from "@/assets/Cardmmm.png";
import Cart from "@/assets/CartVector.png";
import { useRouter } from "next/navigation";
import Logoo from "@/assets/Grazle Logo.png";
import Skeleton from "@mui/material/Skeleton";
import Phone1 from "@/assets/Phone Mockup 1.png";
import Phone2 from "@/assets/Phone Mockup 2.png";
import MainSlider from "@/components/mianSlider";
import { IconButton, Rating } from "@mui/material";
import { FaArrowRightLong } from "react-icons/fa6";
import Google from "@/assets/Google Play Badge.png";
import RecentViewSlider from "@/components/rencentView";
import React, { useState, useEffect, useRef } from "react";
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";
import { updateCart, setSelectedCategory } from "@/features/features";

import bg from "@/assets/2 copy.png";
import ProductCard from "@/components/ProductCard";
import CircularProgress from "@mui/material/CircularProgress";
import { useDispatch } from "react-redux";

import {
  getSeasonTop,
  getBannersApi,
  getDynamicViewApi,
  getAllCategoriesApi,
  trendingProductsApi,
  favoriteProductApi,
  getRecentProductsApi,
  guestRecentProductsApi,
  getSuggestedProductsApi,
  guestSuggestedProductsApi,
  getFirstTrendingCategoryApi,
  getSecondTrendingCategoryApi,
  getAllProductsApi,
  getSingleCategoryProductsApi,
  getOfferProductsApi,
  fiftyPercentSaleProductsApi,
  getCategoryBySlugApi,
} from "@/apis";
import SkeletonLoader from "@/components/SkeletonLoader";
import {
  calculateFinalPrice,
  calculateTimeLeft,
} from "@/utils/priceCalculation";
import Link from "next/link";
import { updateCategories } from "@/features/features";
import OfferViewSlider from "@/components/offersSilder";
import { toast } from "react-toastify";
import { FaHeart } from "react-icons/fa";

export default function Home() {
  const dispatch = useDispatch();
  const [seasonTop, setSeasonTop] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [allCategories, setCategories] = useState<any>([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [positionOneBanners, setPositionOneBanners] = useState([]);
  const [positionTwoBanners, setPositionTwoBanners] = useState([]);
  const [dynamicViewProducts, setDynamicViewProducts] = useState([]);
  const [positionThreeBanners, setPositionThreeBanners] = useState([]);
  const [selectedCategoryProducts, setSelectedCategoryProducts] = useState([]);
  const [offerProducts, setOfferProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<any>();
  const [seventyFiveTimeLeft, setSeventyFiveTimeLeft] = useState<any>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fiftyPercentSaleProducts, setFiftyPercentSaleProducts] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState<number[]>([]);
  const [isPending, setPending] = useState(false);

  const sliderRef1 = useRef<any>(null);
  const sliderRef2 = useRef<any>(null);
  const sliderRef3 = useRef<any>(null);
  const sliderRef4 = useRef<any>(null);
  const sliderRef5 = useRef<any>(null);
  const sliderRef6 = useRef<any>(null);

  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token")!;
  }
  const onAddingCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    const { basePrice, price, discountInfo } = calculateFinalPrice(
      product,
      null
    );
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
  useEffect(() => {
    async function fetchFavoriteProducts() {
      try {
        // const response = await getAllFavoriteProductApi();
        // setFavoriteProducts(response.data.favoriteProducts || []);
      } catch (error) {
        console.error("Error fetching favorite products:", error);
        toast.error("Failed to fetch favorite products");
        setFavoriteProducts([]); // Set to empty array in case of error
      }
    }
    fetchFavoriteProducts();
  }, []);

  useEffect(() => {
    (async () => {
      const trendingRes = await trendingProductsApi();
      setTrendingProducts(trendingRes?.data?.products || []);
    })();
  }, []);

  // all products
  useEffect(() => {
    (async () => {
      const { data } = await getAllProductsApi();
      setAllProducts(data.products);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await getOfferProductsApi();
      setOfferProducts(data.offers);
      console.log(data.offers);
    })();
  }, []);

  // dynamic view products
  useEffect(() => {
    (async () => {
      const { data } = await getDynamicViewApi();
      setDynamicViewProducts(data.products);
    })();
  }, []);

  // alll categories
  useEffect(() => {
    (async () => {
      const { data } = await getAllCategoriesApi();
      setCategories(data?.categories || []);
      dispatch(updateCategories(data?.categories || []));
    })();
  }, []);
  const [screen, setScreen] = useState("web");
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 768) {
        setScreen("mobile");
      } else {
        setScreen("web");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const positionOneBanners = await getBannersApi(1, screen);
      setPositionOneBanners(positionOneBanners.data.banners);
      const positionTwoBanners = await getBannersApi(2, screen);
      setPositionTwoBanners(positionTwoBanners.data.banners);
      const positionThreeBanners = await getBannersApi(3, screen);
      setPositionThreeBanners(positionThreeBanners.data.banners);
    })();
  }, []);

  const goToCreditLimit = () => {
    setLoading(true);
    router.push("/CreditLimit");
  };

  const fn_categoryClicked = (item: any) => {
    router.push(`/search?category=${item?.id}`);
  };

  const [click, setClick] = useState(allCategories[0]);

  const handleClickCategory = async (cat: any) => {
    setClick(cat);
    setLoading(true);
    const { data } = await getSingleCategoryProductsApi(cat.id);
    setSelectedCategoryProducts(data?.products || []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      if (!allCategories[0]?.id) return;
      const { data } = await getSingleCategoryProductsApi(allCategories[0]?.id);
      setSelectedCategoryProducts(data?.products || []);
    })();
  }, [allCategories[0]?.id]);

  const endDate = new Date(offerProducts[0]?.offer?.end_date);
  useEffect(() => {
    const timer = setTimeout(() => {
      const endDate = offerProducts[0]?.offer?.end_date;
      const leftTime: any = calculateTimeLeft(endDate);
      setTimeLeft(leftTime);
    }, 1000);
    return () => clearTimeout(timer);
  }, [endDate, timeLeft]);

  const seventyFivePercentSaleProducts: any = allProducts.filter(
    (product: any) =>
      product?.offer?.discount_type?.toLowerCase() ===
        "percentage".toLowerCase() &&
      product?.offer?.discount_value?.toLowerCase() === "75.00".toLowerCase()
  );
  const seventyFiveEndDate: any = new Date(
    seventyFivePercentSaleProducts[0]?.offer?.end_date
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const leftTime = calculateTimeLeft(seventyFiveEndDate);
      setSeventyFiveTimeLeft(leftTime as any);
    }, 1000);
    return () => clearTimeout(timer);
  }, [seventyFiveEndDate, seventyFiveTimeLeft]);

  const { basePrice, price, discountInfo } = calculateFinalPrice(
    seventyFivePercentSaleProducts[0],
    null
  );

  // Fetch 50% sale products
  useEffect(() => {
    async function fetchFiftyPercentSaleProducts() {
      try {
        // actually we use 70% offer products instead 50 keep in mind
        const { data } = await fiftyPercentSaleProductsApi();
        setFiftyPercentSaleProducts(data?.offers[0]?.offer_products || []);
      } catch (error) {
        console.error("Error fetching 50% sale products:", error);
      }
    }

    fetchFiftyPercentSaleProducts();
  }, []);

  const handleCategoryClick = async (category) => {
    console.log(category, "category");
    const { data } = await getCategoryBySlugApi(category.id);
    dispatch(setSelectedCategory(data));
  };

  async function onLiked(e: React.MouseEvent, productId: number) {
    e.stopPropagation();
    if (isPending) return;

    try {
      setPending(true);
      const formdata = new FormData();
      formdata.append("product_id", productId.toString());

      const response = await favoriteProductApi(formdata);

      if (response.data.success) {
        setFavoriteProducts((prevFavorites = []) => {
          if (prevFavorites.includes(productId)) {
            return prevFavorites.filter((id) => id !== productId);
          } else {
            return [...prevFavorites, productId];
          }
        });
        toast.success(response.data.message);
      } else {
        toast.error("Failed to update favorite status");
      }
    } catch (error) {
      console.error("Error in liking product:", error);
      toast.error("Please log in first to add the product to favorites");
    } finally {
      setPending(false);
    }
  }
  const fn_categoryClickednew = (category) => {
    dispatch(setSelectedCategory(category));
  };
  return (
    <>
      {/* MianSlider */}
      <div className="container lg:!w-[80%] m-auto lg:px-0 md:px-3">
        <MainSlider position={1}  />
      </div>

      {/* Get Now Banner */}
      <div className=" container lg:!w-[80%] my-3 mx-auto flex  items-center justify-between md:py-5 py-2 px-5  bg-gradient-to-r from-[#F81F1F] to-[#FFA31A]  h-auto md:rounded-[20px] rounded-md shadow-lg">
        <div className="flex items-center gap-4">
          <div className="rounded-full lg:h-[60px] lg:w-[60px] h-[40px] w-[40px] sm:w-[40px] sm:h-[40px] bg-[#FA6464] flex items-center justify-center">
            <Image
              width={40}
              height={40}
              alt=""
              src={Cardmm}
              className="lg:h-[40px] lg:w-[40px] w-[30px] h-[30px] sm:w-[30px] sm:h-[30px] "
            />
          </div>
          <div>
            <p className="text-white text-[10px] lg:text-2xl font-semibold">
              Credit Limit
            </p>
            <p className="text-white text-[8px] lg:text-lg font-normal">
              Get Credit Upto 10 Lacs
            </p>
          </div>
        </div>
        <button
          className="text-[#F70000] text-[10px] lg:text-xl font-semibold bg-white rounded-lg lg:h-[45px] h-[35px] lg:w-[300px] sm:h-[40px] lg:h-[50px] px-10 lg:px-10 flex items-center justify-center"
          onClick={goToCreditLimit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Get Now"}
        </button>
      </div>

      {/* Categories */}
      <div className="container hide-scrollbar lg:!w-[80%] md:!w-[80%] sm:!w-[80%] gap-2 sm:gap-2 lg:gap-0 mt-3 !my-8 md:mx-auto  sm:mx-auto  flex items-center justify-between overflow-x-auto">
        <div className="w flex items-center mx-2 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="border-[1px] flex justify-center items-center lg:w-[92px] lg:h-[92px] w-[70px] h-[70px] border-[#F70000] rounded-full bg-[#F8F8F8] ">
              <Image
                width={40}
                height={40}
                src={Widget}
                alt="widget"
                className="lg:w-[40px] lg:h-[40px] w-[30px] h-[30px] sm:h-[30px] sm:w-[30px] "
              />
            </div>

            <p className="text-nowrap color-[#393A44] lg:text-[14px] text-[10px] sm:text-[12px] font-normal mt-[4px]">
              Categories
            </p>
          </div>

          {/* {!allCategories?.length && (
            <>
              <div className="hidden md:flex justify-between w-full ml-2">
                {Array(8)
                  .fill(0)
                  .map((_, index) => (
                    <Skeleton
                      key={index}
                      animation="wave"
                      variant="circular"
                      className="w-[92px] h-[92px]"
                    />
                  ))}
              </div>
              <div className="md:hidden flex justify-between w-full ml-2">
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <Skeleton
                      key={index}
                      animation="wave"
                      variant="circular"
                      className="w-[70px] h-[70px]"
                    />
                  ))}
              </div>
            </>
          )} */}
        </div>

        {allCategories?.map((category) => (
          <Link
            key={category?.id}
            href={`/search?category=${category?.id}`}
            className="w-full flex flex-col justify-center items-center mx-2 text-center"
            onClick={() => handleCategoryClick(category)}
          >
            <div className="flex justify-center hover:border border-[#FC3030] items-center lg:w-[92px] lg:h-[92px] w-[70px] h-[70px] sm:w-[70px] sm:h-[70px] border-[#F70000] rounded-full bg-[#F8F8F8]">
              {category?.image !== null ? (
                <Image
                  width={92}
                  height={92}
                  src={category?.image}
                  alt=""
                  className="rounded-full lg:w-[92px] lg:h-[92px] w-[80px] h-[80px] sm:w-[70px] sm:h-[70px]"
                />
              ) : (
                <Image
                  width={40}
                  height={40}
                  src={Widget}
                  alt=""
                  className="lg:w-[40px] lg:h-[40px] w-[30px] h-[30px] sm:h-[30px] sm:w-[30px]"
                />
              )}
            </div>
            <p className="text-nowrap color-[#393A44] lg:text-[14px] text-[10px] sm:text-[12px] font-normal mt-[4px]">
              {category?.name}
            </p>
          </Link>
        ))}
      </div>

      {/* Flash sale */}
      <div className="container lg:!w-[80%] md:!w-[80%] sm:!w-[80%] m-auto flex justify-between items-center md:mt-14 mt-5">
        <span className="text-xl font-semibold">Flash Sale</span>
        <button
          className="flex items-center gap-3 border border-[#FC3030] text-[#FC3030] text-sm rounded-lg py-2 px-4"
          onClick={async () => {
            setIsLoading(true);
            await router.push(`/offers?id=${offerProducts[0]?.offer?.id}`);
            setIsLoading(false);
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <>
              <span>View All</span>
              <FaArrowRightLong />
            </>
          )}
        </button>
      </div>

      <div className="container lg:!w-[80%] md:!w-[80%] sm:!w-[80%] mx-auto flex md:p-4 p-2 rounded-lg md:gap-20 md:justify-start justify-between items-center mt-5 border border-[#00000033]">
        <span className="font-medium text-[#F81F1F] md:text-base text-xs">
          On Sale Now
        </span>

        <div className="flex text-sm items-center gap-2">
          <span className="mr-2 md:text-base text-xs">Ending in</span>
          <span className="p-2 bg-[#F81F1F] rounded-sm text-white md:text-base text-xs">
            {timeLeft?.days > 0
              ? timeLeft?.days + "d"
              : timeLeft?.hours > 0
              ? timeLeft?.hours
              : 0}
          </span>
          <span>:</span>
          <span className="p-2 bg-[#F81F1F] rounded-sm text-white md:text-base text-xs">
            {timeLeft?.days > 0 ? timeLeft?.hours + "h" : timeLeft?.minutes}
          </span>
          <span>:</span>
          <span className="p-2 bg-[#F81F1F] rounded-sm text-white md:text-base text-xs">
            {timeLeft?.days > 0 ? timeLeft?.minutes + "m" : timeLeft?.seconds}
          </span>
        </div>
      </div>

      <div
        className="container lg:!w-[80%] md:!w-[80%] sm:!w-[80%] mx-auto "
        style={{ padding: "10px" }}
      >
        {offerProducts?.length > 0 ? (
          <div>
            <OfferViewSlider Data={offerProducts} ref={sliderRef6} />
          </div>
        ) : (
          <>
            <div className="hidden md:flex items-center justify-between">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <SkeletonLoader key={index} />
                ))}
            </div>
            <div className="md:hidden flex items-center justify-between">
              {Array(2)
                .fill(0)
                .map((_, index) => (
                  <SkeletonLoader key={index} />
                ))}
            </div>
          </>
        )}
      </div>

      {/* categories */}
      <div
        style={{ scrollbarWidth: "none" }}
        style={{ marginTop: "10px" }}
        className="container lg:!w-[80%] md:!w-[80%] sm:!w-[80%] mx-auto pb-2 md:my-[24px] mt-5 flex items-center  overflow-x-auto lg:justify-between gap-3"
      >
        {allCategories.map((item: any, index: any) => (
          <button
            disabled={click?.name === item?.name || loading}
            key={index}
            onClick={() => handleClickCategory(item)}
            className={`${
              item?.name === click?.name
                ? "border border-[#FC3030] text-[#FC3030]"
                : "bg-[#F8F8F8]"
            } lg:text-sm text-xs py-2 px-3 rounded-md whitespace-nowrap`}
          >
            {item?.name?.toUpperCase()}
          </button>
        ))}
      </div>

      <div
        className="container lg:!w-[80%] md:!w-[80%] sm:!w-[80%] mx-auto md:my-[24px] my-0"
        style={{ padding: "10px" }}
      >
        {selectedCategoryProducts?.length ? (
          <div>
            <RecentViewSlider
              Data={selectedCategoryProducts}
              ref={sliderRef6}
            />
          </div>
        ) : (
          <div className="">
            <p className="text-lg font-semibold text-gray-600">
              No items related to this category
            </p>
            <div className="hidden md:flex items-center justify-between">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <SkeletonLoader key={index} />
                ))}
            </div>
            <div className="md:hidden flex items-center justify-between">
              {Array(2)
                .fill(0)
                .map((_, index) => (
                  <SkeletonLoader key={index} />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Dynamic View */}
      <div
        className="container lg:!w-[80%] md:!w-[80%] sm:!w-[80%] mx-auto my-[24px]"
        style={{ marginTop: "-3px", padding: "10px" }}
      >
        <div
          className="flex items-center justify-between w-full mt-[15px] md:mt-0"
          style={{ marginTop: "0px" }}
        >
          <p
            className="md:text-2xl text-lg font-semibold ml-2"
            // style={{ marginRight: "10px" }}
          >
            Dynamic View
          </p>
        </div>

        {dynamicViewProducts?.length ? (
          <div>
            <RecentViewSlider Data={dynamicViewProducts} ref={sliderRef6} />
          </div>
        ) : (
          <>
            <div className="hidden md:flex items-center justify-between">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <SkeletonLoader key={index} />
                ))}
            </div>
            <div className="md:hidden flex items-center justify-between">
              {Array(2)
                .fill(0)
                .map((_, index) => (
                  <SkeletonLoader key={index} />
                ))}
            </div>
          </>
        )}
      </div>
      <div className="container lg:!w-[80%] m-auto lg:px-0 md:px-3">
        <MainSlider position={2}/>
      </div>
      {/* sale product */}
      <div className="container lg:!w-[80%] md:!w-[80%] sm:!w-[80%] mx-auto flex lg:flex-row flex-col my-[24px] border border-[#E5E7EB] py-5 lg:px-6 px-1 rounded-md">
        {offerProducts[0]?.offer_products?.length > 0 && (
          <>
            {/* Large Screen Layout */}
            <div className="hidden lg:flex lg:flex-row w-full">
              <div className="flex flex-col w-[60%] border-r border-[#77777740]">
                <Link
                  href={`/detailProduct/${offerProducts[0].offer_products[0].id}`}
                  className="flex items-center justify-center gap-5 w-full"
                >
                  <div className="relative h-[190px] w-[190px] mr-8">
                    <Image
                      alt="Product Image"
                      width={190}
                      height={190}
                      src={offerProducts[0].offer_products[0].featured_image}
                      className="w-full h-full outline-none rounded-2xl cursor-pointer border"
                    />
                    <div className="flex w-full justify-between items-center absolute px-[10px] top-[10px] space-x-4">
                      <button className="text-[11px] rounded-3xl text-white bg-[#F70000] py-1.5 px-2.5">
                        {offerProducts[0].offer.discount_value}% OFF
                      </button>
                      <IconButton
                        size="small"
                        onClick={(e) =>
                          onLiked(e, offerProducts[0].offer_products[0].id)
                        }
                        disabled={isPending}
                        className="bg-white bg-opacity-70 hover:bg-opacity-100"
                      >
                        {favoriteProducts &&
                        favoriteProducts.includes(
                          offerProducts[0].offer_products[0].id
                        ) ? (
                          <FaHeart className="text-[#F70000]" />
                        ) : (
                          <Image src={heart} alt="like" width={20} height={20} />
                        )}
                      </IconButton>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <span>{offerProducts[0].offer_products[0].title}</span>
                    <div className="flex items-center gap-2">
                      <Rating
                        precision={0.5}
                        name="read-only"
                        readOnly
                        value={Number(offerProducts[0].offer_products[0].rating)}
                        defaultValue={Number(offerProducts[0].offer_products[0].rating)}
                        className="text-xl"
                      />
                      <span className="text-sm text-[#434343]">
                        {offerProducts[0].offer_products[0].reviewCount}
                      </span>
                    </div>
                    <div className="flex gap-4 items-center mt-1">
                      <span className="text-lg text-[#F70001] font-semibold">
                        ₹
                        {(
                          offerProducts[0].offer_products[0].price -
                          offerProducts[0].offer_products[0].price *
                            (offerProducts[0].offer.discount_value / 100)
                        ).toFixed(2)}
                      </span>
                      <span className="text-[#949494] text-sm line-through">
                        ₹{offerProducts[0].offer_products[0].price}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="flex flex-col gap-4 px-10 justify-center w-[40%]">
                <div className="flex items-center gap-2 bg-[#F7000014] w-fit rounded-full py-2 px-3 text-[#FC3030]">
                  <Image src={sale} alt="sale" />
                  <span className="">
                    {offerProducts[0].offer.name.toUpperCase()}
                  </span>
                </div>
                <div className="flex text-sm items-center gap-2">
                  <span className="p-2 bg-[#E5E7EB] rounded-md font-bold">
                    {timeLeft?.days > 0
                      ? timeLeft?.days + "d"
                      : timeLeft?.hours > 0
                      ? timeLeft?.hours
                      : 0}
                  </span>
                  <span className="p-2 bg-[#E5E7EB] rounded-md font-bold">
                    {timeLeft?.days > 0
                      ? timeLeft?.hours + "h"
                      : timeLeft?.minutes}
                  </span>
                  <span className="p-2 bg-[#E5E7EB] rounded-md font-bold">
                    {timeLeft?.days > 0
                      ? timeLeft?.minutes + "m"
                      : timeLeft?.seconds}
                  </span>
                  <span className="mr-2 text-[#949494]">
                    Remains until the end of the offer
                  </span>
                </div>
                <button
                  className="w-[300px] text-[#F70000] py-3 border-[1px] border-[#F70001] rounded-lg"
                  onClick={(e) =>
                    onAddingCart(e, offerProducts[0].offer_products[0])
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
      
            {/* Small Screen Layout */}
            <div className="lg:hidden flex flex-col w-full">
              <Link
                href={`/detailProduct/${offerProducts[0].offer_products[0].id}`}
                className="flex items-start gap-4 w-full"
              >
                <div className="relative h-[190px] w-[300px] md:h-[190px] md:w-[300px]">
                  <Image
                    alt="Product Image"
                    width={300}
                    height={190}
                    src={offerProducts[0].offer_products[0].featured_image}
                    className="h-[190px] w-[300px] outline-none rounded-2xl cursor-pointer border"
                  />
                  <div className="flex w-full justify-between items-center absolute px-[10px] top-[10px] sm:space-x-4">
                    <button className="text-[10px] rounded-3xl text-white bg-[#F70000] py-1 px-2">
                      {offerProducts[0].offer.discount_value}% OFF
                    </button>
                    <IconButton
                      size="small"
                      onClick={(e) =>
                        onLiked(e, offerProducts[0].offer_products[0].id)
                      }
                      disabled={isPending}
                      className="bg-white bg-opacity-70 hover:bg-opacity-100"
                    >
                      {favoriteProducts &&
                      favoriteProducts.includes(
                        offerProducts[0].offer_products[0].id
                      ) ? (
                        <FaHeart className="text-[#F70000]" />
                      ) : (
                        <Image src={heart} alt="like" width={20} height={20} />
                      )}
                    </IconButton>
                  </div>
                </div>
                <div className="flex flex-col gap-3 mt-2">
                  <span className="">
                    {offerProducts[0].offer_products[0].title}
                  </span>
                  <div className="flex items-center gap-2">
                    <Rating
                      precision={0.5}
                      name="read-only"
                      readOnly
                      value={Number(offerProducts[0].offer_products[0].rating)}
                      defaultValue={Number(offerProducts[0].offer_products[0].rating)}
                      className="text-sm"
                    />
                    <span className="text-sm text-[#434343]">
                      {offerProducts[0].offer_products[0].reviewCount}
                    </span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-lg text-[#F70001] font-semibold">
                      ₹
                      {(
                        offerProducts[0].offer_products[0].price -
                        offerProducts[0].offer_products[0].price *
                          (offerProducts[0].offer.discount_value / 100)
                      ).toFixed(2)}
                    </span>
                    <span className="text-[#949494] text-sm line-through">
                      ₹{offerProducts[0].offer_products[0].price}
                    </span>
                  </div>
                  <button
                    className="w-[150px] text-[#F70000] py-3 border-[1px] border-[#F70001] rounded-lg mt-2"
                    onClick={(e) =>
                      onAddingCart(e, offerProducts[0].offer_products[0])
                    }
                  >
                    <div className="flex items-center justify-center">
                      <p className="font-semibold text-[10px]">Add to cart</p>
                      <Image
                        alt="cart"
                        src={Cart}
                        className="w-[15px] h-[15px] ml-[12px]"
                      />
                    </div>
                  </button>
                </div>
              </Link>
              <div className="flex flex-col gap-4 px-0 justify-center w-[100%] mt-4">
                <div className="flex items-center gap-2 bg-[#F7000014] w-fit rounded-full py-2 px-3 text-[#FC3030]">
                  <Image src={sale} alt="sale" />
                  <span className="uppercase text-sm">
                    {offerProducts[0].offer.name.toUpperCase()}
                  </span>
                </div>
                <div className="flex text-sm items-center gap-2">
                  <span className="p-2 bg-[#E5E7EB] rounded-md font-bold">
                    {timeLeft?.days > 0
                      ? timeLeft?.days + "d"
                      : timeLeft?.hours > 0
                      ? timeLeft?.hours
                      : 0}
                  </span>
                  <span className="p-2 bg-[#E5E7EB] rounded-md font-bold">
                    {timeLeft?.days > 0
                      ? timeLeft?.hours + "h"
                      : timeLeft?.minutes}
                  </span>
                  <span className="p-2 bg-[#E5E7EB] rounded-md font-bold">
                    {timeLeft?.days > 0
                      ? timeLeft?.minutes + "m"
                      : timeLeft?.seconds}
                  </span>
                  <span className="mr-2 text-[#949494]">
                    Remains until the end of the offer
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div
        className="container lg:!w-[80%] md:!w-[80%] sm:!w-[80%] mx-auto flex justify-between items-center md:mt-14 mt-5"
        style={{ padding: "10px" }}
      >
        <span className="text-xl font-semibold">70% off Products</span>
        <button
          className="flex items-center gap-3 border border-[#FC3030] text-[#FC3030] text-sm rounded-lg py-2 px-4"
          onClick={async () => {
            setIsLoading(true);
            await router.push(`/offers?id=${offerProducts[0]?.offer?.id}`);
            setIsLoading(false);
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <>
              <span>View All</span>
              <FaArrowRightLong />
            </>
          )}
        </button>
      </div>

      {/* 50% off */}
      <div
        className="container lg:!w-[80%] md:!w-[80%] sm:!w-[80%] mx-auto"
        style={{ padding: "10px" }}
      >
        {/* <h2 className="text-2xl font-bold mb-4 text-center lg:text-left">
          Minimum 70% OFF Products
        </h2> */}
        {/* <button
          className="flex items-center gap-3 border border-[#FC3030] text-[#FC3030] text-sm rounded-lg py-2 px-4"
          onClick={async () => {
            setIsLoading(true);
            await router.push(`/offers?id=${offerProducts[0]?.offer?.id}`);
            setIsLoading(false);
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <>
              <span>View All</span>
              <FaArrowRightLong />
            </>
          )}
        </button> */}
        {fiftyPercentSaleProducts?.length > 0 ? (
          <div>
            <OfferViewSlider Data={fiftyPercentSaleProducts} ref={sliderRef6} />
          </div>
        ) : (
          <>
            <div className="hidden md:flex items-center justify-between">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <SkeletonLoader key={index} />
                ))}
            </div>
            <div className="md:hidden flex items-center justify-between">
              {Array(2)
                .fill(0)
                .map((_, index) => (
                  <SkeletonLoader key={index} />
                ))}
            </div>
          </>
        )}
      </div>
      {/* small appliances */}
      <div
        style={{
          background:
            "linear-gradient(97.69deg, rgba(247, 0, 0, 0.1) 3.55%, rgba(145, 131, 0, 0.1) 91.28%)",
        }}
        className="container lg:!w-[80%] md:!w-[80%] sm:!w-[80%] mx-auto relative lg:px-[70px] px-[20px] sm:px-[40px] md:px-[40px] my-[16px] flex lg:flex-row justify-between"
      >
        <div className="md:py-7 py-2 flex flex-col items-start md:w-[60%] w-[50%]">
          <Image
            src={Logoo}
            alt=""
            className="lg:w-[120px] lg:h-[70px] md:w-[100px] md:h-[60px] w-[40px] h-[30px]"
          />
          <div className="md:mt-[32px] mt-[15px]">
            <p className="lg:text-[40px] md:text-[20px] text-[12px] font-bold">
              simplify your shopping with GRAZLE
            </p>
            <p className="lg:text-[16px] md:text-[14px] text-[8px]">
              SHOPPING ON THE GO IS FAST AND EASY
            </p>
            <p className="lg:text-[16px] md:text-[14px] text-[10px] mt-[8px] text-[#393A44] font-medium">
              Get the App
            </p>

            <div className="flex items-center lg:mt-[32px] mt-[8px] sm:mt-[8px]  md:mt-[8px]">
              <Image
                src={Google}
                alt=""
                className="lg:w-[135px] lg:h-[40px] md:w-[120px] md:h-[35px] w-[60px] h-[20px] mr-[16px]"
              />
              <Image
                src={Apple}
                alt=""
                className="lg:w-[135px] lg:h-[40px] md:w-[120px] md:h-[35px] w-[60px] h-[20px]"
              />
            </div>
          </div>
        </div>

        <div className="flex lg:mr-40 md:mr-32 mr-16 lg:ml-[20px] md:ml-[24px] ml-0 lg:flex-row flex-col h-contain">
          <Image
            src={Phone1}
            alt=""
            className="absolute top-0 lg:right-52 md:right-36 right-20 lg:w-[200px] md:w-[150px] w-[80px] lg:h-[300px] md:h-[200px] h-[100px]"
          />
          <Image
            src={Phone2}
            alt=""
            className="absolute bottom-0 lg:w-[200px] md:w-[150px] w-[80px] lg:h-[300px] md:h-[200px] h-[100px]"
          />
        </div>
      </div>
      {/* banner */}
      {/* <div className="lg:mx-[150px] md:mx-[60px] mx-0">
        <Image src={banner} alt="banner" />
      </div> */}
    </>
  );
}
