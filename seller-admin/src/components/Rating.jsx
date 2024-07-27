// src/components/Rating.js
"use client";
import { Rate } from "antd";
import "antd/dist/reset.css";

const Rating = ({ value }) => {
  return <Rate value={value} disabled />;
};

export default Rating;
