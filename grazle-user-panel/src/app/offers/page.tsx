"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getOfferProductsByIDApi, getBannersApi, getAllProductsApi } from "@/apis";
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

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    fetchProducts(pagination.currentPage);
    fetchBanners();
  }, [id, pagination.currentPage]);

  const fetchProducts = async (page) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });
      if (id) {
        response = await getOfferProductsByIDApi(id, params);
      } else {
        response = await getAllProductsApi(params);
      }
      console.log("Fetched products:", response.data.products);
      setAllProducts(response.data.products);
      setPagination({
        currentPage: parseInt(response.data.page),
        totalPages: parseInt(response.data.totalPages),
        limit: parseInt(response.data.limit),
        total: parseInt(response.data.total)
      });
    } catch (error) {
      console.error("Error fetching products:", error);
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProducts(newPage);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const ellipsis = <span key="ellipsis" className="mx-1">...</span>;

    if (pagination.totalPages <= 7) {
      for (let i = 1; i <= pagination.totalPages; i++) {
        pageNumbers.push(
          <PageButton
            key={i}
            page={i}
            currentPage={pagination.currentPage}
            onClick={() => handlePageChange(i)}
          />
        );
      }
    } else {
      pageNumbers.push(
        <PageButton
          key={1}
          page={1}
          currentPage={pagination.currentPage}
          onClick={() => handlePageChange(1)}
        />
      );

      if (pagination.currentPage > 3) {
        pageNumbers.push(ellipsis);
      }

      let start = Math.max(2, pagination.currentPage - 1);
      let end = Math.min(pagination.totalPages - 1, pagination.currentPage + 1);

      if (pagination.currentPage <= 3) {
        end = Math.min(5, pagination.totalPages - 1);
      }

      if (pagination.currentPage >= pagination.totalPages - 2) {
        start = Math.max(2, pagination.totalPages - 4);
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(
          <PageButton
            key={i}
            page={i}
            currentPage={pagination.currentPage}
            onClick={() => handlePageChange(i)}
          />
        );
      }

      if (pagination.currentPage < pagination.totalPages - 2) {
        pageNumbers.push(ellipsis);
      }

      pageNumbers.push(
        <PageButton
          key={pagination.totalPages}
          page={pagination.totalPages}
          currentPage={pagination.currentPage}
          onClick={() => handlePageChange(pagination.totalPages)}
        />
      );
    }

    return pageNumbers;
  };

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
      <div className="container mx-auto lg:mx-[150px] md:mx-[60px] lg:px-0 md:px-3">
        <MainSlider banners={positionOneBanners} />
      </div>

      <div className="container lg:!w-[80%] sm:!w-full justify-center m-auto p-6 overflow-x-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ">
        {allProducts?.map((product) => (
          <ProductCard
            width="20"
            key={product.id}
            offerId={id || ''}
            product={product}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center items-center">
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
        >
          Previous
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </>
  );
};

const PageButton = ({ page, currentPage, onClick }) => (
  <button
    onClick={onClick}
    className={`mx-1 px-3 py-1 rounded ${currentPage === page
      ? "bg-orange-500 text-white"
      : "bg-gray-200 text-gray-700"
      }`}
  >
    {page}
  </button>
);

export default Offers;