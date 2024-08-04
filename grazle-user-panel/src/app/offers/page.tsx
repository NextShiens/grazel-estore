"use client";
import React, { useEffect, useState } from "react";
import { getAllProductsApi, getBannersApi } from "@/apis";
import ProductCard from "@/components/ProductCard";
import { useSearchParams } from "next/navigation";
import MainSlider from "@/components/mianSlider";

const Offers = () => {
  const [positionOneBanners, setPositionOneBanners] = useState([]);
  const id = useSearchParams().get("id");
  const [allProducts, setAllProducts] = useState<any>([]);

  useEffect(() => {
    (async () => {
      const { data } = await getAllProductsApi();
      setAllProducts(data.products);
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      const positionOneBanners = await getBannersApi(1);
      setPositionOneBanners(positionOneBanners.data.banners);
    })();
  }, []);

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