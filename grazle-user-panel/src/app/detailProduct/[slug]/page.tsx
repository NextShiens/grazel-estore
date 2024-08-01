"use client";
import {
  getBrandDetails,
  favoriteProductApi,
  getBrandProductsApi,
  getProductBySlugApi,
  addSuggestedProductsApi,
} from "@/apis";
import Image from "next/image";
import heart from "@/assets/like.png";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import ReviewSection from "@/components/ReviewCard";
import { onVariantChange, updateCart } from "@/features/features";
import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import LinearProgress from "@mui/joy/LinearProgress";
import { calculateDiscountPercentage } from "@/utils";
import { FaAngleDown, FaStar } from "react-icons/fa6";
import { useRouter, useParams } from "next/navigation";
import { Box, IconButton, Rating } from "@mui/material";
import { FaCheckCircle, FaChevronDown, FaHeart } from "react-icons/fa";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { HiOutlineMinus, HiOutlinePlus } from "react-icons/hi";
import {
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import Star from "@/assets/Star 1.png";
import Cart from "@/assets/CartVector.png";
import logo from "@/assets/Grazle Logo.png";
import Logoo from "@/assets/Grazle Logo.png";
import Product from "@/assets/Product Image.png";
import Like from "@/assets/Frame 1820551183.png";
import Card1 from "@/assets/a5a6296b2158604a47215a2b0a00bde0.png";
import { MdExpandMore } from "react-icons/md";
import { calculateFinalPrice } from "@/utils/priceCalculation";
import LikeButton from "@/components/LikeButton";
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://api.grazle.co.in/api";

export default function ProductDetail() {
  const dispatch = useDispatch();
  const [count, setCount] = useState(1);
  const [brandId, setBrandId] = useState(0);
  const [isPending, setPending] = useState(false);
  const [currentStore, setCurrentStore] = useState({});
  const [singleProduct, setSingleProduct] = useState(null);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [currentProductId, setCurrentProductId] = useState("");
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [storeProductsDetails, setStoreProductsDetails] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedTab, setSelectedTab] = useState("description");
  const [showPopup, setShowPopup] = useState(false);
  const [reviews, setReviews] = useState([]);


  const router = useRouter();
  const { slug } = useParams();

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const { data } = await getProductBySlugApi(slug);
        if (data && data.product) {
          setSingleProduct(data.product);
          if (data.product.variants && data.product.variants.length > 0) {
            setSelectedVariant(data.product.variants[0]);
            setCurrentVariant(data.product.variants[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        toast.error("Failed to load product data");
      }
    };
    fetchProductData();
  }, [slug]);
  const url = `${BASE_URL}/global/products/reviews/${slug}`;

  useEffect(() => {
    async function fetchProductReviews() {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }

        const data = await response.json();
        setReviews(data); // Update state with the fetched reviews
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    fetchProductReviews();
  }, [url]);

  useEffect(() => {
    const fetchBrandData = async () => {
      if (!singleProduct?.brand_id) return;
      try {
        const { data } = await getBrandProductsApi(singleProduct.brand_id);
        setStoreProductsDetails(data.products || []);
        const res = await getBrandDetails(singleProduct.brand_id);
        setCurrentStore(res.data.store || {});
      } catch (error) {
        console.error("Error fetching brand data:", error);
        toast.error("Failed to load brand data");
      }
    };
    fetchBrandData();
  }, [singleProduct?.brand_id]);

  const handleIncrement = () => setCount((prev) => prev + 1);
  const handleDecrement = () => setCount((prev) => (prev > 1 ? prev - 1 : 1));

  const goToShop = () => {
    if (singleProduct?.store?.store_id) {
      router.push(`/StoreProduct?id=${singleProduct.store.store_id}`);
    }
  };

  const handleClick = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);

  async function onLiked(e, productId) {
    e.stopPropagation();
    if (isPending) return;

    try {
      setPending(true);
      const formdata = new FormData();
      formdata.append("product_id", productId);
      const favoriteProductIds = [...favoriteProducts];
      if (favoriteProductIds.includes(productId)) {
        setFavoriteProducts(
          favoriteProductIds.filter((id) => id !== productId)
        );
      } else {
        setFavoriteProducts([...favoriteProductIds, productId]);
      }
      await favoriteProductApi(formdata);
    } catch (error) {
      console.error("Error liking product:", error);
      toast.error("Failed to update favorite status");
    } finally {
      setTimeout(() => setPending(false), 200);
    }
  }
  const excellentRating =
    (singleProduct?.total_rating?.total_excellent_count /
      singleProduct?.total_rating?.total_rating_count) *
    100;

  const topVgRating =
    (singleProduct?.total_rating?.total_verygood_count /
      singleProduct?.total_rating?.total_rating_count) *
    100;

  const goodRating =
    (singleProduct?.total_rating?.total_good_count /
      singleProduct?.total_rating?.total_rating_count) *
    100;

  const averageRating =
    (singleProduct?.total_rating?.total_average_count /
      singleProduct?.total_rating?.total_rating_count) *
    100;

  const poorRating =
    (singleProduct?.total_rating?.total_poor_count /
      singleProduct?.total_rating?.total_rating_count) *
    100;

  const { basePrice, price, discountInfo } = calculateFinalPrice(
    singleProduct,
    selectedVariant ? selectedVariant.id : null
  );

  const onAddingCart = (e, product) => {
    e.stopPropagation();
    if (!product) return;
    setCurrentProductId(product.id);
    const updateProduct = {
      ...product,
      qty: count,
      discountPrice: price,
      originalPrice: basePrice,
      discountInfo: discountInfo,
    };
    dispatch(updateCart({ type: null, product: updateProduct }));
    toast.success("Item has been added to cart!");
  };

  const onVariantChangeFunc = (id) => {
    const { basePrice, price, discountInfo } = calculateFinalPrice(
      singleProduct,
      id
    );
    dispatch(
      onVariantChange({
        product: {
          ...singleProduct,
          discountPrice: price,
          originalPrice: basePrice,
          discountInfo: discountInfo,
        },
      })
    );
  };

  if (!singleProduct) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="lg:my-[50px] my-[20px] sm:my-[20px] md:my-[30px] lg:mx-[150px] mx-[20px] sm:mx-[20px] md:mx-[30px]">
        <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap justify-between">
          <div className="w-[100%] sm:w-[100%] md:w-[100%] lg:w-[40%]">
            {singleProduct.featured_image && (
              <Image
                alt={singleProduct.title || "Product image"}
                height={350}
                width={350}
                src={singleProduct.featured_image}
                className="w-full h-[350px] sm:[400px] md:[400px] lg:h-[500px]"
              />
            )}
            <div className="flex justify-between mt-5 lg:mt-10">
              {singleProduct.gallery?.map((item, index) => (
                <Image
                  key={index}
                  alt={`Gallery image ${index + 1}`}
                  width={90}
                  height={90}
                  src={item?.image}
                  className="lg:w-[90px] lg:h-[90px] h-[60px] sm:h-[60px] md:h-[60px] w-[60px] sm:w-[60px] md:w-[60px] hover:border-[1px] border-[#F70000]"
                />
              ))}
            </div>
          </div>

          <div className="w-[100%] sm:w-[100%] md:w-[100%] lg:w-[50%]">
            <p className="lg:text-[32px] text-[24px] sm:text-[24px] md:text-[24px] font-semibold">
              {singleProduct.title}
            </p>

            <div className="flex mt-2 items-center gap-2">
              <Rating
                name="read-only"
                precision={0.1}
                defaultValue={
                  Number(singleProduct.total_rating?.average_rating) || 0
                }
                value={Number(singleProduct.total_rating?.average_rating) || 0}
                readOnly
                sx={{
                  "& .MuiSvgIcon-root": {
                    fontSize: 18,
                  },
                }}
              />
              <p className="text-[14px] text-[#666666] font-normal">
                {singleProduct.total_rating?.total_rating_count || 0} Review
              </p>
            </div>
            <div className="mt-3">
              {Number(price) < basePrice && (
                <p className="text-[32px] text-[#F70000] font-bold">
                  ₹ {Number(price?.toFixed(2))}
                </p>
              )}
            </div>

            <div className="flex text-start justify-start gap-2 pb-8 border-b-[1px] border-[#0000001A]">
              {Number(price) < basePrice && (
                <p className="text-[16px] text-[#909198] font-normal line-through">
                  ₹ {Number(basePrice)?.toFixed(2)}
                </p>
              )}
              {price < basePrice && (
                <p className="text-[16px] text-[#4FAD2E] font-normal">
                  {discountInfo}
                </p>
              )}
            </div>

            <div className="mt-4">
              <p className="text-[14px] text-[#000000] font-semibold">
                Variants
              </p>
              <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center justify-between mt-2 gap-3">
                <div className="flex items-center gap-3">
                  {singleProduct.variants?.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setCurrentVariant(item.id);
                        setSelectedVariant(item);
                        onVariantChangeFunc(item.id);
                      }}
                      className={`py-2 px-3 bg-[#FEF2F2] rounded-lg border-[1px] cursor-pointer ${
                        currentVariant === item.id
                          ? "border-[#F70000] text-[#F70000]"
                          : "border-[#E6E6E6]"
                      }`}
                    >
                      {item.variant}
                    </div>
                  ))}
                </div>
                <div className="w-[124px] rounded-full border-[1px] border-[#E6E6E6] p-2 flex items-center justify-between">
                  <div
                    className="w-[34px] h-[34px] rounded-full bg-[#F2F2F2] flex items-center cursor-pointer justify-center"
                    onClick={handleDecrement}
                  >
                    <HiOutlineMinus className="text-[16px] font-bold" />
                  </div>
                  <p className="text-[16px] font-bold">{count}</p>
                  <div
                    className="w-[34px] h-[34px] rounded-full bg-[#F2F2F2] flex items-center cursor-pointer justify-center"
                    onClick={handleIncrement}
                  >
                    <HiOutlinePlus className="text-[16px] font-bold" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  className="bg-[#F70000] rounded-full h-[50px] mt-[20px] lg:w-[275px] w-[200px] sm:w-[200px] md:w-[200px] font-medium text-white"
                  onClick={(e) => onAddingCart(e, singleProduct)}
                >
                  Add to cart
                </button>
                <button
                  className="border-[1px] border-[#F70000] rounded-full h-[50px] mt-[20px] lg:w-[275px] w-[200px] sm:w-[200px] md:w-[200px] font-medium text-[#F70000]"
                  onClick={() => router.push("/address")}
                >
                  Get Started
                </button>
                {/* <div className="flex justify-center mt-[20px] items-center rounded-full bg-[#F8F8F8] h-[52px] w-[52px]">
                  <IconButton
                    size="medium"
                    onClick={(e) => onLiked(e, singleProduct?.id)}
                  >
                    {favoriteProducts?.includes(singleProduct?.id) ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <Image src={heart} alt="like" />
                    )}
                  </IconButton>
                </div> */}
                <div className="mt-[20px] flex justify-center items-center rounded-full h-[52px] w-[52px]">
                  <LikeButton productId={singleProduct?.id} />
                </div>
              </div>

              <div className="rounded-2xl mt-4 border-[1px] border-[#E6E6E6] px-4 py-2">
                <div className="flex justify-between items-center pb-3 border-b-[1px] border-[#0000000D]">
                  <div className="flex gap-4 items-center">
                    <div className="flex justify-center items-center rounded-full bg-[#F8F8F8] h-[52px] w-[52px]">
                      {currentStore?.store_image && (
                        <Image
                          alt="Store logo"
                          width={30}
                          height={20}
                          src={"/" + currentStore?.store_image}
                          className="w-[30px] h-[20px]"
                        />
                      )}
                    </div>
                    <p className="text-[14px] text-[#000000] font-semibold">
                      {currentStore?.store_name}
                    </p>
                  </div>
                  <button
                    className="border-[1px] border-[#F70000] text-[10px] rounded-full h-[25px] w-[85px] font-medium text-[#F70000]"
                    onClick={goToShop}
                  >
                    view shop
                  </button>
                </div>
                <div className="flex items-center justify-evenly mt-5">
                  <div>
                    <div className="flex items-center gap-2 justify-center">
                      <FaStar className="text-[#FFB33E] text-[16px]" />
                      <p className="text-[#000000] text-[14px] font-bold">
                        {currentStore.store_rating || 0}
                      </p>
                      <p className="text-[#777777] text-[14px]">
                        ({currentStore.store_reviews || 0})
                      </p>
                    </div>
                    <p className="text-[#777777] text-center text-[12px]">
                      Ratings
                    </p>
                  </div>
                  <div className="border-r-[1px] border-[#0000000D] h-[30px]"></div>
                  <div>
                    <div className="flex items-center gap-2 justify-center">
                      <p className="text-[#000000] text-[14px] font-bold">
                        {currentStore.store_products || 0}
                      </p>
                    </div>
                    <p className="text-[#777777] text-center text-[12px]">
                      products
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10 items-center pb-2 gap-4 border-b-[1px] border-[##E5E5E5]">
          <p
            className={`${
              selectedTab === "description"
                ? "text-[#F70000]"
                : "text-[#777777]"
            } text-[14px] font-semibold cursor-pointer`}
            onClick={() => setSelectedTab("description")}
          >
            Descriptions
          </p>
          <p
            className={`${
              selectedTab === "productInfo"
                ? "text-[#F70000]"
                : "text-[#777777]"
            }  text-[14px] font-semibold cursor-pointer`}
            onClick={() => setSelectedTab("productInfo")}
          >
            Product info
          </p>
          <p
            className={` ${
              selectedTab === "faq" ? "text-[#F70000]" : "text-[#777777]"
            } text-[14px] font-semibold cursor-pointer`}
            onClick={() => setSelectedTab("faq")}
          >
            FAQs
          </p>
        </div>

        {selectedTab === "description" && (
          <div className="mt-4 lg-p-10 p-4">
            <h1>{singleProduct?.title}</h1>
            <p>{singleProduct?.brand?.name}</p>
            <p>{singleProduct?.category?.name}</p>
            <p className="text-[#808080] text-[14px] font-normal">
              {singleProduct?.description}
            </p>
          </div>
        )}

        {selectedTab === "productInfo" && (
          <div className="mt-4 lg-p-10 p-4">
            <p className="text-[#808080] text-[14px] font-normal">
              {singleProduct?.product_info}
            </p>
          </div>
        )}

        {selectedTab === "faq" && (
          <div className="mt-4 lg-p-10 p-4">
            {singleProduct?.faqs?.map((faq) => (
              <Accordion key={faq.id}>
                <AccordionSummary
                  expandIcon={<MdExpandMore />}
                  aria-controls={`panel${faq.id}-content`}
                  id={`panel${faq.id}-header`}
                >
                  <Typography>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        )}

        <div>
          <ReviewSection reviewsData={reviews} />
        </div>

        <p className="text-[#000000] text-[19px] border-t pt-5 mt-5">
          More from the store
        </p>
        <div className="p-6 lg:p-10 overflow-x-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8 ">
          {storeProductsDetails.slice(0, 4).map((item) => (
            <ProductCard width="25" key={item.id} product={item} />
          ))}
        </div>
      </div>
    </>
  );
}
