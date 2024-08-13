"use client";
import {
  updateCart,
  updateProductQty,
  deleteCartProduct,
} from "@/features/features";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CiSquareCheck } from "react-icons/ci";
import { RiDeleteBin6Fill } from "react-icons/ri";
import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HiOutlineMinus, HiOutlinePlus } from "react-icons/hi";

export default function Cartpage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartProducts = useSelector((state: any) => state.cartProducts);
  const cartLength = useSelector((state: any) => state.cartLength);
  const cartTotal = useSelector((state: any) => state.cartTotal);
  const cartDiscount = useSelector((state: any) => state.cartDiscount);

  const [expandedTitles, setExpandedTitles] = useState({});

  useEffect(() => {
    !cartProducts.length && dispatch(updateCart({ type: "onRefresh" }));
  }, []);

  const onChangeQty = (type: any, productId: any, productQty: any) => {
    dispatch(updateProductQty({ type, id: productId, qty: productQty }));
  };

  const onDeleteProduct = (productId: any) => {
    dispatch(deleteCartProduct(productId));
  };

  const goToShippingAddress = () => {
    router.push("/address");
  };

  const toggleTitleExpansion = (id) => {
    setExpandedTitles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTitle = (item) => {
    const words = item.title.split(' ');
    const shortTitle = words.slice(0, 2).join(' ');
    const isLongTitle = words.length > 2;

    return (
      <div>
        <p className="text-sm lg:text-base font-medium text-black truncate">
          {expandedTitles[item.id] || !isLongTitle ? item.title : `${shortTitle}...`}
        </p>
        {isLongTitle && (
          <button
            className="text-[#F70000] text-xs"
            onClick={() => toggleTitleExpansion(item.id)}
          >
            {expandedTitles[item.id] ? 'See Less' : 'See More'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {cartProducts.length > 0 ? (
        <div>
          <div className="flex items-center mb-4">
            <h1 className="text-xl sm:text-2xl font-semibold mr-2">Cart</h1>
            <p className="text-sm sm:text-base font-medium text-gray-600">
              ({cartLength} Products)
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="lg:w-2/3 w-full">
              {cartProducts?.map((item: any) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-3 mb-3 border border-gray-100 hover:border-[#F70000] transition-colors duration-300">
                  <div className="flex items-center mb-2">
                    <CiSquareCheck className="text-[#F70000] text-base mr-1" />
                    <p className="text-sm font-medium">{item?.title}</p>
                  </div>

                  <div className="my-2 border-b border-gray-100"></div>

                  <div className="bg-[#FFFAFA] rounded-md flex justify-between p-2 mb-2 text-xs">
                    <p className="font-medium text-gray-600">
                      Add More Products
                    </p>
                    <Link href="/" className="font-medium text-[#F70000]">
                      + Add
                    </Link>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Image
                        alt="Product Image"
                        width={50}
                        height={50}
                        src={item.featured_image}
                        className="rounded-md mr-3"
                        onError={(e: any) => {
                          console.error("Image failed to load:", e);
                          e.target.src = "/path/to/fallback-image.jpg";
                        }}
                      />

                      <div>
                        {renderTitle(item)}

                        <div className="flex items-center mt-1">
                          <p className="text-xs font-medium text-[#F70000] px-1.5 py-0.5 mr-1.5 bg-[#FFFAFA] rounded">
                            {item?.discountInfo}
                          </p>
                          <p className="line-through text-xs text-gray-500">
                            ₹{item?.originalPrice && Number(item?.originalPrice).toFixed(2)}
                          </p>
                        </div>

                        <p className="text-sm font-medium mt-0.5">
                          ₹{Number(item.discountPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center justify-between bg-gray-100 rounded-full p-1 w-20">
                        <button
                          onClick={() => onChangeQty("decrement", item?.id, item?.qty)}
                          className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm"
                        >
                          <HiOutlineMinus className="text-xs" />
                        </button>
                        <span className="text-xs font-bold">{item?.qty}</span>
                        <button
                          onClick={() => onChangeQty("increment", item?.id, item?.qty)}
                          className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm"
                        >
                          <HiOutlinePlus className="text-xs" />
                        </button>
                      </div>

                      <button
                        onClick={() => onDeleteProduct(item?.id)}
                        className="mt-2 p-1.5 bg-[#F700000A] rounded-md flex items-center justify-center"
                      >
                        <RiDeleteBin6Fill className="text-base text-[#F70000]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:w-1/3 w-full">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-medium mb-3">Promo Code</h2>
                <div className="flex relative items-center border border-gray-200 rounded-full overflow-hidden">
                  <input
                    className="w-full rounded-full h-10 px-3 text-sm focus:outline-none placeholder-gray-500"
                    placeholder="Type Here"
                  />
                  <button className="absolute right-1 h-7 w-16 text-xs font-medium text-white bg-[#FFA31A] rounded-full">
                    Apply
                  </button>
                </div>

                <div className="border-b my-4"></div>

                <h2 className="text-lg font-medium mb-3">Cart Total</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <p className="text-gray-600">Shipping</p>
                    <p className="font-bold">Free</p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-gray-600">Discount</p>
                    <p className="font-bold">₹{Number(cartDiscount).toFixed(0)}</p>
                  </div>

                  <div className="flex justify-between font-bold">
                    <p>Cart Total</p>
                    <p>₹{Number(cartTotal.toFixed(0))}</p>
                  </div>
                </div>

                <button
                  className="bg-[#F70000] text-white rounded-full h-10 w-full text-sm font-medium mt-4"
                  onClick={goToShippingAddress}
                >
                  Continue Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <h1 className="text-center text-lg font-bold p-6">
          Your Cart is Empty
        </h1>
      )}
    </div>
  );
}