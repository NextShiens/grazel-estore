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
import { updateCart } from "@/features/features";
import {
  debounce,
  searchProductApi,
  getPopularSearchApi,
  getProfileApi,
} from "@/apis";
import LoginDropdown from "./LoginDropdown";
import { useAuth } from "@/app/AuthContext";
import { ShoppingLoader } from "vibrant-loaders";

export default function Navbar() {
  const cartLength = useSelector((state) => state.cartLength);
  const cartProducts = useSelector((state) => state.cartProducts);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [menuBar, setIsMenuBar] = useState(false);
  const [popularSearches, setPopularSearches] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const containerRef = useRef(null);
  const searchContainerRef = useRef(null);
  const MenubarRef = useRef(null);
  const searchRef = useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const { user: authUser, loading: authLoading, login, logout } = useAuth();

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

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getProfileApi();
        setUser(data.user);
      } catch (error) {}
    })();
  }, []);

  const handleToggleMenu = () => setIsMenuBar((prev) => !prev);
  const handleMenuclose = () => setIsMenuBar(false);
  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleToggleSearch = () => setIsOpenSearch((prev) => !prev);

  const handleClickOutside = (event) => {
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onSearchProduct = debounce(async (keyword) => {
    if (!keyword) {
      setSearchResult([]);
      return;
    }
    try {
      const { data } = await searchProductApi(keyword);
      setSearchResult(data?.products);
    } catch (error) {
      console.log(error);
    }
  }, 300);

  function onClickDetail(item) {
    const newSearch = item.title;
    setRecentSearches((prevSearches) => {
      const updatedSearches = [
        newSearch,
        ...prevSearches.filter((search) => search !== newSearch),
      ].slice(0, 5);
      return updatedSearches;
    });
    router.push(`/search?keyword=${encodeURIComponent(newSearch)}`);
    setIsOpenSearch(false);
    setSearchResult([]);
    if (searchRef.current) {
      searchRef.current.value = "";
    }
  }
  if (loading) {
    return (
      <div style={{ 
        position: "fixed", 
        width: "100%", 
        height: "100%", 
        left: 0, 
        top: 0, 
        overflow: "hidden" ,
        zIndex: 100000000000000
      }}>
        <ShoppingLoader />
      </div>
    );
    return <ShoppingLoader />;
  }

  const handleBecomeSeller = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/RegisterSeller");
    }, 2000);
  };

  const handleLogout = async () => {
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
  };

  if (authLoading) {
    return (
      <div style={{ 
        position: "fixed", 
        width: "100%", 
        height: "100%", 
        left: 0, 
        top: 0, 
        overflow: "hidden" ,
        zIndex: 100000000000
      }}>
        <ShoppingLoader />
      </div>
    );
  }

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
          <div className="flex items-center">
            <Image
              src={MenuIcon}
              alt="Menu"
              className="relative mr-2 lg:hidden"
              onClick={handleToggleMenu}
            />
            <Link href="/">
              <Image
                src={logo}
                alt="Logo"
                className="lg:w-[80px] lg:h-[47px] w-[60px] h-[37px]"
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
                    {searchResult && searchResult.length > 0 ? (
                      searchResult.map((item) => (
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
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No product available</p>
                      </div>
                    )}

                    {recentSearches.length > 0 && (
                      <>
                        <div className="flex gap-3 items-center">
                          <PiClockCountdownThin className="text-black text-[#777777]" />
                          <p className="text-black text-[16px] font-semibold">
                            Recent Searches
                          </p>
                        </div>
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
                      </>
                    )}

                    <div className="rounded-xl mt-3 bg-[#F8F8F8] p-3 w-[80%]">
                      <p className="text-black text-[16px] font-semibold">
                        Popular Searches
                      </p>
                      {Array.isArray(popularSearches) &&
                      popularSearches.length > 0 ? (
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
              </Badge>
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
              {authUser ? (
                <div
                  className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
                  onClick={handleToggle}
                >
                  {authUser.profile?.image ? (
                    <Image
                      src={authUser.profile.image}
                      alt="User"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <BiUser className="text-gray-600" />
                  )}
                </div>
              ) : (
                <LoginDropdown />
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
                    <Image src={order} alt="" className="w-[18px] h-[18px]" />
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
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded w-full text-left"
                  >
                    <BiLogOut className="w-5 h-5" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              )}
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
            <h2 className="text-xl font-semibold bg-custom-red">Hi.Log In</h2>
            <IoClose
              className="w-6 h-6 cursor-pointer"
              onClick={handleMenuclose}
            />
          </div>
          <div className="space-y-4">
            {/* <Link
              href="/"
              className="block py-2 hover:text-red-600"
              onClick={handleMenuclose}
            >
              Home
            </Link> */}
            {/* <Link
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
            <hr className="my-4" /> */}
            {authUser ? (
              <>
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
                  <Image src={order} alt="" className="w-[18px] h-[18px]" />
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
            {authUser && (
              <button
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded w-full text-left"
                onClick={() => {
                  handleLogout();
                  handleMenuclose();
                }}
              >
                <BiLogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            )}
          </div>
        </div>
      </Drawer>
    </nav>
  );
}
