"use client";
import {
  debounce,
  getAllBrandsApi,
  searchProductApi,
  getAllProductsApi,
  getAllCategoriesApi,
  getCategoryBySlugApi,
  getFilterProductsApi,
} from "@/apis";
import Image from "next/image";
import Baner from "@/assets/mainBag.png";
import { IoMdClose } from "react-icons/io";
import MenuIcon from "@/assets/VectorMenu.png";
import { FaPlus, FaMinus } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Checkbox, Rating, Slider } from "@mui/material";
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import axios from "axios";
import CC from "@/assets/33.jpeg";
import DD from "@/assets/44.jpeg";
import AA from "@/assets/111.jpeg";
import BB from "@/assets/222.jpeg";
import Main from "@/assets/76 1.png";
import Star from "@/assets/Star 1.png";
import Cart from "@/assets/CartVector.png";
import { BiSolidLike } from "react-icons/bi";
import Logoo from "@/assets/Grazle Logo.png";
import Like from "@/assets/Frame 1820551183.png";
import Card1 from "@/assets/a5a6296b2158604a47215a2b0a00bde0.png";
import Bag from "@/assets/e6217953653db114cabd2c88ed6a998d.png";

type Section = "offer" | "brands" | "size" | "price" | "Rating" | "color";

export default function StoreProductpage() {
  const [rating, setRating] = useState(4);
  const [brandId, setBrandId] = useState();
  const [brands, setBrands] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [seletedCategory, setSeletedCategory] = useState([]);

  const [openSections, setOpenSections] = useState<Record<Section, boolean>>({
    offer: false,
    brands: false,
    size: false,
    price: false,
    Rating: false,
    color: false,
  });

  const priceHandler = (e: any, newPrice: any) => {
    setPrice(newPrice);
  };

  const toggleSection = (section: Section) => {
    setOpenSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };
  const [isDivVisible, setIsDivVisible] = useState(false);

  const handleButtonClick = () => {
    setIsDivVisible((prev) => !prev);
  };

  const keyword = useSearchParams().get("keyword");
  const categoryInSearch = useSearchParams().get("category");

  const onSearchProduct = debounce(async () => {
    if (keyword) {
      try {
        const { data } = await searchProductApi(keyword);
        setSearchResult(data?.products);
      } catch (error) {
        console.log(error);
      }
    }
  }, 700);

  useEffect(() => {
    onSearchProduct();
  }, [keyword]);

  useEffect(() => {
    (async () => {
      if (categoryInSearch) {
        const { data } = await getCategoryBySlugApi(categoryInSearch);
        setSearchResult(data?.products);
      }
    })();
  }, [categoryInSearch]);

  useEffect(() => {
    (async () => {
      const { data } = await getAllBrandsApi();
      setBrands(data.brands);
    })();
  }, []);

  // ==========================================================
  const router = useRouter();
  const pathname = usePathname();
  const searchedParams = useSearchParams();
  const [price, setPrice] = useState([0, 100000]);
  const [selectedCat, setSelectedCat] = useState();
  const [keywordSearch, setKeywordSearch] = useState();
  const [allCategories, setAllCategories] = useState([]);
  const [openCategorySection, setOpenCategorySection] = useState(
    searchedParams.get("category") ? true : false
  );

  const fn_getAllCategories = async () => {
    const response = await getAllCategoriesApi();
    if (response?.status === 200) {
      setAllCategories(response?.data?.categories);
    }
  };

  const fn_getAllProducts = async () => {
    try {
      const response = await getAllProductsApi();
      console.log("target ===> ", response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fn_getAllCategories();
    fn_getAllProducts();
  }, []);

  const fn_selectCategory = (category: any) => {
    setSelectedCat(category.id);
  };

  const onFilter = async () => {
    let query = selectedCat
      ? `?category_id=${selectedCat}&keywords=${keywordSearch}&min_price=${price[0]}&max_price=${price[1]}&rating=${rating}`
      : `?min_price=${price[0]}&max_price=${price[1]}&keywords=${keywordSearch}&rating=${rating}`;

    if (brandId) {
      query = selectedCat
        ? `?brand_id=${brandId}&keywords=${keywordSearch}&category_id=${selectedCat}&min_price=${price[0]}&max_price=${price[1]}&rating=${rating}`
        : `?min_price=${price[0]}&max_price=${price[1]}&keywords=${keywordSearch}&rating=${rating}&brand_id=${brandId}`;
    }

    const { data } = await getFilterProductsApi(query);
    console.log("query", query);
    console.log("data", data);
    setSearchResult(data?.products);
  };

  const clearFilter = () => {
    setBrandId(undefined);
    setSelectedCat(undefined);
    setRating(0);
    setPrice([0, 100000]);
    onSearchProduct();
  };
  return (
    <div className=" lg:my-[50px] my-[20px] sm:my-[20px] md:my-[30px] lg:mx-[150px] mx-[20px] sm:mx-[20px] md:mx-[30px] ">
      <div>
        <Image
          src={MenuIcon}
          alt="Menu"
          className="w-[30px] h-[24px] mb-4 mr-2 sm:hidden"
          onClick={handleButtonClick}
        />
      </div>

      {isDivVisible && (
        <div className="absolute z-[9999] ">
          <div
            style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
            className="w-[90%] bg-white border-[1px] border-[#0000001F]"
          >
            <div className="flex items-center p-4 justify-between mb-3 border-b-[1px] border-[#0000001F]">
              <p className="text-[#777777] text-[16px] font-medium">
                Filter Products
              </p>
              <div className="text-[#F70000] flex items-center gap-2">
                <IoMdClose className="text-[#F70000] text-[16px]" />
                <p
                  className="text-[#F70000] text-[16px] font-medium cursor-pointer"
                  onClick={clearFilter}
                >
                  Clear
                </p>
              </div>
            </div>

            <div className="px-0 py-1">
              <div className="relative w-full px-3">
                <IoSearchOutline className="absolute left-6 top-1/2 transform -translate-y-1/2 text-[#777777] text-[20px]" />
                <input
                  className="pl-11 w-full border-[1px] border-[#00000021] rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                  placeholder="Search Here"
                />
              </div>

              <div className="mt-3 flex pb-3 px-3 border-b-[1px] border-[#00000021] justify-between items-center">
                <p className="text-[#74767E] text-[18px] font-medium">
                  On Offer
                </p>
                <div
                  onClick={() => toggleSection("offer")}
                  className="cursor-pointer"
                >
                  {openSections.offer ? (
                    <FaMinus className="text-[#F70000]" />
                  ) : (
                    <FaPlus className="text-[#F70000]" />
                  )}
                </div>
              </div>

              {openSections.offer && (
                <div className="px-3 py-2 border-b-[1px] border-[#00000021]">
                  Offer content...
                </div>
              )}

              <div className="px-3 py-2 border-b-[1px]  flex justify-between items-center border-[#00000021]">
                <p className="text-[#74767E] text-[18px] font-medium">Brands</p>
                <div
                  onClick={() => toggleSection("brands")}
                  className="cursor-pointer"
                >
                  {openSections.brands ? (
                    <FaMinus className="text-[#F70000]" />
                  ) : (
                    <FaPlus className="text-[#F70000]" />
                  )}
                </div>
              </div>

              {openSections.brands && (
                <div className="px-3 py-2 border-b-[1px] border-[#00000021]">
                  {brands.map((brand: any) => (
                    <div className="flex items-center gap-2">
                      <div>
                        <Checkbox
                          onChange={() => {
                            setBrandId(brand.id);
                          }}
                          sx={{
                            color: "#00000047",
                            "& .MuiSvgIcon-root": {
                              fontSize: 24,
                              padding: 0,
                            },
                            "&.Mui-checked": {
                              color: "#F70000",
                            },
                          }}
                        />
                      </div>

                      <p className="text-[10px] font-normal text-[#74767E]">
                        {brand.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-3 py-2 border-b-[1px]  flex justify-between items-center border-[#00000021]">
                <p className="text-[#74767E] text-[18px] font-medium">Size</p>
                <div
                  onClick={() => toggleSection("size")}
                  className="cursor-pointer"
                >
                  {openSections.size ? (
                    <FaMinus className="text-[#F70000]" />
                  ) : (
                    <FaPlus className="text-[#F70000]" />
                  )}
                </div>
              </div>

              {openSections.size && (
                <div className="px-3 py-2 border-b-[1px] border-[#00000021]">
                  <div className="flex items-center gap-2">
                    <div>
                      <Checkbox
                        sx={{
                          color: "#00000047",
                          "& .MuiSvgIcon-root": {
                            fontSize: 24,
                            padding: 0,
                          },
                          "&.Mui-checked": {
                            color: "#F70000",
                          },
                        }}
                      />
                    </div>

                    <p className="text-[10px] font-normal text-[#74767E]">
                      XXL
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ">
                    <div>
                      <Checkbox
                        sx={{
                          color: "#00000047",
                          "& .MuiSvgIcon-root": {
                            fontSize: 24,
                            padding: 0,
                          },
                          "&.Mui-checked": {
                            color: "#F70000",
                          },
                        }}
                      />
                    </div>

                    <p className="text-[10px] font-normal text-[#74767E]">
                      XXL
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div>
                      <Checkbox
                        sx={{
                          color: "#00000047",
                          "& .MuiSvgIcon-root": {
                            fontSize: 24,
                            padding: 0,
                          },
                          "&.Mui-checked": {
                            color: "#F70000",
                          },
                        }}
                      />
                    </div>
                    <p className="text-[10px] font-normal text-[#74767E]">L</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div>
                      <Checkbox
                        sx={{
                          color: "#00000047",
                          "& .MuiSvgIcon-root": {
                            fontSize: 24,
                            padding: 0,
                          },
                          "&.Mui-checked": {
                            color: "#F70000",
                          },
                        }}
                      />
                    </div>
                    <p className="text-[10px] font-normal text-[#74767E]">M</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div>
                      <Checkbox
                        sx={{
                          color: "#00000047",
                          "& .MuiSvgIcon-root": {
                            fontSize: 24,
                            padding: 0,
                          },
                          "&.Mui-checked": {
                            color: "#F70000",
                          },
                        }}
                      />
                    </div>
                    <p className="text-[10px] font-normal text-[#74767E]">S</p>
                  </div>
                </div>
              )}

              <div className="px-3 py-2 border-b-[1px]  flex justify-between items-center border-[#00000021]">
                <p className="text-[#74767E] text-[18px] font-medium">Price</p>
                <div
                  onClick={() => toggleSection("price")}
                  className="cursor-pointer"
                >
                  {openSections.price ? (
                    <FaMinus className="text-[#F70000]" />
                  ) : (
                    <FaPlus className="text-[#F70000]" />
                  )}
                </div>
              </div>

              {openSections.price && (
                <div className="px-3 py-2 border-b-[1px] border-[#00000021]">
                  <Slider
                    value={price}
                    onChange={priceHandler}
                    valueLabelDisplay="auto"
                    aria-labelledby="range-slider"
                    min={0}
                    max={25000}
                  />
                </div>
              )}

              <div className="px-3 py-2 border-b-[1px]  flex justify-between items-center border-[#00000021]">
                <p className="text-[#74767E] text-[18px] font-medium">Rating</p>
                <div
                  onClick={() => toggleSection("Rating")}
                  className="cursor-pointer"
                >
                  {openSections.Rating ? (
                    <FaMinus className="text-[#F70000]" />
                  ) : (
                    <FaPlus className="text-[#F70000]" />
                  )}
                </div>
              </div>

              {openSections.Rating && (
                <div className="px-3 py-2 border-b-[1px] border-[#00000021]">
                  <Rating
                    size="small"
                    onChange={(event, newValue: any) => {
                      setRating(newValue);
                    }}
                    precision={0.5}
                    name="read-only"
                    mt-3
                    value={rating}
                    defaultValue={4}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <div
          style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
          className="lg:w-[25%] rounded-2xl hidden lg:block sm:hidden md:hidden  border-[1px] border-[#0000001F]"
        >
          <div className="flex items-center p-4 justify-between mb-3 border-b-[1px] border-[#0000001F]">
            <p className="text-[#777777] text-[16px] font-medium">
              Filter Products
            </p>
            <div className="text-[#F70000] flex items-center gap-2">
              <IoMdClose className="text-[#F70000] text-[16px]" />
              <p
                className="text-[#F70000] text-[16px] font-medium cursor-pointer"
                onClick={clearFilter}
              >
                Clear
              </p>
            </div>
          </div>

          <div className="px-0 py-1">
            <div className="relative w-full px-3">
              <IoSearchOutline className="absolute left-6 top-1/2 transform -translate-y-1/2 text-[#777777] text-[20px]" />
              <input
                value={keywordSearch}
                onChange={(e: any) => setKeywordSearch(e.target.value)}
                className="pl-11 w-full border-[1px] border-[#00000021] rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                placeholder="Search Here"
              />
            </div>

            {/* category search */}
            <div className="mt-3 flex pb-3 px-3 border-b-[1px] border-[#00000021] justify-between items-center">
              <p className="text-[#74767E] text-[18px] font-medium">Category</p>
              <div
                className="cursor-pointer"
                onClick={() => setOpenCategorySection(!openCategorySection)}
              >
                {openCategorySection ? (
                  <FaMinus className="text-[#F70000]" />
                ) : (
                  <FaPlus className="text-[#F70000]" />
                )}
              </div>
            </div>

            {/* category list */}
            {openCategorySection &&
              (allCategories?.length > 0 ? (
                allCategories?.map((item: any) => (
                  <div
                    key={item?.id}
                    className="px-3 py-2 border-b-[1px] border-[#00000021] text-[13px] font-[500] flex items-center gap-2 cursor-pointer"
                    onClick={() => fn_selectCategory(item)}
                  >
                    {selectedCat === item?.id ? (
                      <ImCheckboxChecked className="w-[20px] h-[20px] text-[red]" />
                    ) : (
                      <ImCheckboxUnchecked className="w-[20px] h-[20px] text-gray-400" />
                    )}
                    {item?.name}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 border-b-[1px] border-[#00000021]">
                  No Content...
                </div>
              ))}

            {/* <div className="mt-3 flex pb-3 px-3 border-b-[1px] border-[#00000021] justify-between items-center">
              <p className="text-[#74767E] text-[18px] font-medium">On Offer</p>
              <div
                onClick={() => toggleSection("offer")}
                className="cursor-pointer"
              >
                {openSections.offer ? (
                  <FaMinus className="text-[#F70000]" />
                ) : (
                  <FaPlus className="text-[#F70000]" />
                )}
              </div>
            </div>
            {openSections.offer && (
              <div className="px-3 py-2 border-b-[1px] border-[#00000021]">
                Offer content...
              </div>
            )} */}

            <div className="px-3 py-2 border-b-[1px]  flex justify-between items-center border-[#00000021]">
              <p className="text-[#74767E] text-[18px] font-medium">Brands</p>
              <div
                onClick={() => toggleSection("brands")}
                className="cursor-pointer"
              >
                {openSections.brands ? (
                  <FaMinus className="text-[#F70000]" />
                ) : (
                  <FaPlus className="text-[#F70000]" />
                )}
              </div>
            </div>

            {openSections.brands && (
              <div className="px-3 py-2 border-b-[1px] border-[#00000021]">
                {brands.map((brand: any) => (
                  <div
                    key={brand?.id}
                    className="px-3 py-2 border-b-[1px] border-[#00000021] text-[13px] font-[500] flex items-center gap-2 cursor-pointer"
                    onClick={() => setBrandId(brand?.id)}
                  >
                    {brandId === brand.id ? (
                      <ImCheckboxChecked className="w-[20px] h-[20px] text-[red]" />
                    ) : (
                      <ImCheckboxUnchecked className="w-[20px] h-[20px] text-gray-400" />
                    )}
                    {brand?.name}
                  </div>
                ))}
              </div>
            )}

            <div className="px-3 py-2 border-b-[1px]  flex justify-between items-center border-[#00000021]">
              <p className="text-[#74767E] text-[18px] font-medium">Price</p>
              <div
                onClick={() => toggleSection("price")}
                className="cursor-pointer"
              >
                {openSections.price ? (
                  <FaMinus className="text-[#F70000]" />
                ) : (
                  <FaPlus className="text-[#F70000]" />
                )}
              </div>
            </div>

            {openSections.price && (
              <div className="px-3 py-2 border-b-[1px] border-[#00000021]">
                <Slider
                  value={price}
                  onChange={priceHandler}
                  valueLabelDisplay="auto"
                  aria-labelledby="range-slider"
                  min={0}
                  max={25000}
                />
              </div>
            )}

            <div className="px-3 py-2 border-b-[1px]  flex justify-between items-center border-[#00000021]">
              <p className="text-[#74767E] text-[18px] font-medium">Rating</p>
              <div
                onClick={() => toggleSection("Rating")}
                className="cursor-pointer"
              >
                {openSections.price ? (
                  <FaMinus className="text-[#F70000]" />
                ) : (
                  <FaPlus className="text-[#F70000]" />
                )}
              </div>
            </div>

            {openSections.Rating && (
              <div className="px-3 py-2 border-b-[1px] border-[#00000021]">
                <Rating
                  size="small"
                  onChange={(event, newValue: any) => {
                    setRating(newValue);
                  }}
                  precision={0.5}
                  name="read-only"
                  mt-3
                  value={rating}
                  defaultValue={4}
                />
              </div>
            )}

            <button
              className="mt-4 bg-[#F70000] rounded-sm h-[50px] p-3 w-full text-[18px] font-medium text-white"
              onClick={() => onFilter()}
            >
              Filter
            </button>
          </div>
        </div>

        <div className="w-[100%] lg:w-[100%] sm:w-[100%] md:w-[100%] ">
          <div className="w-[100%] flex justify-between gap-8 lg:rounded-0 rounded-lg sm:rounded-lg md:rounded-lg   lg:h-[384px] h-[284px] lg:pl-[100px] pl-[10px] bg-[#FF9C2A] rounded-sm">
            <div className="w-[50%] pt-[50px]">
              <p className="text-white text-[24px] font-semibold">
                Special Offer
              </p>

              <p className="text-white lg:text-[64px] text-[24px] sm:text-[24px] md:text-[24px]  font-bold">
                Super Sale
              </p>

              <p className="text-white text-[24px]  font-semibold">
                Up To 50% Off
              </p>

              <button className="mt-4 bg-[#F70000] rounded-full h-[50px]  w-[180px] text-[18px] font-medium text-white">
                Shop Now
              </button>
            </div>

            <div>
              <Image
                alt=""
                src={Baner}
                className="lg:w-[560px] lg:h-[385px] w-[400px] h-[250px] sm:w-[400px] sm:h-[250px] md:w-[450px] md:h-[300px]  "
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:flex flex-wrap justify-evenly items-start gap-2 mt-5 ">
            {searchResult.map((item: any) => (
              <ProductCard key={item.id} width="30" product={item} />
            ))}

            {/* <div
              style={{
                boxShadow: "3px 4px 15.6px 0px rgba(0, 0, 0, 0.05)",
              }}
              className="group sm:w-[250px] h-[398px] mt-[24px] rounded-2xl hover:outline outline-[1px] outline-[#F70001] hover:h-[450px] relative transition-all duration-500 border border-gray-100"
            >
              <Image
                alt=""
                src={Card1}
                className="h-[203px] relative rounded-2xl object-contain"
              />
              <div className="flex w-full justify-between items-center absolute px-[16px] top-[10px]">
                <button
                  style={{ backgroundColor: "rgba(247, 0, 0, 0.1)" }}
                  className="text-[12px] font-semibold border-[1px] rounded-3xl border-[#F70000] text-[#F70000] w-[96px] h-[34px]"
                >
                  flash sale
                </button>
                <Image
                  src={Like}
                  alt=""
                  className="w-[40px] h-[40px] rounded-2xl"
                />
              </div>
              <div className="p-3">
                <p className="text-[16px] w-[100%] font-semibold">
                  capttain pure by kapil dev xtra pure 18{" "}
                </p>
                <div className="flex items-center mt-[16px]">
                  <p className="text-[12px] text-[#F69B26]">4.8 (342)</p>
                  <Image alt="" src={Star} className="h-[12px] w-[12px] ml-2" />
                </div>
                <p className="text-[20px] font-semibold mt-[16px]">₹400 </p>
                <div className="flex items-center mt-[16px]">
                  <p className="text-[16px] text-[#909198] line-through font-normal">
                    ₹400
                  </p>
                  <p className="text-[16px] text-[#4FAD2E] ml-[24px] font-semibold">
                    20%off
                  </p>
                </div>
              </div>
              <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-4 w-full">
                <button className="text-[#F70000] w-[90%] h-[40px] border-[1px] border-[#F70001] rounded-full">
                  <div className="flex items-center justify-center">
                    <p className="font-semibold text-[14px]">Add to cart</p>
                    <Image
                      alt=""
                      src={Cart}
                      className="w-[17px] h-[17px] ml-[12px]"
                    />
                  </div>
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
