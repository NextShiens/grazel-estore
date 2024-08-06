"use client";
import React, { useEffect, useState } from "react";
import { getAllFavoriteProductApi } from "@/apis";
import ProductCard from "@/components/ProductCard";
import RecentViewSlider from "@/components/rencentView";

const Favorite = () => {
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await getAllFavoriteProductApi();
        setFavoriteProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching favorite products:", err);
        setError("Failed to load favorite products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteProducts();
  }, []);

  if (loading) {
    return <div>Loading favorite products...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 lg:p-6 overflow-x-auto">
      {favoriteProducts.length === 0 ? (
        <div className="text-center text-gray-500">No favorite products found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {favoriteProducts.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              className="w-full h-full"
            />
          ))}
        </div>
      )}
      {/* <RecentViewSlider Data={favoriteProducts} /> */}
    </div>
  );
};

export default Favorite;