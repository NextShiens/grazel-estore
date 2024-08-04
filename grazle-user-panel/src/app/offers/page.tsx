"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getOfferProductsByIDApi, getBannersApi } from "@/apis";
import ProductCard from "@/components/ProductCard";
import MainSlider from "@/components/mianSlider";
import { FaSpinner } from 'react-icons/fa';


const Offers = () => {
  const [positionOneBanners, setPositionOneBanners] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    const fetchOfferProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getOfferProductsByIDApi(id);
        console.log("Fetched products:", data.products);
        setAllProducts(data.products);
      } catch (error) {
        console.error("Error fetching offer products:", error);
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    const fetchBanners = async () => {
      try {
        const response = await getBannersApi(1);
        setPositionOneBanners(response.data.banners);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchOfferProducts();
    fetchBanners();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center space-x-2">
          <FaSpinner className="animate-spin text-orange-500 text-4xl" />
          <span className="text-orange-500 text-xl">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="lg:mx-[150px] md:mx-[60px] lg:px-0 md:px-3">
        <MainSlider banners={positionOneBanners} />
      </div>
      <div className="p-6 overflow-x-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ">
        {allProducts?.map((product: any) => (
          <ProductCard
           width="20"
            key={product.id}
            offerId={id || ''}
            product={product}
          />
        ))}
      </div>
    </>
  );
};

export default Offers;