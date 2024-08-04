"use client";
import {
  updateCart,
  updateProductQty,
  deleteCartProduct,
} from "@/features/features";
import Link from "next/link";
import Image from "next/image";
import { FaRegEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { CiSquareCheck } from "react-icons/ci";
import { RiDeleteBin6Fill } from "react-icons/ri";
import React, { Fragment, useEffect } from "react";
import { calculateDiscountPercentage } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import { HiOutlineMinus, HiOutlinePlus } from "react-icons/hi";

export default function Cartpage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartProducts = useSelector((state: any) => state.cartProducts);
  const cartLength = useSelector((state: any) => state.cartLength);
  const cartTotal = useSelector((state: any) => state.cartTotal);
  const cartDiscount = useSelector((state: any) => state.cartDiscount);

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

  console.log(cartProducts);
  return (
    <>
      {cartProducts.length > 0 ? (
        <div className=" lg:my-[50px] my-[20px] sm:my-[20px] md:my-[30px] lg:mx-[150px] mx-[20px] sm:mx-[20px] md:mx-[30px]">
          <div className="flex items-center">
            <p className="md:text-[40px] text-[30px] md:font-semibold font-medium mr-3 ">
              Cart
            </p>
            <p className="md:text-[24px] text-[20px] font-medium text-[#777777] ">
              ({cartLength} Products)
            </p>
          </div>

          {/* <div className="lg:w-[70%] w-[100%] mb-3 rounded-2xl bg-[#FFFAFA] flex justify-between p-3">
            <p className="text-[16px] font-medium text-[#777777]">
              Add More Products
            </p>

            <p className="text-[16px] font-medium text-[#F70000]">
              <Link href="/">+ Add</Link>
            </p>
          </div> */}

          <div className="flex flex-wrap lg:flex-nowrap sm:flex-wrap md:flex-wrap  gap-8">
            <div className="lg:w-[70%] w-[100%] sm:w-[100%] md:w-[100%] h-auto ">
              {cartProducts?.map((item: any) => (
                <Fragment key={item.id}>
                  <div
                    style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
                    className="w-[100%] rounded-[20px] p-[20px] mb-2  border-[1px] border-[#777777] hover:border-[#F70000]"
                  >
                    <div className="flex items-center">
                      <CiSquareCheck className="text-[#F70000] text-[24px] mr-3" />
                      <p className="text-[24px] font-normal">{item?.title}</p>
                    </div>

                    <div className="my-5 border-b-[1px] border-[#777777]"></div>

                    <div className="lg:w-[100%] w-[100%] mb-3 rounded-2xl bg-[#FFFAFA] flex justify-between p-3">
                      <p className="text-[16px] font-medium text-[#777777]">
                        Add More Products
                      </p>

                      <p className="text-[16px] font-medium text-[#F70000]">
                        <Link href="/">+ Add</Link>
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CiSquareCheck className="text-[#F70000] lg:block sm:hidden hidden text-[32px] mr-3" />
                        <Image
                          src={item.featured_image}
                          width={100}
                          height={100}
                          alt="Product Image"
                          className="rounded-2xl lg:w-[90px] w-[60px] h-[60px] lg:h-[90px] lg:mr-7 mr-3 "
                        />

                        <div>
                          <p className="lg:text-[24px] text-[16px] font-medium text-black">
                            {item?.title}
                          </p>

                          <div className="my-3 flex items-center">
                            <div className="flex justify-center items-center">
                              <p className="text-[12px] font-medium text-[#F70000] px-3 py-2 mr-3 bg-[#FFFAFA]">
                                {item?.discountInfo}
                              </p>
                            </div>

                            <p
                              className={`line-through lg:text-[16px] text-[10px] sm:text-[12px] md:text-[14px] font-medim text-[#777777]`}
                            >
                              ₹
                              {item?.originalPrice &&
                                Number(item?.originalPrice).toFixed(2)}
                            </p>
                          </div>

                          <p className="md:text-[18px] text-sm font-medium">
                            ₹{Number(item.discountPrice).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="lg:w-[124px] lg:mt-0 mt-3 sm:mt-3 md:mt-3   rounded-full border-[1px] border-[#E6E6E6] p-2 flex items-center justify-between">
                          <div
                            onClick={() =>
                              onChangeQty("decrement", item?.id, item?.qty)
                            }
                            className="lg:w-[34px] cursor-pointer lg:h-[34px] h-[24px] w-[24px] rounded-full bg-[#F2F2F2] flex items-center cusor-pointer justify-center"
                          >
                            <HiOutlineMinus className="text-[16px] font-bold " />
                          </div>

                          <p className="text-[16px] font-bold lg:mx-0 mx-3">
                            {item?.qty}
                          </p>

                          <div
                            onClick={() =>
                              onChangeQty("increment", item?.id, item?.qty)
                            }
                            className="g:w-[34px] cursor-pointer lg:h-[34px] h-[24px] w-[24px] rounded-full bg-[#F2F2F2] flex items-center cusor-pointer justify-center"
                          >
                            <HiOutlinePlus className="text-[16px] font-bold " />
                          </div>
                        </div>

                        <div className="flex justify-end mt-4 gap-4">
                          <div className="lg:w-[43px] lg:h-[43px] h-[30px] w-[30px]  bg-[#5EF7000A] rounded-md flex items-center justify-center">
                                {/* <FaRegEdit className="lg:text-[24px] text-[18px] text-[#00F763]" /> */}
                              </div>

                          <div
                            onClick={() => onDeleteProduct(item?.id)}
                            className="lg:w-[43px] cursor-pointer lg:h-[43px] h-[30px] w-[30px] bg-[#F700000A] rounded-md flex items-center justify-center"
                          >
                            <RiDeleteBin6Fill className="lg:text-[24px] text-[18px] text-[#F70000]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>

            <div
              style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
              className="lg:w-[25%] w-[100%] sm:w-[100%] md:w-[100%] rounded-[20px] p-[20px]"
            >
              <div className="w-[100%] ">
                <p className="text-[20px] font-medium">Promo Code</p>
                <div className="flex relative items-center border border-[#0000000D] rounded-full overflow-hidden">
                  <input
                    className="w-full rounded-xl h-[50px] pl-3 pr-[90px] focus:outline-none placeholder:text-[#777777]"
                    placeholder="Type Here"
                  />

                  <button className="absolute right-[10px] h-[35px] w-[70px] text-[12px] font-medium text-white bg-[#FFA31A] rounded-full">
                    Apply
                  </button>
                </div>
              </div>

              <div className="border-b-[1px] mt-10"></div>
              <div className="w-[100%] ">
                <p className="text-[24px] font-medium mt-6">Cart Total</p>

                {/* <div className="flex items-center mt-4 justify-between">
                      <p className="text-[18px] font-medium text-[#777777] "></p>
                      <p className="text-[18px] font-bold text-black ">Cart Total</p>
                    </div> */}

                <div className="flex items-center mt-4 justify-between">
                  <p className="text-[18px] font-medium text-[#777777] ">
                    Shipping
                  </p>
                  <p className="text-[18px] font-bold text-black ">Free</p>
                </div>

                <div className="flex items-center mt-4 justify-between">
                  <p className="text-[18px] font-medium text-[#777777] ">
                    Discount
                  </p>

                  <p className="text-[18px] font-bold text-black ">
                    {Number(cartDiscount).toFixed(0)}
                  </p>
                </div>

                <div className="flex  items-center mt-4 justify-between">
                  <p className="text-[18px] font-bold text-black ">
                    Cart Total
                  </p>
                  <p className="text-[18px] font-bold">
                    ₹{Number(cartTotal.toFixed(0))}
                  </p>
                </div>

                <button
                  className=" bg-[#F70000] rounded-full h-[45px] mt-8  w-[100%] text-[18px] font-medium text-white"
                  onClick={() =>{goToShippingAddress()}}
                >
                  Continue Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <h1 className="text-center text-[20px] font-bold p-10">
          Your Cart is Empty
        </h1>
      )}
    </>
  );
}
