import React from "react";
import Link from "next/link";
import Image from "next/image";
import home from "@/assets/icons8_Home 1.png";
import Profile from "@/assets/icons8_user_3 1.png";
import Cart from "@/assets/icons8_Shopping_Cart 1.png";
import order from "@/assets/icons8_Purchase_Order_1 1.png";

export default function Menu() {
  return (
    <div className="lg:hidden flex drop-shadow-md  sm:flex md:flex items-center sticky bottom-0 bg-white  justify-between mx-2 rounded-t-xl p-4">
      <Link href="/">
        <Image src={home} alt="" className="h-[26px] w-[26px]" />
        <p className="mt-2 text-[12px] text-[#8B8B8B] font-medium">Home</p>
      </Link>

      <Link href="/CartPage">
        <Image src={Cart} alt="" className="h-[26px] w-[26px]" />
        <p className="mt-2 text-[12px] text-[#8B8B8B] font-medium">Cart</p>
      </Link>

      <Link href="/MyOrders">
        <Image src={order} alt="" className="h-[26px] w-[26px]" />
        <p className="mt-2 text-[12px] text-[#8B8B8B] font-medium">Order</p>
      </Link>

      <Link href={"/MyAccount"}>
        <Image src={Profile} alt="" className="h-[26px] w-[26px]" />
        <p className="mt-2 text-[12px] text-[#8B8B8B] font-medium">Profile</p>
      </Link>
    </div>
  );
}
