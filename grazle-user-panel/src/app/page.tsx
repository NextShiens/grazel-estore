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

import Dami from "@/assets/dami.png";
import bg from "@/assets/2 copy.png";
import Rasm2 from "@/assets/rasm2.png";
import Rasm3 from "@/assets/rasm3.png";
import Rasm1 from "@/assets/rasm33.png";
import Rasmaa from "@/assets/rasmcc.png";
import Rasmbb from "@/assets/rasmbb.png";
import Rasmcc from "@/assets/rasmaa.png";
import Fram33 from "@/assets/Frame33.png";
import Fram11 from "@/assets/Frame 11.png";
import Fram22 from "@/assets/Frame 22.png";
import Fram44 from "@/assets/Frame 44.png";
import ProductCard from "@/components/ProductCard";
import Arrow from "@/assets/Round Alt Arrow Right.png";
import CircularProgress from "@mui/material/CircularProgress";

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
} from "@/apis";
import SkeletonLoader from "@/components/SkeletonLoader";
import {
  calculateFinalPrice,
  calculateTimeLeft,
} from "@/utils/priceCalculation";
import Link from "next/link";

export default function Home() {
  const [seasonTop, setSeasonTop] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [allCategories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [positionOneBanners, setPositionOneBanners] = useState([]);
  const [positionTwoBanners, setPositionTwoBanners] = useState([]);
  const [dynamicViewProducts, setDynamicViewProducts] = useState([]);
  const [positionThreeBanners, setPositionThreeBanners] = useState([]);
  const [selectedCategoryProducts, setSelectedCategoryProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState();
  const [seventyFiveTimeLeft, setSeventyFiveTimeLeft] = useState();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    (async () => {
      const trendingRes = await trendingProductsApi();
      setTrendingProducts(trendingRes?.data?.products || []);

      // const res = await getSuggestedProductsApi();
      // const recentRes = await guestRecentProductsApi();
      // setSuggestedProducts(res?.data?.products || []);
    })();
  }, []);

  // all products
  useEffect(() => {
    (async () => {
      const { data } = await getAllProductsApi();
      setAllProducts(data.products);
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
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const positionOneBanners = await getBannersApi(1);
      setPositionOneBanners(positionOneBanners.data.banners);
      const positionTwoBanners = await getBannersApi(2);
      setPositionTwoBanners(positionTwoBanners.data.banners);
      const positionThreeBanners = await getBannersApi(3);
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
  // console.log(allCategories[0]);

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

  // console.log(allProducts);

  // /+++++++++++++++++++++++++++++++falsh sale products++++++++++++++++++++++++++++++++++++++++++
  const flashSaleProducts = allProducts.filter(
    (product) =>
      product?.offer?.name?.toLowerCase() === "flash sale".toLowerCase()
  );
  const endDate = new Date(flashSaleProducts[0]?.offer?.end_date);
  useEffect(() => {
    const timer = setTimeout(() => {
      const endDate = flashSaleProducts[0]?.offer?.end_date;
      const leftTime = calculateTimeLeft(endDate);
      setTimeLeft(leftTime);
    }, 1000);
    return () => clearTimeout(timer);
  }, [endDate, timeLeft]);

  // ++++++++++++++++++++++++75% off products++++++++++++++++++++++++++++++++++++++++++
  // /category sale 75% off
  const seventyFivePercentSaleProducts = allProducts.filter(
    (product) =>
      product?.offer?.discount_type?.toLowerCase() ===
        "percentage".toLowerCase() &&
      product?.offer?.discount_value?.toLowerCase() === "75.00".toLowerCase()
  );
  const seventyFiveEndDate = new Date(
    seventyFivePercentSaleProducts[0]?.offer?.end_date
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const leftTime = calculateTimeLeft(seventyFiveEndDate);
      setSeventyFiveTimeLeft(leftTime as any);
    }, 1000);
    return () => clearTimeout(timer);
  }, [seventyFiveEndDate, seventyFiveTimeLeft]);
  // discount prices for 75% product
  const { basePrice, price, discountInfo } = calculateFinalPrice(
    seventyFivePercentSaleProducts[0],
    null
  );
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // +++++++++++++++++++++++++++++++++++++++++50% off products ++++++++++++++++++++++++++++++++++++++++++
  const fiftyPercentSaleProducts = allProducts.filter(
    (product) =>
      product?.offer?.discount_type?.toLowerCase() ===
        "percentage".toLowerCase() &&
      product?.offer?.discount_value?.toLowerCase() === "50.00".toLowerCase()
  );

  // ALL COMMENTED CODE BELOW DO NOT REMOVE IT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  // recentProducts
  // useEffect(() => {
  //   (async () => {
  //     const recentProd = await getRecentProductsApi();
  //     setRecentProducts(recentProd?.data?.products || []);
  //   })();
  // }, []);
  // season top
  // useEffect(() => {
  //   (async () => {
  //     const { data } = await getSeasonTop();
  //     setSeasonTop(data.products);
  //   })();
  // }, []);

  // first trending category
  // useEffect(() => {
  //   (async () => {
  //     const firstTrendingCategoryRes = await getFirstTrendingCategoryApi();
  //     setFirstTrendingCategory(firstTrendingCategoryRes);
  //   })();
  // }, []);

  // second trending ctegory
  // useEffect(() => {
  //   (async () => {
  //     const secondTrendingCategoryRes = await getSecondTrendingCategoryApi();
  //     setSecondTrendingCategory(secondTrendingCategoryRes);
  //   })();
  // }, []);

  // COMENTED
  // const handlePrev = (num: any) => {
  //   if (num == 1) {
  //     sliderRef1?.current?.previous();
  //   }
  //   if (num == 2) {
  //     sliderRef2?.current?.previous();
  //   }
  //   if (num == 3) {
  //     sliderRef3?.current?.previous();
  //   }

  //   if (num == 4) {
  //     sliderRef4?.current?.previous();
  //   }

  //   if (num == 5) {
  //     sliderRef5?.current?.previous();
  //   }
  //   if (num == 6) {
  //     sliderRef6?.current?.previous();
  //   }
  // };

  // const handleNext = (num: any) => {
  //   if (num == 1) {
  //     sliderRef1?.current?.next();
  //   }
  //   if (num == 2) {
  //     sliderRef2?.current?.next();
  //   }
  //   if (num == 3) {
  //     sliderRef3?.current?.next();
  //   }
  //   if (num == 4) {
  //     sliderRef4?.current?.next();
  //   }
  //   if (num == 5) {
  //     sliderRef5?.current?.next();
  //   }
  //   if (num == 6) {
  //     sliderRef6?.current?.next();
  //   }
  // };
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  return (
    <>
      {/* MianSlider */}
      <div className="lg:mx-[150px] md:mx-[60px] lg:px-0 md:px-3">
        <MainSlider banners={positionOneBanners} />
      </div>

      {/* Get Now Banner */}
      <div className="lg:my-[30px] my-[10px] lg:px-0 md:px-3 sm:my-[10px] md:my-[20px] lg:mx-[150px] mx-[0px] md:mx-[30px]">
        <div className="flex  items-center justify-between md:py-5 py-2 px-5  bg-gradient-to-r from-[#F81F1F] to-[#FFA31A] w-full lg:w-[100%] h-auto md:rounded-[20px] rounded-md shadow-lg">
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
      {loading ? (
        <CircularProgress size={24} color="inherit" />
      ) : (
        "Get Now"
      )}
    </button>
        </div>
      </div>

      {/* !!categories */}
      <div className="hide-scrollbar lg:mx-[150px] gap-2 sm:gap-2 lg:gap-0 mt-3 lg:mt-2 md:mx-auto overflow:-webkit-scrollbar: none; md:overflow-x-auto md:w-[645px] lg:w-auto sm:mx-auto sm:max-w-[calc(100vw - 120px)] flex items-center justify-between overflow-x-auto">
        {/* <div className="w-[92px] sm:mt-2   md:gap-2 flex flex-col justify-center items-center">
          <div className=" flex  justify-center items-center lg:w-[92px] lg:h-[92px] w-[70px] h-[70px] sm:w-[70px] sm:h-[70px] rounded-full bg-gradient-to-r from-[#F81F1F] to-[#FFA31A] ">
            <Image
              src={Cardmm}
              alt=""
              className="lg:w-[40px] lg:h-[40px] w-[30px] h-[30px] sm:h-[30px] sm:w-[30px] "
            />
          </div>
          <p className="color-[#393A44] lg:text-[14px] text-[10px] sm:text-[12px] font-normal mt-[4px]">
            Categories
          </p>
        </div> */}

        <div className="w-full flex items-center mx-2 text-center">
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

          {!allCategories?.length && (
            <>
              <div className="hidden md:flex justify-between w-full ml-2">
                {Array(8)
                  .fill(0)
                  .map((_, index) => (
                    <Skeleton
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
                      animation="wave"
                      variant="circular"
                      className="w-[70px] h-[70px]"
                    />
                  ))}
              </div>
            </>
          )}
        </div>

        {allCategories?.map((item: any) => (
          <>
            <div
              key={item?.id}
              className="w-full flex flex-col justify-center items-center mx-2 text-center"
              onClick={() => fn_categoryClicked(item)}
            >
              <div className="flex justify-center  hover:border border-[#FC3030] items-center lg:w-[92px] lg:h-[92px] w-[70px] h-[70px] sm:w-[70px] sm:h-[70px]  border-[#F70000] rounded-full bg-[#F8F8F8] ">
                {item?.image !== null ? (
                  <Image
                    width={40}
                    height={40}
                    src={item?.image}
                    alt=""
                    className=" lg:w-[40px] lg:h-[40px] w-[30px] h-[30px] sm:h-[30px] sm:w-[30px] "
                  />
                ) : (
                  <Image
                    width={40}
                    height={40}
                    src={Widget}
                    alt=""
                    className=" lg:w-[40px] lg:h-[40px] w-[30px] h-[30px] sm:h-[30px] sm:w-[30px] "
                  />
                )}
              </div>
              <p className="text-nowrap color-[#393A44] lg:text-[14px] text-[10px] sm:text-[12px] font-normal mt-[4px]">
                {item?.name}
              </p>
            </div>
          </>
        ))}
      </div>

      {/* !!Recent Products */}
      {/* <div className="lg:mx-[150px] md:mx-[60px]  my-[24px]">
        <div className="flex items-center justify-between lg:px-0 px-2">
          <p className="text-[24px] font-semibold">Recent Viewed</p>
          {recentProducts?.length ? (
            <div className="flex items-center gap-4">
              <div
                className="h-[46px] w-[46px] rounded-full bg-[#F5F5F5] flex items-center justify-center  "
                onClick={() => handlePrev(2)}
              >
                <IoMdArrowBack className="text-black h-[24px] w-[24px]" />
              </div>
              <div
                className="h-[46px] w-[46px] rounded-full bg-[#F5F5F5] flex items-center justify-center  "
                onClick={() => handleNext(2)}
              >
                <IoMdArrowForward className="text-black h-[24px] w-[24px]" />
              </div>
            </div>
          ) : null}
        </div>
        {recentProducts?.length ? (
          <div className="mx-[20px] sm:mx-[20px] md:mx-[20px] lg:mx-[0px]">
            <RecentViewSlider Data={recentProducts} ref={sliderRef1} />
          </div>
        ) : typeof recentProducts === "undefined" ? (
          <h1 className="text-center text-red-500">Loading products.....</h1>
        ) : (
          <h1 className="text-center text-red-500">No recent product found</h1>
        )}
      </div> */}

      {/* Flash sale */}
      <div className="flex justify-between items-center lg:mx-[150px] md:mx-[60px] mx-[14px] md:mt-14 mt-5">
        <span className="text-xl font-semibold">Flash Sale</span>
        <button
          className="flex items-center gap-3 border border-[#FC3030] text-[#FC3030] text-sm rounded-lg py-2 px-4"
          onClick={async () => {
            setIsLoading(true);
            await router.push(`/offers?id=${flashSaleProducts[0]?.offer?.id}`);
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

      <div className="flex md:p-4 p-2 rounded-lg md:gap-20 md:justify-start justify-between mx-[14px] items-center lg:mx-[150px] md:mx-[60px] mt-5 border border-[#00000033]">
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

      {/* trending category 1 */}
      <div className="lg:mx-[150px] md:mx-[60px] mx-[5px]">
        {/* <div className="flex items-center justify-between lg:px-0 px-2">
          <p className="text-[24px] font-semibold">
            {firstTrendingCategory?.data.category?.name}
          </p>
          {firstTrendingCategory?.data.products?.length ? (
            <div className="flex items-center gap-4">
              <div
                className="h-[46px] w-[46px] rounded-full bg-[#F5F5F5] flex items-center justify-center  "
                onClick={() => handlePrev(4)}
              >
                <IoMdArrowBack className="text-black h-[24px] w-[24px]" />
              </div>
              <div
                className="h-[46px] w-[46px] rounded-full bg-[#F5F5F5] flex items-center justify-center  "
                onClick={() => handleNext(4)}
              >
                <IoMdArrowForward className="text-black h-[24px] w-[24px]" />
              </div>
            </div>
          ) : null}
        </div> */}

        {flashSaleProducts?.length > 0 ? (
          <div>
            <RecentViewSlider Data={flashSaleProducts} ref={sliderRef6} />
          </div>
        ) : (
          <>
            <div className="hidden md:flex items-center justify-between">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <SkeletonLoader />
                ))}
            </div>
            <div className="md:hidden flex items-center justify-between">
              {Array(2)
                .fill(0)
                .map((_, index) => (
                  <SkeletonLoader />
                ))}
            </div>
          </>
        )}
      </div>

      {/* categories */}
      <div
        style={{ scrollbarWidth: "none" }}
        className="lg:mx-[150px] md:mx-[60px] mx-[14px] pb-2 md:my-[24px] mt-5 flex items-center  overflow-x-auto lg:justify-between gap-3"
      >
        {allCategories.map((item, index) => (
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

      <div className="lg:mx-[150px] md:mx-[60px] md:my-[24px] my-0">
        {selectedCategoryProducts?.length ? (
          <div>
            <RecentViewSlider
              Data={selectedCategoryProducts}
              ref={sliderRef6}
            />
          </div>
        ) : (
          <>
            <div className="hidden md:flex items-center justify-between">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <SkeletonLoader />
                ))}
            </div>
            <div className="md:hidden flex items-center justify-between">
              {Array(2)
                .fill(0)
                .map((_, index) => (
                  <SkeletonLoader />
                ))}
            </div>
          </>
        )}
      </div>

      {/* !!Baner */}
      {/* <div className="lg:mx-[150px] md:mx-[60px] m-[20px]  my-[16px]">
        <Image
          width={100}
          height={100}
          src={
            positionTwoBanners[0]?.imageUrl
              ? positionTwoBanners[0]?.imageUrl
              : bg
          }
          alt=""
          className="w-[100%] md:h-[300px] sm:h-[200px] h-[220px] lg:rounded-none rounded-lg sm:rounded-lg lg:h-[417px]"
        />
      </div> */}

      {/* !!dynamic view */}
      <div className="lg:mx-[150px] md:mx-[60px] mx-[14px] my-[24px]">
        <div className="flex items-center justify-between w-full">
          <p className="md:text-2xl text-lg font-semibold">Dynamic View</p>
          {/* <button className="flex items-center gap-3 border border-[#FC3030] text-[#FC3030] text-sm rounded-lg py-2 px-4">
            <span>View All</span>
            <FaArrowRightLong />
          </button> */}
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
                  <SkeletonLoader />
                ))}
            </div>
            <div className="md:hidden flex items-center justify-between">
              {Array(2)
                .fill(0)
                .map((_, index) => (
                  <SkeletonLoader />
                ))}
            </div>
          </>
        )}
      </div>

      {/* !!Suggested for you */}
      {/* {token !== null && (
        <div className="lg:mx-[150px] md:mx-[60px]  my-[24px]">
          <div className="flex items-center justify-between lg:px-0 px-2">
            <p className="text-[24px] font-semibold">Suggested for you</p>
            <button className="flex items-center gap-3 border border-[#FC3030] text-[#FC3030] text-sm rounded-lg py-2 px-4">
              <span>View All</span>
              <FaArrowRightLong />
            </button> */}
      {/* {suggestedProducts?.length > 0 ? (
              <div className="flex items-center gap-4">
                <div
                  className="h-[46px] w-[46px] rounded-full bg-[#F5F5F5] flex items-center justify-center  "
                  onClick={() => handlePrev(2)}
                >
                  <IoMdArrowBack className="text-black h-[24px] w-[24px]" />
                </div>

                <div
                  className="h-[46px] w-[46px] rounded-full bg-[#F5F5F5] flex items-center justify-center  "
                  onClick={() => handleNext(2)}
                >
                  <IoMdArrowForward className="text-black h-[24px] w-[24px]" />
                </div>
              </div>
            ) : null} */}
      {/* </div>

          {suggestedProducts?.length ? (
            <div className="mx-[20px] sm:mx-[20px] md:mx-[20px] lg:mx-[0px]">
              <RecentViewSlider Data={suggestedProducts} ref={sliderRef2} />
            </div>
          ) : (
            <div className="flex items-center justify-center text-center text-red-500 w-full p-10">
              <span>No Product Found</span>
            </div>
          )}
        </div>
      )} */}

      {/* banner */}
      <div className="lg:mx-[150px] md:mx-[60px] mx-0">
        <Image src={banner} alt="banner" />
      </div>

      {/* season top product */}
      {/* <div
        className="lg:mx-[150px] md:mx-[60px]  my-[24px] p-10"
        style={{
          background:
            "linear-gradient(97.69deg, rgba(247, 0, 0, 0.1) 3.55%, rgba(145, 131, 0, 0.1) 91.28%)",
        }}
      >
        <div className="flex items-center justify-between lg:px-0 px-2">
          <p className="text-[24px] font-semibold">Season Top Pick</p>
        </div>

        <div className=" flex flex-col md:flex-row md:gap-0 gap-5">
          <div className="product w-full md:w-[40%] md:h-[450px]">
            <ProductCard width="70" product={seasonTop[0]} />
          </div>
          <div className="w-full md:w-[70%] relative">
            <Image
              className="!relative w-full"
              alt="banners"
              fill
              src={
                positionTwoBanners[0]?.imageUrl
                  ? positionTwoBanners[0]?.imageUrl
                  : bg
              }
            />
          </div>
        </div>
      </div> */}

      {/* !!Trending Products */}
      {/* <div className="lg:mx-[150px] md:mx-[60px]  my-[24px]">
        <div className="flex items-center justify-between lg:px-0 px-2">
          <p className="text-[24px] font-semibold">Trending Products</p>
          {trendingProducts?.length ? (
            <div className="flex items-center gap-4">
              <div
                className="h-[46px] w-[46px] rounded-full bg-[#F5F5F5] flex items-center justify-center  "
                onClick={() => handlePrev(3)}
              >
                <IoMdArrowBack className="text-black h-[24px] w-[24px]" />
              </div>
              <div
                className="h-[46px] w-[46px] rounded-full bg-[#F5F5F5] flex items-center justify-center  "
                onClick={() => handleNext(3)}
              >
                <IoMdArrowForward className="text-black h-[24px] w-[24px]" />
              </div>
            </div>
          ) : null}
        </div>

        {trendingProducts?.length ? (
          <div className="mx-[20px] sm:mx-[20px] md:mx-[20px] lg:mx-[0px]">
            <RecentViewSlider Data={trendingProducts} ref={sliderRef3} />
          </div>
        ) : typeof suggestedProducts === "undefined" ? (
          <h1 className="text-center text-red-500">Loading products.....</h1>
        ) : (
          <h1 className="text-center text-red-500">
            No trending product found
          </h1>
        )}
      </div> */}

      {/* sale product */}
      <div className="flex lg:flex-row flex-col lg:mx-[150px] md:mx-[60px] mx-[5px] my-[24px] border border-[#E5E7EB] py-2 lg:px-6 px-1 rounded-md">
        <Link
          href={`/detailProduct/${seventyFivePercentSaleProducts[0]?.id}`}
          className="flex items-center justify-center md:gap-5 gap-2 lg:w-[60%] w-[100%] lg:border-r lg:border-[#77777740]"
        >
          <div className="relative h-[203px]">
            <Image
              alt=""
              width={203}
              height={203}
              src={seventyFivePercentSaleProducts[0]?.featured_image}
              className="w-full h-full object-cover outline-none	rounded-2xl cursor-pointer"
            />

            <div className="flex absolute w-full justify-between items-center absolute px-[16px] top-[10px]">
              <button className="text-[12px] rounded-3xl text-white bg-[#F70000] py-2 px-3">
                {discountInfo?.toUpperCase()}
              </button>
              <IconButton size="medium">
                <Image src={heart} alt="like" />
              </IconButton>
            </div>
          </div>

          <div className="flex flex-col lg:gap-3 gap-1">
            <span className="md:text-lg text-base font-semibold">
              {seventyFivePercentSaleProducts[0]?.title}
            </span>
            <div className="flex items-center gap-2">
              <Rating
                precision={0.5}
                name="read-only"
                readOnly
                value={Number(seventyFivePercentSaleProducts[0]?.rating)}
                defaultValue={Number(seventyFivePercentSaleProducts[0]?.rating)}
                className="lg:text-xl text-sm"
              />

              <span className="text-sm text-[#434343]">
                {seventyFivePercentSaleProducts[0]?.reviews}
              </span>
            </div>

            <div className="flex gap-4 items-center lg:mt-10">
              <span className="md:text-lg text-sm text-[#F70000] font-semibold">
                ₹{price}
              </span>
              <span className="text-[#949494] text-sm line-through">
                ₹{basePrice}
              </span>
            </div>

            <button className="lg:hidden text-[#F70000] py-3 border-[1px] border-[#F70001] rounded-lg">
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
        </Link>

        <div className="flex flex-col gap-4 lg:px-10 px-0 justify-center lg:w-[40%] w-[100%]">
          <div className="flex items-center gap-2 bg-[#F7000014] w-fit rounded-full py-2 px-3 text-[#FC3030]">
            <Image src={sale} alt="sale" />
            <span className="uppercase text-sm font-medium">
              {seventyFivePercentSaleProducts[0]?.offer?.name?.toUpperCase()}
            </span>
          </div>

          <div className="flex text-sm items-center gap-2">
            <span className="p-2 bg-[#E5E7EB] rounded-md font-bold">
              {seventyFiveTimeLeft?.days > 0
                ? seventyFiveTimeLeft?.days + "d"
                : seventyFiveTimeLeft?.hours > 0
                ? seventyFiveTimeLeft?.hours
                : 0}
            </span>
            <span className="p-2 bg-[#E5E7EB] rounded-md font-bold">
              {seventyFiveTimeLeft?.days > 0
                ? seventyFiveTimeLeft?.hours + "h"
                : seventyFiveTimeLeft?.minutes}
            </span>
            <span className="p-2 bg-[#E5E7EB] rounded-md font-bold">
              {seventyFiveTimeLeft?.days > 0
                ? seventyFiveTimeLeft?.minutes + "m"
                : seventyFiveTimeLeft?.seconds}
            </span>
            {/* <span>:</span>
            <span className="p-2 bg-[#E5E7EB] rounded-md font-bold">59</span> */}
            <span className="mr-2 text-[#949494]">
              Remains until the end of the offer
            </span>
          </div>

          <button className="hidden md:text-[#F70000] py-3 mt-4 border-[1px] border-[#F70001] rounded-lg">
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

      {/* 50% off */}
      <div className="lg:mx-[150px] md:mx-[60px] my-[24px]">
        <div className="flex items-center justify-between lg:px-0 px-2">
          <div className="flex justify-between items-center w-full">
            <p className="hidden md:block text-[24px] font-semibold">
              Minimum 50% On All Products
            </p>
            <p className="md:hidden text-md font-semibold">
              50% On All Products
            </p>
            <Link
              href={`/offers?id=${fiftyPercentSaleProducts[0]?.offer_id}`}
              passHref
              legacyBehavior
            >
              <button
                className="flex items-center gap-3 border border-[#FC3030] text-[#FC3030] text-sm rounded-lg py-2 px-4"
                onClick={async (e) => {
                  e.preventDefault();
                  setIsLoading(true);
                  await router.push(
                    `/offers?id=${fiftyPercentSaleProducts[0]?.offer_id}`
                  );
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
            </Link>
          </div>

          {/* {trendingProducts?.length ? (
            <div className="flex items-center gap-4">
              <div
                className="h-[46px] w-[46px] rounded-full bg-[#F5F5F5] flex items-center justify-center  "
                onClick={() => handlePrev(3)}
              >
                <IoMdArrowBack className="text-black h-[24px] w-[24px]" />
              </div>
              <div
                className="h-[46px] w-[46px] rounded-full bg-[#F5F5F5] flex items-center justify-center  "
                onClick={() => handleNext(3)}
              >
                <IoMdArrowForward className="text-black h-[24px] w-[24px]" />
              </div>
            </div>
          ) : null} */}
        </div>

        {fiftyPercentSaleProducts?.length ? (
          <div className="mx-[20px] sm:mx-[20px] md:mx-[20px] lg:mx-[0px]">
            <RecentViewSlider
              Data={fiftyPercentSaleProducts}
              ref={sliderRef3}
            />
          </div>
        ) : (
          <>
            <div className="hidden md:flex items-center justify-between">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <SkeletonLoader />
                ))}
            </div>
            <div className="md:hidden flex items-center justify-between">
              {Array(2)
                .fill(0)
                .map((_, index) => (
                  <SkeletonLoader />
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
        className="lg:mx-[150px] md:mx-[60px] mx-0 relative lg:px-[70px] px-[20px] sm:px-[40px] md:px-[40px] my-[16px] flex lg:flex-row justify-between"
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
    </>
  );
}
