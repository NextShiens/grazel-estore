"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Drawer, Badge, CircularProgress, Divider } from "@mui/material";
import { IoClose } from "react-icons/io5";
import { PiClockCountdownThin } from "react-icons/pi";
import { BiLogOut, BiUser } from "react-icons/bi";
import { FaUser } from "react-icons/fa";
import { ShoppingLoader } from "vibrant-loaders";
import { updateCart } from "@/features/features";
import {
  debounce,
  searchProductApi,
  getPopularSearchApi,
  suggestionKeyApi,
} from "@/apis";
import { useAuth } from "@/app/AuthContext";
import LoginDropdown from "./LoginDropdown";
import home from "@/assets/icons8_Home 1.png";

// Import all images
import logo from "@/assets/Grazle Logo.png";
import Search from "@/assets/search.png";
import Cart from "@/assets/Cart.png";
import Seller from "@/assets/Vector.png";
import MenuIcon from "@/assets/VectorMenu.png";
import order from "@/assets/order.png";
import Fav from "@/assets/hearts.png";
import card from "@/assets/Group 1820549982.png";
import crown from "@/assets/crown.png";
import bulid from "@/assets/Vector (3).png";
import FAQ from "@/assets/Group 1820549989.png";
import Privcy from "@/assets/Layer 2.png";

const SearchBar = ({
  searchContainerRef,
  searchRef,
  searchValue,
  setSearchValue,
  onSearchProduct,
  clearSearch,
  isOpenSearch,
  setIsOpenSearch,
  searchResult,
  onClickDetail,
  recentSearches,
  popularSearches,
}) => {
  const router = useRouter();

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchValue.trim()) {
        setIsOpenSearch(false);
        router.push(
          `/search?keyword=${encodeURIComponent(searchValue.trim())}`
        );
      }
    }
  };

  return (
    <div className="hidden lg:flex">
      <div ref={searchContainerRef} className="relative w-[380px]">
        <input
          placeholder="Search"
          className="w-full lg:w-[380px] sm:w-[300px] h-[52px] rounded-full pl-[50px] pr-[40px] focus:outline-none border-[1px] border-[#D2D4DA]"
          onClick={() => setIsOpenSearch(true)}
          onKeyPress={handleKeyPress}
          onChange={(e) => {
            const value = e.target.value;
            setSearchValue(value);
            onSearchProduct(value);
          }}
          value={searchValue}
          ref={searchRef}
        />
        <Image
          src={Search}
          alt="Search"
          className="w-[36px] h-[36px] absolute top-[50%] left-[10px] transform -translate-y-1/2"
        />
        {searchValue && (
          <button
            className="absolute top-1/2 right-[10px] transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={clearSearch}
          >
            <IoClose size={24} />
          </button>
        )}
        {isOpenSearch && (
          <div className="absolute top-full left-0 right-0 bg-white z-50 mt-2 shadow-lg border border-gray-200 rounded-lg">
            <div className="p-4">
              <IoClose
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                size={24}
                onClick={() => setIsOpenSearch(false)}
              />
              {searchResult && searchResult.length > 0 ? (
                searchResult.map((item, index) => (
                  <div
                    key={index}
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
                        {item}
                      </p>
                      <hr />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No suggestions available</p>
                </div>
              )}

              {recentSearches.length > 0 && (
                <>
                  <div className="flex gap-3 items-center mt-4">
                    <PiClockCountdownThin className="text-black text-[#777777]" />
                    <p className="text-black text-[16px] font-semibold">
                      Recent Searches
                    </p>
                  </div>
                  <div className="rounded-xl mt-3 bg-[#F8F8F8] p-3">
                    {recentSearches.map((search, index) => (
                      <div key={index} className="flex gap-3 mt-3">
                        <Link
                          href={`/search?keyword=${encodeURIComponent(search)}`}
                          className="text-black text-[14px] font-normal"
                        >
                          {search}
                        </Link>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="rounded-xl mt-3 bg-[#F8F8F8] p-3">
                <p className="text-black text-[16px] font-semibold">
                  Popular Searches
                </p>
                {Array.isArray(popularSearches) &&
                  popularSearches.length > 0 ? (
                  popularSearches.map((search, index) => (
                    <div key={index} className="flex gap-3 mt-3">
                      <Link
                        href={`/search?keyword=${encodeURIComponent(search)}`}
                        className="text-black text-[14px] font-normal"
                      >
                        {search}
                      </Link>
                    </div>
                  ))
                ) : (
                  <span className="text-sm">No Popular Searches Found</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const MobileSearchBar = ({
  searchValue,
  setSearchValue,
  searchRef,
  clearSearch,
  onSearchProduct,
  searchResult,
  onClickDetail,
  recentSearches,
  popularSearches,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setIsDropdownOpen(
      searchValue !== "" ||
      recentSearches.length > 0 ||
      popularSearches.length > 0
    );
  }, [searchValue, searchResult, recentSearches, popularSearches]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchValue.trim()) {
        setIsDropdownOpen(false);
        setSearchValue(searchValue.trim());
        clearSearch();
        router.push(
          `/search?keyword=${encodeURIComponent(searchValue.trim())}`
        );
      }
      setIsDropdownOpen(false);
    }
    setIsDropdownOpen(false);
  };

  const onSelect = ({ e, item }) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    router.push(`/search?keyword=${encodeURIComponent(item)}`);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchProduct(value);
  };

  return (
    <div className="lg:hidden px-4 pb-3 relative" ref={dropdownRef}>
      <div className={`relative ${isDropdownOpen ? "z-[10000]" : ""}`}>
        <input
          type="text"
          placeholder="Search products..."
          className="w-full h-10 pl-10 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white"
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          value={searchValue}
          ref={searchRef}
        />
        <Image
          src={Search}
          alt="Search"
          className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2"
        />
        {searchValue && (
          <IoClose
            className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={() => {
              clearSearch();
              setIsDropdownOpen(false);
            }}
          />
        )}
      </div>
      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-10 z-[9998]"
            onClick={() => setIsDropdownOpen(false)}
          ></div>
          <div className="absolute left-0 right-0 bg-white z-[9999] mt-2 shadow-lg border border-gray-200 rounded-lg max-h-[60vh] overflow-y-auto">
            {searchValue &&
              searchResult.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                  onClick={(e) => {
                    setIsDropdownOpen(false);
                    onSelect({ e, item });
                    clearSearch();
                    setIsDropdownOpen(false);
                  }}
                >
                  <Image src={Search} alt="Search" className="w-5 h-5" />
                  <p className="text-black text-sm font-normal">{item}</p>
                </div>
              ))}

            {/* {recentSearches.length > 0 && (
              <div className="p-3">
                <p className="text-black text-[16px] font-semibold mb-2">
                  Recent Searches
                </p>
                {recentSearches.map((search, index) => (
                  <div key={index} className="flex gap-3 mt-2">
                    <Link
                      href={`/search?keyword=${encodeURIComponent(search)}`}
                      className="text-black text-[14px] font-normal"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setSearchValue(search);
                      }}
                    >
                      {search}
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {popularSearches.length > 0 && (
              <div className="p-3">
                <p className="text-black text-[16px] font-semibold mb-2">
                  Popular Searches
                </p>
                {popularSearches.map((search, index) => (
                  <div key={index} className="flex gap-3 mt-2">
                    <Link
                      href={`/search?keyword=${encodeURIComponent(search)}`}
                      className="text-black text-[14px] font-normal"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setSearchValue(search);
                      }}
                    >
                      {search}
                    </Link>
                  </div>
                ))}
              </div>
            )} */}
          </div>
        </>
      )}
    </div>
  );
};

const UserMenu = ({ user, handleToggle, isOpen, router, handleLogout }) => (
  <>
    <div
      className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
      onClick={handleToggle}
    >
      {user?.profile?.image ? (
        <Image
          src={user.profile.image}
          alt="User"
          width={32}
          height={32}
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <BiUser className="text-gray-600" />
      )}
    </div>
    {isOpen && (
      <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 p-4">
        <Link
          href="/MyAccount"
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
        >
          {user?.profile?.image ? (
            <Image
              src={user.profile.image}
              alt="User"
              width={16}
              height={16}
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <div className="w-5 h-5 bg-gray-200" />
          )}
          <span className="text-sm">Your Account</span>
        </Link>
        <div
          onClick={() => router.push("/MyOrders")}
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
        >
          <Image src={order} alt="" width={18} height={18} />
          <span className="text-sm">My Orders</span>
        </div>
        <div
          onClick={() => router.push("/favorite")}
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
        >
          <Image src={Fav} alt="Favorites" width={20} height={20} />
          <span className="text-sm">Favorites</span>
        </div>
        <div
          onClick={() => router.push("/CreditLimit")}
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
        >
          <Image src={card} alt="Credit" width={20} height={20} />
          <span className="text-sm">Credit Limit</span>
        </div>
        <div
          onClick={() => router.push("/PaymentPlan")}
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
        >
          <Image src={crown} alt="Referral" width={20} height={20} />
          <span className="text-sm">Payment Plan</span>
        </div>
        <div
          onClick={() => router.push("/ReferralRanking")}
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
        >
          <Image src={bulid} alt="Referral" width={20} height={20} />
          <span className="text-sm">Referral Ranking</span>
        </div>
        <div className="border-t my-2"></div>
        <div
          onClick={() => router.push("/FAQs")}
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
        >
          <Image src={FAQ} alt="FAQ" width={20} height={20} />
          <span className="text-sm">FAQs</span>
        </div>
        <div
          onClick={() => router.push("/privacy-policy")}
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
        >
          <Image src={Privcy} alt="Privacy" width={20} height={20} />
          <span className="text-sm">Privacy Policy</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded w-full text-left"
        >
          <BiLogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    )}
  </>
);

const MobileMenu = ({
  menuBar,
  handleToggleMenu,
  user,
  handleMenuclose,
  handleBecomeSeller,
  handleLogout,
}) => (
  <Drawer open={menuBar} onClose={handleToggleMenu} anchor="left">
    <div className="w-64 p-4">
      {user && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer">
              {user?.profile?.image ? (
                <Image
                  src={user.profile.image}
                  alt="User"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <BiUser className="text-gray-600" />
              )}
            </div>
            <h2 className="ml-4 text-xl font-semibold">{user.username}</h2>
          </div>
          <IoClose
            className="w-6 h-6 cursor-pointer"
            onClick={handleMenuclose}
          />
        </div>
      )}
      <div className="space-y-4">
        <Link
          href="/"
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
          onClick={handleMenuclose}
        >
          <Image src={home} alt="Home" className="w-5 h-5" />
          <span className="text-sm">Home</span>
        </Link>
        <Link
          href="/offers"
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
          onClick={handleMenuclose}
        >
          <Image src={Seller} alt="Offers" className="w-5 h-5" />
          <span className="text-sm">Offers</span>
        </Link>
        <Link
          href="/CartPage"
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
          onClick={handleMenuclose}
        >
          <Image src={Cart} alt="Cart" className="w-5 h-5" />
          <span className="text-sm">Cart</span>
        </Link>
        <Link
          href="/RegisterSeller"
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
          onClick={handleBecomeSeller}
        >
          <Image src={Seller} alt="Become Seller" className="w-5 h-5" />
          <span className="text-sm">Become a Seller</span>
        </Link>
        <hr className="my-4" />
        {user ? (
          <>
            <Link
              href="/MyOrders"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
              onClick={handleMenuclose}
            >
              <Image src={order} alt="" className="w-[18px] h-[18px]" />
              <span className="text-sm">My Orders</span>
            </Link>
            <Link
              href="/favorite"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
              onClick={handleMenuclose}
            >
              <Image src={Fav} alt="Favorites" className="w-5 h-5" />
              <span className="text-sm">Favorites</span>
            </Link>
            <Link
              href="/CreditLimit"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
              onClick={handleMenuclose}
            >
              <Image src={card} alt="Credit" className="w-5 h-5" />
              <span className="text-sm">Credit Limit</span>
            </Link>
            <Link
              href="/PaymentPlan"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
              onClick={handleMenuclose}
            >
              <Image src={crown} alt="Referral" className="w-5 h-5" />
              <span className="text-sm">Payment Plan</span>
            </Link>
            <Link
              href="/ReferralRanking"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
              onClick={handleMenuclose}
            >
              <Image src={bulid} alt="Referral" className="w-5 h-5" />
              <span className="text-sm">Referral Ranking</span>
            </Link>
            <hr className="my-4" />
            <Link
              href="/FAQs"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
              onClick={handleMenuclose}
            >
              <Image src={FAQ} alt="FAQ" className="w-5 h-5" />
              <span className="text-sm">FAQs</span>
            </Link>
            <Link
              href="/privacy-policy"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
              onClick={handleMenuclose}
            >
              <Image src={Privcy} alt="Privacy" className="w-5 h-5" />
              <span className="text-sm">Privacy Policy</span>
            </Link>
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
          </>
        ) : (
          <Link
            href="/signIn"
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
            onClick={handleMenuclose}
          >
            <FaUser className="w-5 h-5" />
            <span className="text-sm">Sign In</span>
          </Link>
        )}
      </div>
    </div>
  </Drawer>
);

export default function Navbar() {
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [menuBar, setIsMenuBar] = useState(false);
  const [popularSearches, setPopularSearches] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);

  const cartLength = useSelector((state) => state.cartLength);
  const cartProducts = useSelector((state) => state.cartProducts);
  const userRedux = useSelector((state) => state.user);

  const containerRef = useRef(null);
  const searchContainerRef = useRef(null);
  const MenubarRef = useRef(null);
  const searchRef = useRef(null);

  const dispatch = useDispatch();
  const router = useRouter();
  const { user: authUser, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("theUser"));
    if (user) {
      setUser(user);
    }
  }, [userRedux]);

  // const fetchPopularSearches = async () => {
  //   try {
  //     const { data } = await getPopularSearchApi();
  //     setPopularSearches(data.keywords);
  //   } catch (error) {
  //     console.error("Failed to fetch popular searches:", error);
  //   }
  // };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/profile`,
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
  const fetchPopularSearches = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global/popular-searches`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch popular searches");
      }
      const data = await response.json();
      setPopularSearches(data.keywords || []);
    } catch (error) {
      console.error("Failed to fetch popular searches:", error);
      setPopularSearches([]);
    }
  };
  useEffect(() => {
    !cartProducts.length && dispatch(updateCart({ type: "onRefresh" }));
    fetchPopularSearches();
    fetchUserProfile();

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "visible";
    };
  }, []);
  const handleToggleMenu = () => setIsMenuBar((prev) => !prev);
  const handleMenuclose = () => setIsMenuBar(false);
  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleToggleSearch = () => {
    setIsOpenSearch((prev) => {
      document.body.style.overflow = prev ? "visible" : "hidden";
      return !prev;
    });
  };

  const handleClickOutside = (event) => {
    if (
      searchContainerRef.current &&
      !searchContainerRef.current.contains(event.target)
    ) {
      setIsOpenSearch(false);
    }
    if (MenubarRef.current && !MenubarRef.current.contains(event.target)) {
      setIsMenuBar(false);
    }
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const onSearchProduct = debounce(async (keyword) => {
    if (!keyword) {
      setSearchResult([]);
      return;
    }
    try {
      const { data } = await suggestionKeyApi(keyword);
      setSearchResult((data?.suggestions || []).slice(0, 7));
    } catch (error) {
      console.log(error);
    }
  }, 300);

  const onClickDetail = (item, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const newSearch = item; // item is now directly the suggestion string
    setRecentSearches((prevSearches) => {
      const updatedSearches = [
        newSearch,
        ...prevSearches.filter((search) => search !== newSearch),
      ].slice(0, 5);
      return updatedSearches;
    });
    router.push(`/search?keyword=${encodeURIComponent(newSearch)}`);
    setIsLoading(false);
    setIsOpenSearch(false);
    setSearchResult([]);
    setSearchValue("");
    if (searchRef.current) {
      searchRef.current.value = "";
    }
  };

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
    } catch (error) {
      console.log(error);
      setIsMenuBar(false);
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    if (searchRef.current) {
      searchRef.current.value = "";
    }
    onSearchProduct("");
  };

  if (authLoading || isLoading || loading) {
    return (
      <div
        style={{
          position: "fixed",
          width: "100%",
          height: "100%",
          left: 0,
          top: 0,
          overflow: "hidden",
          zIndex: 100000000000000,
        }}
      >
        <ShoppingLoader />
      </div>
    );
    return <ShoppingLoader />;
  }

  // useEffect(() => {
  //   !cartProducts.length && dispatch(updateCart({ type: "onRefresh" }));
  //   fetchPopularSearches();
  //   fetchUserProfile();

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //     document.body.style.overflow = "visible";
  //   };
  // }, []);

  return (
    <nav className="bg-white shadow-md relative">
      <div className="container mx-auto px-4 py-3">
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

          <SearchBar
            searchContainerRef={searchContainerRef}
            searchRef={searchRef}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            onSearchProduct={onSearchProduct}
            clearSearch={clearSearch}
            isOpenSearch={isOpenSearch}
            setIsOpenSearch={setIsOpenSearch}
            searchResult={searchResult}
            onClickDetail={onClickDetail}
            recentSearches={recentSearches}
            popularSearches={popularSearches}
          />

          <div className="flex items-center space-x-4">
            <Link href="/CartPage" className="relative">
              <Badge badgeContent={cartLength} color="error">
                <Image src={Cart} alt="Cart" className="w-6 h-6" />
                <span className="text-sm">Cart</span>
              </Badge>
            </Link>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: "none", sm: "block" } }}
            />
            <Link
              href="/RegisterSeller"
              className="hidden sm:flex items-center space-x-1"
              onClick={handleBecomeSeller}
            >
              <Image src={Seller} alt="Seller" className="w-5 h-5" />
              <span className="text-sm">Become Seller</span>
            </Link>
            <div ref={containerRef} className="relative">
              {user ? (
                <UserMenu
                  user={user}
                  handleToggle={handleToggle}
                  isOpen={isOpen}
                  router={router}
                  handleLogout={handleLogout}
                />
              ) : (
                <LoginDropdown />
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileSearchBar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        searchRef={searchRef}
        clearSearch={clearSearch}
        onSearchProduct={onSearchProduct}
        searchResult={searchResult}
        onClickDetail={onClickDetail}
        recentSearches={recentSearches}
        popularSearches={popularSearches}
      />

      <MobileMenu
        menuBar={menuBar}
        handleToggleMenu={handleToggleMenu}
        user={user}
        handleMenuclose={handleMenuclose}
        handleBecomeSeller={handleBecomeSeller}
        handleLogout={handleLogout}
      />
    </nav>
  );
}
