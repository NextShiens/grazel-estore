"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Drawer, Badge } from "@mui/material";
import { IoClose } from "react-icons/io5";
import { PiClockCountdownThin } from "react-icons/pi";
import { FaUser } from "react-icons/fa";
import { BiLogOut, BiUser } from "react-icons/bi";

// Import your images here
import logo from "@/assets/Grazle Logo.png";
import Search from "@/assets/search.png";
import Cart from "@/assets/Cart.png";
import Seller from "@/assets/Vector.png";
import MenuIcon from "@/assets/VectorMenu.png";
import user from "@/assets/users.png";
import order from "@/assets/order.png";
import Fav from "@/assets/hearts.png";
import card from "@/assets/Group 1820549982.png";
import bulid from "@/assets/Vector (3).png";
import FAQ from "@/assets/Group 1820549989.png";
import Privcy from "@/assets/Layer 2.png";

// Utility function for debounce
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartLength = useSelector((state) => state.cartLength);
  const cartProducts = useSelector((state) => state.cartProducts);

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [menuBar, setIsMenuBar] = useState(false);
  const [popularSearches, setPopularSearches] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [user, setUser] = useState({});

  const containerRef = useRef(null);
  const searchContainerRef = useRef(null);
  const MenubarRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!cartProducts.length) {
      dispatch({ type: "UPDATE_CART", payload: { type: "onRefresh" } });
    }
    fetchPopularSearches();
    fetchUserProfile();
  }, []);

  const fetchPopularSearches = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/global/popular-searches`);
      const data = await response.json();
      setPopularSearches(data.keywords);
    } catch (error) {
      console.error("Failed to fetch popular searches:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/global/search-results?keywords=${keyword}`);
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

  const handleClickOutside = (event) => {
    if (MenubarRef.current && !MenubarRef.current.contains(event.target)) {
      setIsMenuBar(false);
    }
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsOpen(false);
    }
    if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
      setIsOpenSearch(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      setIsMenuBar(false);
      router.push("/signIn");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const onClickDetail = (item) => {
    router.push(`/search?keyword=${searchValue}`);
    setIsOpenSearch(false);
    setSearchResult([]);
    if (searchRef.current) {
      searchRef.current.value = "";
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src={MenuIcon}
              alt="Menu"
              className="lg:hidden mr-4 cursor-pointer w-6 h-6"
              onClick={handleToggleMenu}
            />
            <Link href="/">
              <Image
                src={logo}
                alt="Grazle Logo"
                className="w-20 h-12 object-contain"
              />
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-red-600">Home</Link>
            <Link href="/offers" className="text-gray-700 hover:text-red-600">Offers</Link>
          </div>

          <div className="flex-1 max-w-xl mx-6 hidden lg:block">
            <div ref={searchContainerRef} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
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
                className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2"
              />
              {(isOpenSearch || searchResult?.length > 0) && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-md shadow-lg">
                  {searchResult.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => onClickDetail(item)}
                    >
                      <Image
                        src={Search}
                        alt="Search"
                        className="w-5 h-5 mr-3"
                      />
                      <p className="text-sm text-gray-700">{item.title}</p>
                    </div>
                  ))}
                  <div className="p-3 border-t">
                    <p className="text-sm font-semibold mb-2">Popular Searches</p>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((search, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-200 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-300"
                        >
                          {search}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/CartPage" className="relative">
              <Badge
                badgeContent={cartLength}
                color="error"
              >
                <Image src={Cart} alt="Cart" className="w-6 h-6" />
              </Badge>
            </Link>
            <Link href="/RegisterSeller" className="hidden sm:flex items-center space-x-1">
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
                  <Link href="/MyAccount" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Image src={user} alt="User" className="w-5 h-5" />
                    <span className="text-sm">Your Account</span>
                  </Link>
                  <Link href="/MyOrders" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Image src={order} alt="Orders" className="w-5 h-5" />
                    <span className="text-sm">My Orders</span>
                  </Link>
                  <Link href="/favorite" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Image src={Fav} alt="Favorites" className="w-5 h-5" />
                    <span className="text-sm">Favorites</span>
                  </Link>
                  <Link href="/CreditLimit" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Image src={card} alt="Credit" className="w-5 h-5" />
                    <span className="text-sm">Credit Limit</span>
                  </Link>
                  <Link href="/ReferralRanking" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Image src={bulid} alt="Referral" className="w-5 h-5" />
                    <span className="text-sm">Referral Ranking</span>
                  </Link>
                  <div className="border-t my-2"></div>
                  <Link href="/FAQs" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Image src={FAQ} alt="FAQ" className="w-5 h-5" />
                    <span className="text-sm">FAQs</span>
                  </Link>
                  <Link href="/privacy-policy" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Image src={Privcy} alt="Privacy" className="w-5 h-5" />
                    <span className="text-sm">Privacy Policy</span>
                  </Link>
                  <div
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={handleLogout}
                  >
                    <BiLogOut className="w-5 h-5" />
                    <span className="text-sm">Logout</span>
                  </div>
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
            <h2 className="text-xl font-semibold">Menu</h2>
            <IoClose className="w-6 h-6 cursor-pointer" onClick={handleMenuclose} />
          </div>
          <div className="space-y-4">
            <Link href="/" className="block py-2 hover:text-red-600" onClick={handleMenuclose}>Home</Link>
            <Link href="/offers" className="block py-2 hover:text-red-600" onClick={handleMenuclose}>Offers</Link>
            <Link href="/CartPage" className="block py-2 hover:text-red-600" onClick={handleMenuclose}>Cart</Link>
            <Link href="/RegisterSeller" className="block py-2 hover:text-red-600" onClick={handleMenuclose}>Become a Seller</Link>
            <hr className="my-4" />
            {user?.profile ? (
              <>
                <Link href="/MyAccount" className="block py-2 hover:text-red-600" onClick={handleMenuclose}>Your Account</Link>
                <Link href="/MyOrders" className="block py-2 hover:text-red-600" onClick={handleMenuclose}>My Orders</Link>
                <Link href="/favorite" className="block py-2 hover:text-red-600" onClick={handleMenuclose}>Favorites</Link>
                <Link href="/CreditLimit" className="block py-2 hover:text-red-600" onClick={handleMenuclose}>Credit Limit</Link>
                <Link href="/ReferralRanking" className="block py-2 hover:text-red-600" onClick={handleMenuclose}>Referral Ranking</Link>
              </>
            ) : (
              <Link href="/signIn" className="block py-2 hover:text-red-600" onClick={handleMenuclose}>Sign In</Link>
            )}
            <hr className="my-4" />
            <Link href="/FAQs" className="block py-2 hover:text-red-600" onClick={handleMenuclose}>FAQs</Link>
            <Link href="/privacy-policy" className="block py-2 hover:text-red-600" onClick={handleMenuclose}>Privacy Policy</Link>
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
            )}
          </div>
        </div>
      </Drawer>
    </nav>
  );
};

export default Navbar;