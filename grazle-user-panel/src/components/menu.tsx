"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import home from "@/assets/icons8_Home 1.png";
import Profile from "@/assets/icons8_user_3 1.png";
import Cart from "@/assets/icons8_Shopping_Cart 1.png";
import order from "@/assets/icons8_Purchase_Order_1 1.png";

export default function Menu() {
  // Track the active link
  const [activeLink, setActiveLink] = useState<string>('/');

  // Handler to update active link
  const handleLinkClick = (path: string) => {
    setActiveLink(path);
  };

  // Define link styles
  const linkStyle = "flex flex-col items-center py-2 px-4 rounded-md cursor-pointer";
  const activeTextColor = "text-[#F81F1F]"; // Blue text color for active link
  const inactiveTextColor = "text-[#8B8B8B]"; // Gray text color for inactive links

  return (
    <div className="lg:hidden flex drop-shadow-md sm:flex md:flex items-center sticky bottom-0 bg-white justify-between mx-2 rounded-t-xl p-4">
      <Link 
        href="/" 
        className={`${linkStyle} ${activeLink === '/' ? activeTextColor : inactiveTextColor}`} 
        onClick={() => handleLinkClick('/')}
      >
        <Image src={home} alt="Home" className="h-[26px] w-[26px]" />
        <p className="mt-2 text-[12px] font-medium">
          Home
        </p>
      </Link>

      <Link 
        href="/CartPage" 
        className={`${linkStyle} ${activeLink === '/CartPage' ? activeTextColor : inactiveTextColor}`} 
        onClick={() => handleLinkClick('/CartPage')}
      >
        <Image src={Cart} alt="Cart" className="h-[26px] w-[26px]" />
        <p className="mt-2 text-[12px] font-medium">
          Cart
        </p>
      </Link>

      <Link 
        href="/MyOrders" 
        className={`${linkStyle} ${activeLink === '/MyOrders' ? activeTextColor : inactiveTextColor}`} 
        onClick={() => handleLinkClick('/MyOrders')}
      >
        <Image src={order} alt="Orders" className="h-[26px] w-[26px]" />
        <p className="mt-2 text-[12px] font-medium">
          Orders
        </p>
      </Link>

      <Link 
        href="/MyAccount" 
        className={`${linkStyle} ${activeLink === '/MyAccount' ? activeTextColor : inactiveTextColor}`} 
        onClick={() => handleLinkClick('/MyAccount')}
      >
        <Image src={Profile} alt="Profile" className="h-[26px] w-[26px]" />
        <p className="mt-2 text-[12px] font-medium">
          Profile
        </p>
      </Link>
    </div>
  );
}
