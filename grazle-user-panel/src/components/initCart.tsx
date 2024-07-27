"use client";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateCartInitialState } from "@/features/features";

const InitCart = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cart = localStorage.getItem("cartItems")
        ? JSON.parse(localStorage.getItem("cartItems")!)
        : [];

      dispatch(updateCartInitialState(cart));
    }
  }, []);

  return <></>;
};

export default InitCart;
