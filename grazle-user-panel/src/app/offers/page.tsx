"use client";
import React, { useEffect, useState } from "react";
import { getAllProductsApi, getBannersApi, getOfferProductsApi } from "@/apis";
import ProductCard from "@/components/ProductCard";
import RecentViewSlider from "@/components/rencentView";
import { useSearchParams } from "next/navigation";
import router from "next/router";
import Cardmm from "@/assets/Cardmmm.png";
import Image from "next/image";
import MainSlider from "@/components/mianSlider";



const Offers = () => {
  const [positionOneBanners, setPositionOneBanners] = useState([]);

  // const router = useRouter();
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

  useEffect(() => {
    (async () => {
      const positionOneBanners = await getBannersApi(1);
      setPositionOneBanners(positionOneBanners.data.banners);
    })();
  }, []);

//   useEffect(() => {
//     if (id && allProducts?.length > 0) {
//       // const { data } = await getOfferProductsApi();
//       // console.log(data);
//       const currentOfferProds = .
//         (item: any) => item?.offer?.id?.toString() === id.toString()
//       );
// console.log("cr", allProducts);
// setAllProducts(currentOfferProds);
//       // const { data } = await getOfferProductsApi();
//       // console.log(data);
//     }
//   }, [id]);


  // const goToCreditLimit = () => {
  //   router.push("/CreditLimit");
  // };
  return (
<>
  <div className="lg:mx-[150px] md:mx-[60px] lg:px-0 md:px-3">
    <MainSlider banners={positionOneBanners} />
  </div>
  <div className="p-6 lg:p-10 overflow-x-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
    {allProducts?.map((product: any) => (
      <ProductCard
        width="25"
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
