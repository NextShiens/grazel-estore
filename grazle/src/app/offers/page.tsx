"use client";
import React, { useEffect, useState } from "react";
import { getAllProductsApi, getOfferProductsApi } from "@/apis";
import ProductCard from "@/components/ProductCard";
import RecentViewSlider from "@/components/rencentView";
import { useSearchParams } from "next/navigation";

const Offers = () => {
  const id = useSearchParams().get("id");
  console.log(id);
  const [allProducts, setAllProducts] = useState<any>([]);
  // all products
  useEffect(() => {
    (async () => {
      const { data } = await getAllProductsApi();

      setAllProducts(data.products);
    })();
  }, [id]);

  // useEffect(() => {
  //   if (id && allProducts?.length > 0) {
  //     // const { data } = await getOfferProductsApi();
  //     // console.log(data);
  //     const currentOfferProds = allProducts.filter(
  //       (item: any) => item?.offer?.id?.toString() === id.toString()
  //     );
  //     console.log("cr", allProducts);
  //     setAllProducts(currentOfferProds);
  //   }
  // }, [id]);

  // const { data } = await getOfferProductsApi();
  return (
    <div className="p-6 lg:p-10 overflow-x-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
      {allProducts?.map((product: any) => (
        <ProductCard
          width="100"
          key={product.id}
          offerId={id || null}
          product={product}
        />
      ))}
      {/* <RecentViewSlider Data={allProducts} /> */}
      <></>
    </div>
  );
};

export default Offers;
