"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Drawer, Badge, CircularProgress } from "@mui/material";
import { IoClose } from "react-icons/io5";
import { PiClockCountdownThin } from "react-icons/pi";
import { FaUser } from "react-icons/fa";
import { BiLogOut, BiUser } from "react-icons/bi";
import logo from "@/assets/Grazle Logo.png";
import Search from "@/assets/search.png";
import Cart from "@/assets/Cart.png";
import Seller from "@/assets/Vector.png";
import MenuIcon from "@/assets/VectorMenu.png";
import { Avatar } from "@mui/material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib";
import { Drawer } from "@mui/material";

import { IoClose } from "react-icons/io5";
import { PiClockCountdownThin } from "react-icons/pi";

import user from "@/assets/users.png";
import order from "@/assets/order.png";
import location from "@/assets/layer1.png";
import Fav from "@/assets/hearts.png";
import Location from "@/assets/Group 1820549981.png";
import card from "@/assets/Group 1820549982.png";
import bulid from "@/assets/Vector (3).png";
import crown from "@/assets/crown.png";
import Setting from "@/assets/Group 1820549985.png";
import FAQ from "@/assets/Group 1820549989.png";
import terms from "@/assets/Group 1820549990.png";
import Privcy from "@/assets/Layer 2.png";

import { FaUser } from "react-icons/fa";
import { BiLogOut, BiUser } from "react-icons/bi";
import Badge from "@mui/material/Badge";
import { useDispatch, useSelector } from "react-redux";
import { updateCart } from "@/features/features";
import {
  debounce,
  searchProductApi,
  getPopularSearchApi,
  getProfileApi,
} from "@/apis";
import axios from "axios";
import LoginDropdown from "./LoginDropdown";
import { useAuth } from "@/app/AuthContext";
import { ShoppingLoader } from 'vibrant-loaders';

export default function Navbar() {
  // const router = useRouter();
  const cartLength = useSelector((state: any) => state.cartLength);
  const cartProducts = useSelector((state: any) => state.cartProducts);
  // const handleGoToLogin = () => {
  //   router.push("/Login");
  // };

  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token")!;
  }
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [menuBar, setIsMenuBar] = useState(false);
  const [popularSearches, setPopularSearches] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const containerRef: any = useRef(null);
  const searchContainerRef: any = useRef(null);
  const MenubarRef: any = useRef(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const searchContainerRef = useRef(null);
  const MenubarRef = useRef(null);
  const searchRef = useRef(null);
  const { user: authUser, loading, login, logout } = useAuth();

  useEffect(() => {
    !cartProducts.length && dispatch(updateCart({ type: "onRefresh" }));

    const fetchPopularSearches = async () => {
      try {
        const { data } = await getPopularSearchApi();
        setPopularSearches(data.keywords);
      } catch (error) {
        console.error("Failed to fetch popular searches:", error);
      }
    };

    fetchPopularSearches();
  }, []);


  const fetchPopularSearches = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global/popular-searches`
      );
      const data = await response.json();
      setPopularSearches(data.keywords);
    } catch (error) {
      console.error("Failed to fetch popular searches:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const onSearchProduct = debounce(async (keyword) => {
    if (!keyword) {
      setSearchResult([]);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global/search-results?keywords=${keyword}`
      );
      const data = await response.json();
      setSearchResult(data.products);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
    }
  }, 300);

  const handleToggleMenu = () => setIsMenuBar((prev) => !prev);
  const handleMenuclose = () => setIsMenuBar(false);
  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleToggleSearch = () => setIsOpenSearch((prev) => !prev);
  const handleToggleMenu = () => {
    setIsMenuBar((prev) => !prev);
  };
  const handleMenuclose = () => {
    setIsMenuBar(false);
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };
  const handleToggleSearch = () => {
    setIsOpenSearch((prev) => !prev);
  };

  const handleClickOutside = (event: any) => {
    if (MenubarRef.current && !MenubarRef.current.contains(event.target)) {
      setIsMenuBar(false);
    }
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsOpen(false);
    }
    if (
      searchContainerRef.current &&
      !searchContainerRef.current.contains(event.target)
    ) {
      setIsOpenSearch(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getProfileApi();
        setUser(data.user);
      } catch (error) { }
    })();
  }, []);

  //logout
  async function handelLogout() {
    try {
      localStorage.removeItem("token");
      await logout();
      localStorage.clear();
      setIsMenuBar(false);
      window.location.href = "/signIn";
      router.push("/signIn");
    } catch (error) {
      console.log(error);
      setIsMenuBar(false);
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const onSearchProduct = debounce(async (keyword: any) => {
    if (!keyword) {
      setSearchResult([]);
    }
    try {
      const { data } = await searchProductApi(keyword);
      setSearchResult(data?.products);
    } catch (error) {
      console.log(error);
    }
  }, 700);
  function onClickDetail(item: any) {
    const newSearch = item.title; // Use the item's title as the new search
    setRecentSearches((prevSearches) => {
      const updatedSearches = [
        newSearch,
        ...prevSearches.filter((search) => search !== newSearch),
      ].slice(0, 5);
      return updatedSearches;
    });
    router.push(`/search?keyword=${encodeURIComponent(newSearch)}`); // Use the item's title in the URL
    setIsOpenSearch(false);
    setSearchResult([]);
    if (searchRef.current) {
      searchRef.current.value = "";
    }
  }
  if (loading) {
    return (
      <ShoppingLoader />
    );
  }


  const handleBecomeSeller = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/RegisterSeller");
    }, 2000);
  };

  return (

    <nav className="bg-white shadow-md relative">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <style>
            {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
          </style>
          <CircularProgress
            color="primary"
            style={{
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      )}
      <div
        className={`container mx-auto px-4 py-3 ${loading ? "blur-sm" : ""}`}
      >
        <div className="flex items-center justify-between">

    <>
      <div
        className="mx-[16px] 
      lg:mx-[150px] py-1 md:mx-[60px] my-[16px] flex flex-col md:flex-wrap  sm:flex-row sm:items-center"
      >
        <div className="flex items-center justify-between w-full">

          <div className="flex items-center">
            <Image
              src={MenuIcon}
              alt="Menu"
              className="relative mr-2 lg:hidden"
              onClick={handleToggleMenu}
            />

            <Drawer open={menuBar} onClose={handleToggleMenu}>
              <div className="flex items-center justify-between bg-[#F700000D] px-6 py-3">
                <div className="flex  gap-2 items-center">
                  <FaUser className="w-[18px] h-[18px]" />
                  <p className="text-[16px] font-medium text-black">
                    Hi, Log in
                  </p>
                </div>
                <IoClose
                  className="w-[18px] h-[18px]"
                  onClick={handleMenuclose}
                />
              </div>
              <div className="px-6 pb-6">
                <Link
                  href="/MyAccount"
                  className="flex gap-2 mt-6 items-center"
                  onClick={handleMenuclose}
                >
                  <Image src={user} alt="" className="w-[18px] h-[18px]" />
                  <p className="text-[16px] font-normal text-black">
                    Your Account
                  </p>
                </Link>
                <Link
                  href="/MyOrders"
                  className="flex gap-2 mt-4 items-center"
                  onClick={handleMenuclose}
                >
                  <Image src={order} alt="" className="w-[18px] h-[18px]" />
                  <p className="text-[16px] font-normal text-black">
                    My Orders
                  </p>
                </Link>
                <Link
                  href={"/favorite"}
                  className="flex gap-2 mt-4 items-center"
                  onClick={handleMenuclose}
                >
                  <Image src={Fav} alt="" className="w-[20px] h-[18px]" />
                  <p className="text-[16px] font-normal text-black">
                    Favourites
                  </p>
                </Link>
                {/* <div
                  className="flex gap-2 mt-4 items-center"
                  onClick={handleMenuclose}
                >
                  <Image src={location} alt="" className="w-[15px] h-[18px]" />
                  <p className="text-[16px] font-normal text-black">
                    Manage Addresses
                  </p>
                </div> */}
                <Link
                  href="/CreditLimit"
                  className="flex gap-2 mt-4 items-center"
                  onClick={handleMenuclose}
                >
                  <Image src={card} alt="" className="w-[20px] h-[18px]" />
                  <p className="text-[16px] font-normal text-black">
                    Credit Limit
                  </p>
                </Link>
                <Link
                  href="/ReferralRanking"
                  className="flex gap-2 mt-4 items-center"
                  onClick={handleMenuclose}
                >
                  <Image src={bulid} alt="" className="w-[18px] h-[18px]" />
                  <p className="text-[16px] font-normal text-black">
                    Referral Ranking
                  </p>
                </Link>
                {/* <Link
                  href="/PaymentPlan"
                  className="flex gap-2 mt-4 items-center"
                  onClick={handleMenuclose}
                >
                  <Image src={crown} alt="" className="w-[18px] h-[18px]" />
                  <p className="text-[16px] font-normal text-black">
                    Grazzle Membership
                  </p>
                </Link> */}
                {/* <div
                  className="flex gap-2 mt-4 items-center"
                  onClick={handleMenuclose}
                >
                  <Image src={Setting} alt="" className="w-[18px] h-[18px]" />
                  <p className="text-[16px] font-normal text-black">
                    Notification Settings
                  </p>
                </div>{" "} */}
                <p className="text-[16px] font-semibold mt-3 text-black">
                  Grazzle
                </p>
                <Link
                  href="/FAQs"
                  className="flex gap-2 mt-4 items-center"
                  onClick={handleMenuclose}
                >
                  <Image src={FAQ} alt="" className="w-[18px] h-[18px]" />
                  <p className="text-[16px] font-normal text-black">FAQs</p>
                </Link>
                <Link
                  href="/Terms&Conditions"
                  className="flex gap-2 mt-4 items-center"
                  onClick={handleMenuclose}
                >
                  <Image src={terms} alt="" className="w-[18px] h-[18px]" />
                  <p className="text-[16px] font-normal text-black">
                    Terms of Use
                  </p>
                </Link>
                <Link
                  href="/privacy-policy"
                  className="flex gap-2 mt-4 items-center"
                  onClick={handleMenuclose}
                >
                  <Image src={Privcy} alt="" className="w-[18px] h-[18px]" />
                  <p className="text-[16px] font-normal text-black ">
                    Privacy Policy
                  </p>
                </Link>
                <div
                  className="flex gap-2 mt-4 items-center cursor-pointer"
                  onClick={handelLogout}
                >
                  <BiLogOut className="text-[18px] text-[#777777]" />
                  <p className="text-[16px] font-normal text-black">Logout</p>
                </div>
              </div>
            </Drawer>

            <Link href="/">
              <Image
                src={logo}
                alt="Logo"
                className="lg:w-[80px] lg:h-[47px]  w-[60px] h-[37px] "
              />
            </Link>
          </div>


          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-red-600">
              Home
            </Link>
            <Link href="/offers" className="text-gray-700 hover:text-red-600">
              Offers
            </Link>

          <div className="hidden lg:flex items-center color-[#393A44] text-[14px] font-normal mx-[14px]">
            <Link href={"/"} className="mr-[24px] cursor-pointer">
              Home
            </Link>
            <div className="border-l-[1px] border-r-[1px] border-[#D2D4DA]">
              <Link href={"/offers"} className="mx-[24px] cursor-pointer">
                Offers
              </Link>
            </div>
            {/* <div>
              <Link href={"/"} className="ml-[24px] cursor-pointer">
                Categories
              </Link>
            </div> */}

          </div>
          <div className="hidden lg:flex">
            <div ref={searchContainerRef} className="relative w-[380px]">
              <input
                placeholder="Search"
                className="w-full lg:w-[380px] sm:w-[300px] h-[52px] rounded-full pl-[50px] focus:outline-none border-[1px] border-[#D2D4DA]"
                onClick={handleToggleSearch}
                onChange={(e) => {
                  onSearchProduct(e.target.value);
                  setSearchValue(e.target.value);
                }}
                ref={searchRef}
              />
              <Image
                src={Search}
                alt="Search"
                className="w-[36px] h-[36px] absolute top-[50%] left-[10px] transform -translate-y-1/2"
              />
              {isOpenSearch || searchResult?.length ? (
                <div className="fixed inset-0 z-50 opacity-100 bg-[rgba(0,0,0,0.2);] top-[90px]">
                  <div className="absolute bg-white opacity-100 right-[34%] w-[400px] z-10 p-4 px-6 shadow-lg border border-[#D2D4DA] rounded-xl">
                    {searchResult?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 my-3 cursor-pointer"
                        onClick={() => onClickDetail(item)}
                      >
                        <Image
                          src={Search}
                          alt="Search"
                          className="w-[36px] h-[36px]"
                        />
                        <div className="w-full">
                          <p className="text-black text-[14px] font-normal">
                            {item.title}
                          </p>
                          <hr />
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-3 items-center">
                      <PiClockCountdownThin className="text-black text-[#777777]" />
                      <p className="text-black text-[16px] font-semibold">
                        Recent Searches
                      </p>
                    </div>

                  ))}
                  <div className="p-3 border-t">
                    <p className="text-sm font-semibold mb-2">
                      Popular Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((search, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-200 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-300"
                        >
                          {search}
                        </span>

                    <div className="rounded-xl mt-3 bg-[#F8F8F8] p-3 w-[80%]">
                      {recentSearches.map((search, index) => (
                        <div key={index} className="flex gap-3 mt-3">
                          <Link
                            href={`/search?keyword=${encodeURIComponent(
                              search
                            )}`}
                            className="text-black text-[14px] font-normal"
                          >
                            {search}
                          </Link>
                        </div>

                      ))}
                    </div>
                    <div className="rounded-xl mt-3 bg-[#F8F8F8] p-3 w-[80%]">
                      <p className="text-black text-[16px] font-semibold">
                        Popular Searches
                      </p>
                      {Array.isArray(popularSearches) ? (
                        popularSearches.map((search, index) => (
                          <div key={index} className="flex gap-3 mt-3">
                            <Link
                              href="/StoreprouctPage"
                              className="text-black text-[14px] font-normal"
                            >
                              {search}
                            </Link>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm">
                          No Popular Search Found!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/CartPage" className="relative">
              <Badge badgeContent={cartLength} color="error">
                <Image src={Cart} alt="Cart" className="w-6 h-6" />

          <div className="flex items-center text-[14px] font-normal">
            <Link href="/CartPage" className="flex items-center">
              <Badge
                badgeContent={cartLength}
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#F70000",
                    color: "white",
                  },
                }}
                className="mr-3"
              >
                <Image src={Cart} alt="Cart" className="w-[24px] h-[24px]" />
              </Badge>
              <p className="text-[12px] hidden sm:block">Cart</p>
            </Link>
            <Link
              href="/RegisterSeller"
              className="hidden sm:flex items-center space-x-1"
              onClick={handleBecomeSeller}
            >
              <Image src={Seller} alt="Seller" className="w-5 h-5" />
              <span className="text-sm">Become Seller</span>
            </Link>
            <div ref={containerRef} className="relative">
              {user?.profile?.image ? (
                <Image
                  src={user.profile.image}
                  alt="User"
                  width={32}
                  height={32}
                  className="rounded-full cursor-pointer"
                  onClick={handleToggle}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
                  onClick={handleToggle}
                >
                  <BiUser className="text-gray-600" />
                </div>
              )}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 p-4">
                  <Link
                    href="/MyAccount"
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                  >
                    <Image src={user} alt="User" className="w-5 h-5" />
                    <span className="text-sm">Your Account</span>
                  </Link>
                  <Link
                    href="/MyOrders"
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                  >
                    <Image src={order} alt="Orders" className="w-5 h-5" />
                    <span className="text-sm">My Orders</span>
                  </Link>
                  <Link
                    href="/favorite"
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                  >
                    <Image src={Fav} alt="Favorites" className="w-5 h-5" />
                    <span className="text-sm">Favorites</span>
                  </Link>
                  <Link
                    href="/CreditLimit"
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                  >
                    <Image src={card} alt="Credit" className="w-5 h-5" />
                    <span className="text-sm">Credit Limit</span>
                  </Link>
                  <Link
                    href="/ReferralRanking"
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                  >
                    <Image src={bulid} alt="Referral" className="w-5 h-5" />
                    <span className="text-sm">Referral Ranking</span>
                  </Link>
                  <div className="border-t my-2"></div>
                  <Link
                    href="/FAQs"
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                  >
                    <Image src={FAQ} alt="FAQ" className="w-5 h-5" />
                    <span className="text-sm">FAQs</span>
                  </Link>
                  <Link
                    href="/privacy-policy"
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                  >
                    <Image src={Privcy} alt="Privacy" className="w-5 h-5" />
                    <span className="text-sm">Privacy Policy</span>
                  </Link>
            <div className="border-r-[1px] border-[#D2D4DA] mx-[8px] md:mx-[20px] h-4"></div>

            <Link href="/RegisterSeller" className="flex items-center">
              <Image
                src={Seller}
                alt="Seller"
                className="w-[24px] h-[24px] mr-2"
              />
              <p className="text-[12px] hidden sm:block lg:block">
                Become Seller
              </p>
            </Link>

            <div className="flex justify-end ml-2">
              <div ref={containerRef} className="relative">
                {token && token !== "" ? (
                  <div className="hidden lg:block">
                    {user && user?.profile?.image ? (
                      <div className="rounded-full bg-gray-300 w-[34px] h-[34px] flex justify-center ml-4 cursor-pointer items-center">
                        <Image
                          src={user?.profile?.image}
                          alt=""
                          className="w-full h-full rounded-full "
                          onClick={handleToggle}
                        />
                      </div>
                    ) : (
                      <div className="rounded-full bg-gray-300 w-[34px] h-[34px] flex justify-center ml-4 cursor-pointer items-center">
                        <BiUser className="h-5 w-5 " onClick={handleToggle} />
                      </div>
                    )}
                  </div>
                ) : (
                  <LoginDropdown />
                  // <Link
                  //   href="/signIn"
                  //   className="bg-[#F70000] py-2 px-6 rounded-md text-white"
                  // >
                  //   Login
                  // </Link>
                )}
                {isOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-[335px] ${isOpen ? "h-auto" : "h-0"
                      } bg-white p-5 shadow-lg border border-[#D2D4DA] rounded-md
                    transition-all
                    duration-800
                    origin-top z-[9999999]
                    `}
                  >
                    <Link href="/MyAccount" className="flex gap-2 items-center">
                      <Image
                        src={user}
                        width={18}
                        height={18}
                        alt=""
                        className="w-[18px] h-[18px]"
                      />
                      <p className="text-[16px] font-normal text-[#777777]">
                        Your Account
                      </p>
                    </Link>
                    <Link
                      href="/MyOrders"
                      className="flex gap-2 mt-4 items-center"
                    >
                      <Image
                        src={order}
                        alt=""
                        color="#777777"
                        className="w-[18px] h-[18px]"
                      />
                      <p className="text-[16px] font-normal text-[#777777]">
                        My Orders
                      </p>
                    </Link>
                    <Link
                      href="/favorite"
                      className="flex gap-2 mt-4 items-center"
                    >
                      <Image src={Fav} alt="" className="w-[18px] h-[18px]" />
                      <p className="text-[16px] font-normal text-[#777777]">
                        Favourites
                      </p>
                    </Link>
                    {/* <div className="flex gap-2 mt-4 items-center">
                      <Image
                        src={location}
                        alt=""
                        className="w-[15px] h-[18px]"
                      />
                      <p className="text-[16px] font-normal text-[#777777]">
                        Manage Addresses
                      </p>
                    </div> */}
                    <Link
                      href="/CreditLimit"
                      className="flex gap-2 mt-4 items-center"
                    >
                      <Image src={card} alt="" className="w-[18px] h-[18px]" />
                      <p className="text-[16px] font-normal text-[#777777]">
                        Credit Limit
                      </p>
                    </Link>
                    <Link
                      href="/ReferralRanking"
                      className="flex gap-2 mt-4 items-center"
                    >
                      <Image src={bulid} alt="" className="w-[18px] h-[18px]" />
                      <p className="text-[16px] font-normal text-[#777777]">
                        Referral Ranking
                      </p>
                    </Link>
                    {/* <Link
                      href="/PaymentPlan"
                      className="flex gap-2 mt-4 items-center"
                    >
                      <Image src={crown} alt="" className="w-[18px] h-[18px]" />
                      <p className="text-[16px] font-normal text-[#777777]">
                        Grazle Membership
                      </p>
                    </Link> */}
                    {/* <div className="flex gap-2 mt-4 items-center">
                      <Image
                        src={Setting}
                        alt=""
                        className="w-[18px] h-[18px]"
                      />
                      <p className="text-[16px] font-normal text-[#777777]">
                        Notification Settings
                      </p>
                    </div> */}
                    <p className="text-[16px] font-semibold mt-3 text-[#777777]">
                      Grazzle
                    </p>
                    <Link href="/FAQs" className="flex gap-2 mt-4 items-center">
                      <Image src={FAQ} alt="" className="w-[18px] h-[18px]" />
                      <p className="text-[16px] font-normal text-[#777777]">
                        FAQs
                      </p>
                    </Link>
                    <Link
                      href="/privacy-policy"
                      className="flex gap-2 mt-4 items-center"
                    >
                      <Image
                        src={Privcy}
                        alt=""
                        className="w-[18px] h-[18px]"
                      />
                      <p className="text-[16px] font-normal text-[#777777]">
                        Privacy Policy
                      </p>
                    </Link>
                    <div
                      className="flex gap-2 mt-4 items-center cursor-pointer"
                      onClick={handelLogout}
                    >
                      <BiLogOut className="text-[18px] text-[#777777]" />
                      <p className="text-[16px] font-normal text-[#777777]">
                        Logout
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="lg:hidden px-4 pb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full h-10 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            onClick={handleToggleSearch}
            onChange={(e) => {
              onSearchProduct(e.target.value);
              setSearchValue(e.target.value);
            }}
          />
          <Image
            src={Search}
            alt="Search"
            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2"
          />
        </div>
      </div>

      {/* Mobile menu drawer */}
      <Drawer open={menuBar} onClose={handleToggleMenu} anchor="left">
        <div className="w-64 p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Menu</h2>
            <IoClose
              className="w-6 h-6 cursor-pointer"
              onClick={handleMenuclose}
            />
          </div>
          <div className="space-y-4">
            <Link
              href="/"
              className="block py-2 hover:text-red-600"
              onClick={handleMenuclose}
            >
              Home
            </Link>
            <Link
              href="/offers"
              className="block py-2 hover:text-red-600"
              onClick={handleMenuclose}
            >
              Offers
            </Link>
            <Link
              href="/CartPage"
              className="block py-2 hover:text-red-600"
              onClick={handleMenuclose}
            >
              Cart
            </Link>
            <Link
              href="/RegisterSeller"
              className="block py-2 hover:text-red-600"
              onClick={handleBecomeSeller}
            >
              Become a Seller
            </Link>
            <hr className="my-4" />
            {user?.profile ? (
              <>
                <Link
                  href="/MyAccount"
                  className="block py-2 hover:text-red-600"
                  onClick={handleMenuclose}
                >
                  Your Account
                </Link>
                <Link
                  href="/MyOrders"
                  className="block py-2 hover:text-red-600"
                  onClick={handleMenuclose}
                >
                  My Orders
                </Link>
                <Link
                  href="/favorite"
                  className="block py-2 hover:text-red-600"
                  onClick={handleMenuclose}
                >
                  Favorites
                </Link>
                <Link
                  href="/CreditLimit"
                  className="block py-2 hover:text-red-600"
                  onClick={handleMenuclose}
                >
                  Credit Limit
                </Link>
                <Link
                  href="/ReferralRanking"
                  className="block py-2 hover:text-red-600"
                  onClick={handleMenuclose}
                >
                  Referral Ranking
                </Link>
              </>
            ) : (
              <Link
                href="/signIn"
                className="block py-2 hover:text-red-600"
                onClick={handleMenuclose}
              >
                Sign In
              </Link>
            )}
            <hr className="my-4" />
            <Link
              href="/FAQs"
              className="block py-2 hover:text-red-600"
              onClick={handleMenuclose}
            >
              FAQs
            </Link>
            <Link
              href="/privacy-policy"
              className="block py-2 hover:text-red-600"
              onClick={handleMenuclose}
            >
              Privacy Policy
            </Link>
            {user?.profile && (
              <button
                className="block w-full text-left py-2 text-red-600 hover:text-red-800"
                onClick={() => {
                  handleLogout();
                  handleMenuclose();
                }}
              >
                Logout
              </button>

        <div className="mt-4 sm:mt-0 md:mt-3 w-full lg:hidden">
          <div ref={searchContainerRef} className="relative w-full">
            <input
              placeholder="Search"
              className="w-full sm:w-[300px] md:w-full h-[52px] rounded-full pl-[50px] focus:outline-none border-[1px] border-[#D2D4DA]"
              onClick={handleToggleSearch}
            />
            <Image
              src={Search}
              alt="Search"
              className="w-[36px] h-[36px] absolute top-[50%] left-[8px] transform -translate-y-1/2"
            />
            {isOpenSearch && (
              <div className="absolute w-full bg-white shadow-lg border border-[#D2D4DA] mt-2 rounded-md">
                <p className="p-4">Search Dropdown Content</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
}
