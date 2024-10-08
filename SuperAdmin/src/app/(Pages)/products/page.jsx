"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Navbar from "@/components/navbar";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import SearchOnTop from "@/components/SearchOnTop";
import Sidebar from "@/components/sidebar";
import LeftSection from "./LeftSection";
import RightSection from "./RightSection";
import { axiosPrivate } from "@/axios";
import Loading from "@/components/loading";
import { useRouter } from "next/navigation";

const Products = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const productRef = useRef([]);
  const sortedProduct = productRef.current?.sort((a, b) => a.price - b.price);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(40);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term

  const [isLoading, setIsLoading] = useState(false);

  const [loggedIn, setLoggedIn] = useState(true);
  const [loginChecked, setLoginChecked] = useState(false);

  const getLocalStorage = (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

  const token = getLocalStorage("token");

  useEffect(() => {
    handleCheckLogin();
  }, []);

  const handleCheckLogin = () => {
    if (!token) {
      setLoggedIn(false);
      router.push("/");
    } else {
      setLoggedIn(true);
    }
    setLoginChecked(true);
  };

  useEffect(() => {
    if (loginChecked && loggedIn) {
      dispatch(updatePageLoader(false));
      dispatch(updatePageNavigation("products"));
    }
  }, [dispatch, loginChecked, loggedIn]);

  useEffect(() => {
    if (loginChecked && loggedIn) {
      fetchProducts();
      fetchCategories();
      fetchBrands();
    }
  }, [currentPage, loginChecked, loggedIn, searchTerm]); // Added searchTerm to dependencies

  const fetchProducts = async () => {
    if (!loggedIn) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: 40,
        keywords: searchTerm, // Include search term in the request
      });

      const { data } = await axiosPrivate.get(`/admin/products?${params}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      setAllProducts(data.products);
      setTotalPages(data.totalPages);
      setTotalProducts(data.total);
      setItemsPerPage(data.limit);
      productRef.current = data.products;
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!loggedIn) return;
    try {
      const { data } = await axiosPrivate.get("/categories", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setAllCategories(data?.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchBrands = async () => {
    if (!loggedIn) return;
    try {
      const { data } = await axiosPrivate.get("/brands", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setAllBrands(data?.brands);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (!loggedIn) return;
    setCurrentPage(pageNumber);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const ellipsis = <span className="mx-1">...</span>;

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <PageButton
            key={i}
            page={i}
            currentPage={currentPage}
            onClick={() => handlePageChange(i)}
          />
        );
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(
            <PageButton
              key={i}
              page={i}
              currentPage={currentPage}
              onClick={() => handlePageChange(i)}
            />
          );
        }
        pageNumbers.push(ellipsis);
        pageNumbers.push(
          <PageButton
            key={totalPages}
            page={totalPages}
            currentPage={currentPage}
            onClick={() => handlePageChange(totalPages)}
          />
        );
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(
          <PageButton
            key={1}
            page={1}
            currentPage={currentPage}
            onClick={() => handlePageChange(1)}
          />
        );
        pageNumbers.push(ellipsis);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(
            <PageButton
              key={i}
              page={i}
              currentPage={currentPage}
              onClick={() => handlePageChange(i)}
            />
          );
        }
      } else {
        pageNumbers.push(
          <PageButton
            key={1}
            page={1}
            currentPage={currentPage}
            onClick={() => handlePageChange(1)}
          />
        );
        pageNumbers.push(ellipsis);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(
            <PageButton
              key={i}
              page={i}
              currentPage={currentPage}
              onClick={() => handlePageChange(i)}
            />
          );
        }
        pageNumbers.push(ellipsis);
        pageNumbers.push(
          <PageButton
            key={totalPages}
            page={totalPages}
            currentPage={currentPage}
            onClick={() => handlePageChange(totalPages)}
          />
        );
      }
    }

    return pageNumbers;
  };

  function filterProductByDate(category, categoryId, brand, created_at) {
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    const IsoDate = today.toISOString();
    if (category && brand) {
      return brand === "new"
        ? categoryId === category &&
        created_at <= IsoDate &&
        created_at >= new Date().toISOString()
        : categoryId === category && created_at < new Date().toISOString();
    } else if (brand) {
      return brand === "new"
        ? created_at <= IsoDate && created_at >= new Date().toISOString()
        : created_at < new Date().toISOString();
    }
  }

  function onFilterProduct({ category, brand }) {
    if (!loggedIn) return;
    let allProducts = productRef.current || [];
    let filteredProduct = [];
    filteredProduct = allProducts.filter((item) => {
      const categoryId = item?.category_id;
      const brandId = item?.brand_id;
      const created_at = item?.created_at;

      if (!category && !brand) {
        return allProducts;
      } else if (category && brand) {
        return typeof brand === "string"
          ? filterProductByDate(category, categoryId, brand, created_at)
          : categoryId === category && brandId === brand;
      } else if (category || brand) {
        return category
          ? categoryId === category
          : typeof brand === "string"
            ? filterProductByDate(null, null, brand, created_at)
            : brandId === brand;
      }
    });

    setAllProducts(filteredProduct);
  }

  function onChangePrice(priceArray, { category, brand }) {
    if (!loggedIn) return;
    let allProducts = productRef.current || [];
    const [lowPrice, highPrice] = priceArray;

    const filteredProduct = allProducts.filter((item) => {
      const price = item.price;
      const categoryId = item?.category_id;
      const brandId = item?.brand_id;
      const created_at = item?.created_at;
      const priceLogic = price >= lowPrice && price <= highPrice;
      if (category && brand) {
        return typeof brand === "string"
          ? priceLogic &&
          filterProductByDate(category, categoryId, brand, created_at)
          : priceLogic && categoryId === category && brandId === brand;
      } else if (category || brand) {
        return category
          ? priceLogic && categoryId === category
          : typeof brand === "string"
            ? priceLogic && filterProductByDate(null, null, brand, created_at)
            : priceLogic && brandId === brand;
      } else {
        return priceLogic;
      }
    });
    setAllProducts(filteredProduct);
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Loading />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[22px]">
            <div className="flex flex-row gap-3 w-full">
              <div className="w-[90%]">
                <SearchOnTop
                  showButton={true}
                  navigateTo="/products/add"
                  onSearch={handleSearch}
                  searchTerm={searchTerm} // Pass searchTerm as a prop
                />
              </div>

              <button onClick={() => window.location.href = "/products/add"}
                className="h-[50px] rounded-[8px] bg-[#FE4242] flex items-center justify-center text-white font-[500] w-full sm:w-[150px]  disabled:border-none transition-colors hover:bg-[#E63B3B]">
                Add Product
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-[20px] mt-[20px]">
              <LeftSection
                allCategories={allCategories}
                allBrands={allBrands}
                onFilterProduct={(categoryId) => onFilterProduct(categoryId)}
                onChangePrice={onChangePrice}
                lowerPrice={Math.floor(sortedProduct[0]?.price)}
                higherPrice={Math.floor(
                  sortedProduct[sortedProduct.length - 1]?.price
                )}
              />
              <RightSection
                allProducts={allProducts}
                allCategories={allCategories}
                isLoading={isLoading}
                renderPageNumbers={renderPageNumbers}
                currentPage={currentPage}
                totalPages={totalPages}
                totalProducts={totalProducts}
                handlePageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const PageButton = ({ page, currentPage, onClick }) => (
  <button
    onClick={onClick}
    className={`mx-1 px-3 py-1 rounded ${currentPage === page
      ? "bg-red-500 text-white"
      : "bg-gray-200 text-gray-700"
      }`}
  >
    {page}
  </button>
);

export default Products;