"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { IoMdClose } from "react-icons/io";
import { FaPlus, FaMinus } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { Checkbox, Rating, Slider, Select, MenuItem } from "@mui/material";
import axios from "axios";
import Baner from "@/assets/mainBag.png";
import MenuIcon from "@/assets/VectorMenu.png";
import ProductCard from "@/components/ProductCard";
import { useSelector } from "react-redux";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://api.grazle.co.in/api";

export default function StoreProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const catredux = useSelector((state) => state.catagories);
  const [categories, setCategories] = useState(catredux);
  const [categoriesFilter, setCategoriesFilter] = useState(null);

  const getFirstWord = (categoryName) => {
    if (!categoryName) return "";
    const words = categoryName.split(" ");
    return words[0];
  };

  const selectedCategory = useSelector((state) =>
    getFirstWord(state?.selectedCategory?.name)
  );

  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || selectedCategory || "",
    brand_id: "",
    category_id: searchParams.get("category") || "",
    rating: "",
    min_price: 0,
    max_price: 100000,
    latest_arrival: "",
    price: "",
    top_rated: "",
    popular: "",
  });

  const [openSections, setOpenSections] = useState({
    category: true,
    brands: false,
    price: false,
    rating: false,
    sort: false,
  });

  useEffect(() => {
    setCategoriesFilter(selectedCategory);
    setFilters(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setFilters((prev) => ({ ...prev, category_id: category }));
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/global/search-results`, {
        params: {
          ...filters,
          keywords: filters.keyword,
        },
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/global/brands`);
      setBrands(response.data.brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newValue = prev[key] === value ? "" : value;
      let updatedFilters = { ...prev, [key]: newValue };

      if (key === "category_id") {
        const selectedCategory = categories.find(
          (cat) => cat.id.toString() === value
        );
        if (selectedCategory) {
          const firstWord = selectedCategory.name.split(" ")[0];
          updatedFilters.keyword = firstWord;
        } else {
          updatedFilters.keyword = prev.keyword;
        }
      }

      return updatedFilters;
    });
  };

  const applyFilters = () => {
    fetchProducts();
    setIsFilterVisible(false);

    const newSearchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) newSearchParams.set(key, value);
    });

    if (filters.keyword) {
      newSearchParams.set("keyword", filters.keyword);
    }

    router.push(`/search?${newSearchParams.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      brand_id: "",
      category_id: "",
      rating: "",
      min_price: 0,
      max_price: 100000,
      latest_arrival: "",
      price: "",
      top_rated: "",
      popular: "",
    });
    router.push("/search", { scroll: false });
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const renderFilterSection = (
    title,
    key,
    items,
    itemKey = "id",
    itemLabel = "name"
  ) => (
    <div className="border-b border-gray-200">
      <div
        className="px-3 py-2 flex justify-between items-center cursor-pointer"
        onClick={() => toggleSection(key)}
      >
        <p className="text-gray-600 text-lg font-medium">{title}</p>
        {openSections[key] ? (
          <FaMinus className="text-[#F70000]" />
        ) : (
          <FaPlus className="text-[#F70000]" />
        )}
      </div>
      {openSections[key] && (
        <div className="px-3 py-2">
          {items.map((item) => (
            <div
              key={item[itemKey]}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() =>
                handleFilterChange(`${key}_id`, item[itemKey].toString())
              }
            >
              <Checkbox
                checked={filters[`${key}_id`] === item[itemKey].toString()}
                sx={{
                  color: "#00000047",
                  "&.Mui-checked": { color: "#F70000" },
                }}
              />
              <p className="text-sm text-gray-600">{item[itemLabel]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFilters = () => (
    <div className="py-1">
      <div className="relative w-full px-3 mb-4">
        <IoSearchOutline className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl" />
        <input
          value={filters.keyword}
          onChange={(e) => handleFilterChange("keyword", e.target.value)}
          className="pl-11 w-full border border-gray-300 rounded-md h-12 focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
          placeholder="Search Here"
        />
      </div>

      {renderFilterSection("Categories", "category", categories)}
      {renderFilterSection("Brands", "brand", brands)}

      <div className="border-b border-gray-200">
        <div
          className="px-3 py-2 flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("price")}
        >
          <p className="text-gray-600 text-lg font-medium">Price</p>
          {openSections.price ? (
            <FaMinus className="text-[#F70000]" />
          ) : (
            <FaPlus className="text-[#F70000]" />
          )}
        </div>
        {openSections.price && (
          <div className="px-3 py-2">
            <Slider
              value={[filters.min_price, filters.max_price]}
              onChange={(_, newValue) => {
                handleFilterChange("min_price", newValue[0]);
                handleFilterChange("max_price", newValue[1]);
              }}
              valueLabelDisplay="auto"
              min={0}
              max={100000}
            />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>₹{filters.min_price}</span>
              <span>₹{filters.max_price}</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-gray-200">
        <div
          className="px-3 py-2 flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("rating")}
        >
          <p className="text-gray-600 text-lg font-medium">Rating</p>
          {openSections.rating ? (
            <FaMinus className="text-[#F70000]" />
          ) : (
            <FaPlus className="text-[#F70000]" />
          )}
        </div>
        {openSections.rating && (
          <div className="px-3 py-2">
            <Rating
              size="medium"
              onChange={(_, newValue) => handleFilterChange("rating", newValue)}
              precision={1}
              value={Number(filters.rating)}
            />
          </div>
        )}
      </div>

      <div className="border-b border-gray-200">
        <div
          className="px-3 py-2 flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("sort")}
        >
          <p className="text-gray-600 text-lg font-medium">Sort By</p>
          {openSections.sort ? (
            <FaMinus className="text-[#F70000]" />
          ) : (
            <FaPlus className="text-[#F70000]" />
          )}
        </div>
        {openSections.sort && (
          <div className="px-3 py-2">
            <Select
              value={filters.latest_arrival}
              onChange={(e) =>
                handleFilterChange("latest_arrival", e.target.value)
              }
              displayEmpty
              fullWidth
              className="mb-2"
            >
              <MenuItem value="">Latest Arrival</MenuItem>
              <MenuItem value="desc">Newest First</MenuItem>
              <MenuItem value="asc">Oldest First</MenuItem>
            </Select>
            <Select
              value={filters.price}
              onChange={(e) => handleFilterChange("price", e.target.value)}
              displayEmpty
              fullWidth
              className="mb-2"
            >
              <MenuItem value="">Price</MenuItem>
              <MenuItem value="highest">Highest to Lowest</MenuItem>
              <MenuItem value="lowest">Lowest to Highest</MenuItem>
            </Select>
            <Select
              value={filters.top_rated}
              onChange={(e) => handleFilterChange("top_rated", e.target.value)}
              displayEmpty
              fullWidth
              className="mb-2"
            >
              <MenuItem value="">Top Rated</MenuItem>
              <MenuItem value="top">Top Rated First</MenuItem>
            </Select>
            <Select
              value={filters.popular}
              onChange={(e) => handleFilterChange("popular", e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="">Popularity</MenuItem>
              <MenuItem value="popular">Most Popular First</MenuItem>
            </Select>
          </div>
        )}
      </div>

      <div className="px-3 py-4">
        <button
          className="bg-[#F70000] rounded-md h-12 w-full text-lg font-medium text-white hover:bg-red-700 transition-colors"
          onClick={applyFilters}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4 hidden lg:block">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center p-4 justify-between border-b border-gray-200">
              <p className="text-gray-600 text-lg font-medium">
                Filter Products
              </p>
              <button
                className="text-[#F70000] flex items-center gap-2"
                onClick={clearFilters}
              >
                <IoMdClose className="text-lg" />
                <span className="text-base font-medium">Clear</span>
              </button>
            </div>
            {renderFilters()}
          </div>
        </div>

        <div className="lg:w-3/4">
          {/* <div className="hidden md:block bg-[#FF9C2A] rounded-lg overflow-hidden mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between p-8 lg:p-12">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <p className="text-white text-xl lg:text-2xl font-semibold mb-2">
                  Special Offer
                </p>
                <p className="text-white text-3xl lg:text-5xl xl:text-6xl font-bold mb-2">
                  Super Sale
                </p>
                <p className="text-white text-xl lg:text-2xl font-semibold mb-4">
                  Up To 50% Off
                </p>
                <button className="bg-[#F70000] hover:bg-red-700 text-white font-medium py-3 px-6 rounded-full text-lg transition-colors">
                  Shop Now
                </button>
              </div>
              <div className="w-full md:w-1/2 lg:w-auto">
                <Image
                  src={Baner}
                  alt="Special Offer Banner"
                  className="w-full h-auto object-contain"
                  width={560}
                  height={385}
                />
              </div>
            </div>
          </div> */}

          <div className="flex justify-between items-center mb-4 lg:hidden">
            <p className="text-gray-600 text-lg font-medium">Filter Products</p>
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className="text-gray-600"
            >
              <Image src={MenuIcon} alt="Menu" width={24} height={24} />
            </button>
          </div>

          {isFilterVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
              <div className="bg-white w-full sm:w-96 h-full overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <p className="text-gray-600 text-lg font-medium">
                    Filter Products
                  </p>
                  <button
                    className="text-[#F70000]"
                    onClick={() => setIsFilterVisible(false)}
                  >
                    <IoMdClose className="text-2xl" />
                  </button>
                </div>
                {renderFilters()}
              </div>
            </div>
          )}

<div>
  {products.length > 0 ? (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
      {products.map((product) => (
        <div className="">
          <ProductCard key={product.id} product={product} />
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-12">
      <p className="text-xl text-gray-600">
        No related products found.
      </p>
    </div>
  )}
</div>
        </div>
      </div>
    </div>
  );
}
