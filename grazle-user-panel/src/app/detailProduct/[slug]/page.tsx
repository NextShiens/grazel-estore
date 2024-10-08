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
import { useSwipeable } from "react-swipeable";

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
  const [storeProductsDetails, setStoreProductsDetails] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedTab, setSelectedTab] = useState("description");
  const [showPopup, setShowPopup] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [favoriteProducts, setFavoriteProducts] = useState<number[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const url = `${BASE_URL}global/products/reviews/${slug}`;

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
        setReviews(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    fetchProductReviews();
  }, [url]);

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
    const fetchBrandData = async () => {
      if (!singleProduct?.brand_id) return;
      try {
        const { data } = await getBrandProductsApi(singleProduct.brand_id);
        setStoreProductsDetails(data.products || []);
        const res = await getBrandDetails(singleProduct.brand_id);
        console.log("res", res);
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

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

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
        selectedVariant: selectedVariant,
      };
      dispatch(updateCart({ type: null, product: updateProduct }));
      toast.success("Item has been added to cart!");
    };

    const onVariantChangeFunc = (variant) => {
      setSelectedVariant(variant);
      setCurrentVariant(variant.id);
      const { basePrice, price, discountInfo } = calculateFinalPrice(
        singleProduct,
        variant.id
      );
      dispatch(
        onVariantChange({
          product: {
            ...singleProduct,
            discountPrice: price,
            originalPrice: basePrice,
            discountInfo: discountInfo,
            selectedVariant: variant,
          },
        })
      );
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

  const images = singleProduct
    ? [
      singleProduct.featured_image,
      ...(singleProduct.gallery?.map((item) => item.image) || []),
    ]
    : [];

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    },
    onSwipedRight: () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    },
  });

  if (!singleProduct) {
    return <div>Loading...</div>;
  }

  const calculateDiscount = (product) => {
    if (product.offer && product.offer.active) {
      // If there's an active offer, use the offer discount
      const offerDiscount = parseFloat(product?.offer?.discount_value|| product?.price);
      const originalPrice = parseFloat(product?.price);
      const discountedPrice = originalPrice - (originalPrice * offerDiscount / 100);
      return {
        discountPercentage: offerDiscount,
        discountedPrice: discountedPrice.toFixed(2)
      };
    } else {
      // If no offer, use the product's original discount
      const originalPrice = parseFloat(product.price);
      const discountedPrice = parseFloat(product.discounted_price);
      const discountPercentage = ((originalPrice - discountedPrice) / originalPrice) * 100;
      return {
        discountPercentage: discountPercentage,
        discountedPrice: discountedPrice.toFixed(2)
      };
    }
  };

  const { discountPercentage, discountedPrice } = calculateDiscount(singleProduct);
  return (
    <>
      <div className="lg:my-[50px] my-[20px] sm:my-[20px] md:my-[30px] lg:mx-[150px] mx-[20px] sm:mx-[20px] md:mx-[30px]">
        <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap justify-between">
          <div className="w-[100%] sm:w-[100%] md:w-[100%] lg:w-[40%]">
            <div {...handlers} className="relative">
              {images[currentImageIndex] && (
                <Image
                  alt={singleProduct.title || "Product image"}
                  height={350}
                  width={350}
                  src={images[currentImageIndex]}
                  className="w-full h-[350px] sm:[400px] md:[400px] lg:h-[500px] cursor-pointer"
                  onClick={() => handleImageClick(images[currentImageIndex])}
                  quality={100}
                  priority={true}
                />
              )}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full mx-1 ${index === currentImageIndex ? "bg-red-500" : "bg-gray-300"
                      }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-5 lg:mt-10 gap-2">
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <Image
                    key={index}
                    alt={`Gallery image ${index + 1}`}
                    width={90}
                    height={90}
                    src={image}
                    className={`lg:w-[90px] lg:h-[90px] h-[70px] w-[70px] sm:h-[80px] sm:w-[80px] md:h-[85px] md:w-[85px] hover:border-2 border-[#F70000] cursor-pointer rounded-md ${index === currentImageIndex
                      ? "border-2 border-[#F70000]"
                      : ""
                      }`}
                    onClick={() => setCurrentImageIndex(index)}
                    quality={100}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="w-[100%] sm:w-[100%] md:w-[100%] lg:w-[50%]">
            <div className="flex justify-between items-center mt-2">
              <p className="lg:text-[32px] text-[18px] sm:text-[18px] md:text-[18px] font-semibold flex-grow mr-2">
                {singleProduct.title}
              </p>
              <div className="sm:hidden flex-shrink-0">
                <IconButton
                  size="large"
                  onClick={(e) => onLiked(e, singleProduct?.id)}
                  disabled={isPending}
                  className="bg-white bg-opacity-70 hover:bg-opacity-100 p-2"
                  style={{ marginBottom: "10px" }}
                >
                  {favoriteProducts &&
                    favoriteProducts.includes(singleProduct?.id) ? (
                    <FaHeart className="text-[#F70000] text-[32px]" />
                  ) : (
                    <Image src={heart} alt="like" width={32} height={32} />
                  )}
                </IconButton>
              </div>
            </div>

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
            <div className="flex text-start justify-start gap-2 pb-8 border-b-[1px] border-[#0000001A]">
          <p className="text-[18px] text-[#F70000] font-semibold">
            ₹ {discountedPrice}
          </p>
          {parseFloat(discountedPrice) && (
            <>
              <p className="text-[16px] text-[#909198] font-normal line-through">
                ₹ {parseFloat(singleProduct.price).toFixed(2)}
              </p>
              <p className="text-[16px] text-[#4FAD2E] font-normal">
                {discountPercentage.toFixed(0)}% OFF
              </p>
            </>
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
                    onClick={() => onVariantChangeFunc(item)}
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
                  className="bg-[#F70000] rounded-full h-[60px] mt-[20px] font-medium text-white flex items-center justify-center w-full sm:h-[50px] hidden sm:flex"
                  onClick={(e) => onAddingCart(e, singleProduct)}
                >
                  Add to cart
                </button>
                <button
                  className="bg-[#F70000] rounded-md h-[50px] mt-[20px] font-medium text-white flex items-center justify-center w-full sm:hidden"
                  onClick={(e) => onAddingCart(e, singleProduct)}
                >
                  Add to cart
                </button>

                <div className="mt-[18px] flex justify-center items-center rounded-full h-[72px] w-[68px] hidden sm:block">
                  <IconButton
                    size="large"
                    onClick={(e) => onLiked(e, singleProduct?.id)}
                    disabled={isPending}
                    className="bg-white bg-opacity-70 hover:bg-opacity-100 h-[64px] w-[64px]"
                  >
                    {favoriteProducts &&
                      favoriteProducts.includes(singleProduct?.id) ? (
                      <FaHeart className="text-[#F70000] text-[32px]" />
                    ) : (
                      <Image src={heart} alt="like" width={32} height={32} />
                    )}
                  </IconButton>
                </div>
              </div>

              <div className="rounded-2xl mt-4 border-[1px] border-[#E6E6E6] px-4 py-2">
                <div className="flex justify-between items-center pb-3">
                  <div className="flex gap-4 items-center">
                    <div className="flex justify-center items-center rounded-full bg-[#F8F8F8] h-[52px] w-[52px]">
                      {singleProduct?.store?.image && (
                        <Image
                          src={singleProduct?.store?.image || logo}
                          alt={`${singleProduct?.store?.image}'s profile`}
                          width={48}
                          height={48}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                      )}
                    </div>
                    <p className="text-[14px] text-[#000000] font-semibold">
                      {singleProduct?.store?.store_name || "Store Name"}
                    </p>
                  </div>
                  <button
                    className="border-[1px] border-[#F70000] text-[10px] rounded-full h-[25px] w-[85px] font-medium text-[#F70000]"
                    onClick={goToShop}
                  >
                    view shop
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10 items-center pb-2 gap-4 border-b-[1px] border-[##E5E5E5]">
          <p
            className={`${selectedTab === "description"
              ? "text-[#F70000]"
              : "text-[#777777]"
              } text-[14px] font-semibold cursor-pointer`}
            onClick={() => setSelectedTab("description")}
          >
            Descriptions
          </p>
          <p
            className={`${selectedTab === "productInfo"
              ? "text-[#F70000]"
              : "text-[#777777]"
              }  text-[14px] font-semibold cursor-pointer`}
            onClick={() => setSelectedTab("productInfo")}
          >
            Product info
          </p>
          <p
            className={` ${selectedTab === "faq" ? "text-[#F70000]" : "text-[#777777]"
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

        <p className="text-[#000000] text-[19px] border-t pt-5 mt-5 -mb-10">
          More from frequently Our Store
        </p>
      </div>
      <div className="container lg:!w-[80%] sm:!w-full justify-center m-auto p-4 overflow-x-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {storeProductsDetails?.map((item) => (
          <ProductCard width="25" key={item.id} product={item} />
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="relative">
            <Image
              src={selectedImage}
              alt="Selected product image"
              width={800}
              height={800}
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
            <button
              className="absolute top-4 right-4 text-red-500 text-2xl bg-white rounded-full w-8 h-8 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
