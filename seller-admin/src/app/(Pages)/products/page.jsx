// src/app/(Pages)/products/page.jsx

"use client";

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
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

const Products = () => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState("manage");
  const [allProducts, setAllProducts] = useState([]);
  const [product, setProduct] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  console.log(product, "product");
  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const { data } = await axiosPrivate.get("/vendor/products", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        setAllProducts(data?.products);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    getAllProducts();
  }, [product, selectedTab]);

  useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation("products"));
  }, [dispatch]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

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
              <Manage
                allProducts={allProducts}
                setSelectedTab={setSelectedTab}
                setProduct={setProduct}
                searchTerm={searchTerm}
              />
            ) : selectedTab === "createNew" ? (
              <CreateNew setSelectedTab={setSelectedTab} />
            ) : (
              selectedTab === "edit" && (
                <EditProduct
                  product={product}
                  setSelectedTab={setSelectedTab}
                />
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
