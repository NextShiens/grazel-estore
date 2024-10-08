"use client";

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
  updatePageLoader,
  updatePageNavigation,
} from "../../../features/features";
import { IoSearch } from "react-icons/io5";
import Navbar from "../../../components/navbar";
import Sidebar from "../../../components/sidebar";
import Loading from "../../../components/loading";
import Manage from "./Manage";
import CreateNew from "./CreateNew";
import EditProduct from "./EditProduct";
import { axiosPrivate } from "../../../axios/index";
import { toast } from "react-toastify";

const Products = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("manage");
  const [allProducts, setAllProducts] = useState([]);
  const [product, setProduct] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(40);
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
    }
  }, [currentPage, selectedTab, loginChecked, loggedIn]);

  const fetchProducts = async () => {
    if (!loggedIn) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: 40,
      });

      const { data } = await axiosPrivate.get(`/vendor/products?${params}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      setAllProducts(data.products);
      setTotalPages(data.totalPages);
      setTotalProducts(data.total);
      setItemsPerPage(data.limit);
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchResults = async (term) => {
    if (!loggedIn) return;
    setIsLoading(true);
    try {
      const { data } = await axiosPrivate.get(`/vendors/products?keywords=${term}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      setSearchResults(data.results);
    } catch (error) {
      console.error("Failed to fetch search results", error);
      toast.error("Failed to fetch search results");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (event) => {
    if (!loggedIn) return;
    const term = event.target.value;
    setSearchTerm(term);
    if (term) {
      fetchSearchResults(term);
    } else {
      setSearchResults([]);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (!loggedIn) return;
    setCurrentPage(pageNumber);
  };

  const handleDeleteProduct = async (productId) => {
    if (!loggedIn) return;
    try {
      await axiosPrivate.delete(`/vendor/products/${productId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product", error);
      toast.error("Failed to delete product");
    }
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
            <div className="bg-white h-[50px] rounded-[8px] flex items-center px-[25px] gap-3 shadow-sm">
              <IoSearch className="text-[var(--text-color-body)] text-[20px]" />
              <input
                className="flex-1 focus:outline-none text-[15px]"
                placeholder="Search Product"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="flex gap-10 my-[20px]">
              <p
                className={`cursor-pointer hover:text-[var(--text-color)] font-[500] border-b-[2px] hover:border-[var(--text-color)] ${
                  selectedTab === "manage"
                    ? "text-[var(--text-color)] border-[var(--text-color)]"
                    : "text-[var(--text-color-body)] border-transparent"
                }`}
                onClick={() => setSelectedTab("manage")}
              >
                Manage
              </p>
              <p
                className={`cursor-pointer hover:text-[var(--text-color)] font-[500] border-b-[2px] hover:border-[var(--text-color)] ${
                  selectedTab === "createNew"
                    ? "text-[var(--text-color)] border-[var(--text-color)]"
                    : "text-[var(--text-color-body)] border-transparent"
                }`}
                onClick={() => setSelectedTab("createNew")}
              >
                Create New
              </p>
            </div>
            {selectedTab === "manage" ? (
              <>
                <Manage
                  allProducts={allProducts}
                  setSelectedTab={setSelectedTab}
                  setProduct={setProduct}
                  searchTerm={searchTerm}
                  onDeleteProduct={handleDeleteProduct}
                />
                {allProducts.length > 0 && (
                  <div className="flex flex-col items-center mt-4">
                    <div className="flex justify-center items-center">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {renderPageNumbers()}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Page {currentPage} of {totalPages} | Total Products: {totalProducts}
                    </div>
                  </div>
                )}
              </>
            ) : selectedTab === "createNew" ? (
              <CreateNew setSelectedTab={setSelectedTab} />
            ) : (
              selectedTab === "edit" && (
                <EditProduct
                  product={product}
                  setSelectedTab={setSelectedTab}
                  onProductUpdated={fetchProducts}
                />
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const PageButton = ({ page, currentPage, onClick }) => (
  <button
    onClick={onClick}
    className={`mx-1 px-3 py-1 rounded ${
      currentPage === page
        ? "bg-red-500 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    {page}
  </button>
);

export default Products;