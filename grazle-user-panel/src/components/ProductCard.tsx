"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { FaStar, FaHeart } from "react-icons/fa";
import { calculateFinalPrice } from "@/utils/priceCalculation";
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

  const { basePrice, price, discountInfo } = calculateFinalPrice(product, null);

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
      toast.error("An error occurred while updating favorite status");
    } finally {
      setPending(false);
    }
  }

  const truncateTitle = (title: string, maxLength: number = 40) => {
    return title?.length > maxLength ? `${title.slice(0, maxLength)}` : title;
  };

  return (
    <div
      className={`group relative w-full max-w-[220px] md:max-w-sm mx-auto border mb-4 rounded-2xl transition-all duration-300 ease-in-out ${
        touchedProductId === product.id ? "active" : ""
      }`}
      onClick={() => setTouchedProductId(product.id)}
    >
      <div
        onClick={goToDetail}
        className="cursor-pointer relative overflow-hidden"
      >
        {product?.featured_image ? (
          <div className="w-full h-[120px] md:h-[180px] flex items-center justify-center">
            <Image
              alt="Product Image"
              width={screen.width < 640 ? 200 : 190}
              height={screen.width < 640 ? 130 : 160}
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
          <div className="w-full h-[130px] md:h-[180px] flex items-center justify-center bg-gray-200 rounded-t-2xl"></div>
        )}

        <div className="p-3">
          <p className="text-[14px] md:text-[15px] w-[100%] font-semibold h-[40px] overflow-hidden">
            {product?.title}
          </p>
          <div className="flex items-center mt-[4px] md:mt-[8px] gap-1">
            <span className="text-[8px] md:text-[10px] text-[#F69B26]">
              {product?.rating} ({product?.reviews})
            </span>
            <FaStar size={10} color="#F69B26" />
          </div>

          <p className="text-[12px] md:text-[18px] text-[#FC3030] font-semibold mt-[4px] md:mt-[8px]">
            ₹{typeof price === "number" ? price.toFixed(2) : price}
          </p>

          <div className="flex items-center mt-[4px] md:mt-[8px]">
            <p className="text-[8px] md:text-[14px] text-[#909198] line-through font-normal">
              ₹
              {typeof basePrice === "number" ? basePrice.toFixed(2) : basePrice}
            </p>

            <p className="text-[8px] md:text-[14px] text-[#4FAD2E] ml-[12px] md:ml-[20px] font-semibold">
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
            <Image src={heart} alt="like" width={20} height={20} />
          )}
        </IconButton>
      </div>
      <div className="h-[40px] flex items-center justify-center">
        <button
          className="text-[#F70000] w-[90%] h-[32px] border-[1px] border-[#F70001] rounded-lg bg-white opacity-0 group-hover:opacity-100 group-[.active]:opacity-100 transition-opacity duration-300"
          onClick={(e) => onAddingCart(e)}
        >
          <div className="flex items-center justify-center">
            <p className="font-semibold text-[12px] md:text-[13px]">
              Add to cart
            </p>
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