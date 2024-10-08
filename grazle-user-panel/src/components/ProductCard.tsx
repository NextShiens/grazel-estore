"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { FaStar, FaHeart } from "react-icons/fa";
import { updateCart } from "@/features/features";
import { toast } from "react-toastify";
import Cart from "@/assets/CartVector.png";
import { IconButton } from "@mui/material";
import { favoriteProductApi } from "@/apis";
import heart from "@/assets/like.png";

interface ProductCardProps {
  product: any;
  offerId?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, offerId }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [touchedProductId, setTouchedProductId] = useState<number | null>(null);
  const [favoriteProducts, setFavoriteProducts] = useState<number[]>([]);
  const [isPending, setPending] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const basePrice = parseFloat(product.price);
  const discount = parseFloat(product?.offer?.discount_value || product?.discount);
  const price = basePrice - (basePrice * discount) / 100;
  const discountInfo = `${discount}% off`;

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

  const truncateTitle = (title: string, maxLength: number = 40) => {
    return title?.length > maxLength ? `${title.slice(0, maxLength)}` : title;
  };

  return (
    <div
      className={`group relative w-full max-w-[220px] md:max-w-sm mx-auto border mb-4 rounded-2xl transition-all duration-300 ease-in-out overflow-hidden 
        h-[240px] sm:h-[350px]
        hover:h-[280px] sm:hover:h-[370px]
        ${touchedProductId === product.id ? 'border-[#E5E5E5]' : 'border-[#E5E5E5]'}
        mb-10`} 
      onClick={() => setTouchedProductId(product.id)}
    >
      <div className="relative">
        <div
          onClick={goToDetail}
          className="cursor-pointer relative"
        >
          {product?.featured_image ? (
            <div className="w-full h-[120px] sm:h-[180px] flex items-center justify-center">
              <Image
                alt="Product Image"
                width={screen.width < 640 ? 180 : 190}
                height={screen.width < 640 ? 120 : 160}
                src={product.featured_image}
                className="w-full h-full object-cover rounded-t-2xl"
                onError={(e) => {
                  console.error("Image failed to load:", e);
                  (e.target as HTMLImageElement).src =
                    "/path/to/fallback-image.jpg";
                }}
              />
            </div>
          ) : (
            <div className="w-full h-[120px] sm:h-[180px] flex items-center justify-center bg-gray-200 rounded-t-2xl"></div>
          )}

          <div className="p-3">
            <p className="text-[13px] sm:text-[15px] w-[100%] h-[40px] overflow-hidden">
              {truncateTitle(product?.title)}
            </p>
            <div className="flex items-center mt-[4px] sm:mt-[8px] gap-1">
              <span className="text-[8px] sm:text-[10px] text-[#F69B26]">
                {product?.rating} ({product?.reviews})
              </span>
              <FaStar size={8} className="sm:text-[10px]" color="#F69B26" />
            </div>

            <p className="text-[14px] sm:text-[18px] text-[#FC3030] font-semibold mt-[4px] sm:mt-[8px]">
              ₹{typeof price === "number" ? price.toFixed(2) : price}
            </p>

            <div className="flex items-center mt-[4px] sm:mt-[8px]">
              <p className="text-[10px] sm:text-[14px] text-[#909198] line-through font-normal">
                ₹
                {typeof basePrice === "number" ? basePrice.toFixed(2) : basePrice}
              </p>

              <p className="text-[10px] sm:text-[14px] text-[#4FAD2E] ml-[12px] sm:ml-[20px] font-semibold">
                {discountInfo}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-2 right-2">
          <IconButton
            size="small"
            onClick={(e) => onLiked(e, product.id)}
            disabled={isPending}
            className="bg-white bg-opacity-70 hover:bg-opacity-100"
          >
            {favoriteProducts && favoriteProducts.includes(product.id) ? (
              <FaHeart className="text-[#F70000]" />
            ) : (
              <Image src={heart} alt="like" width={26} height={26} />
            )}
          </IconButton>
        </div>
      </div>
      <div className="mb-2 flex justify-center w-full opacity-0 group-hover:opacity-100 group-[.active]:opacity-100">
        <button
          className="text-[#F70000] w-[90%] h-[28px] sm:h-[32px] border-[1px] border-[#F70001] rounded-lg bg-white hidden group-hover:block group-[.active]:block"
          onClick={(e) => onAddingCart(e)}
        >
          <div className="flex items-center justify-center">
            <p className="font-semibold text-[10px] sm:text-[10px]">
              Add to cart
            </p>
            <Image
              alt="cart"
              src={Cart}
              className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] ml-[8px]"
            />
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;