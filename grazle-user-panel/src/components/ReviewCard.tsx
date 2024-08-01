import React from "react";
import { Rating } from "@mui/material";
import Image from "next/image";
import { timeAgo } from "@/utils";

const ReviewCard = ({ review }) => (
  <div key={review.id} className="px-4 py-3 border-b border-b-gray-300">
    <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 lg:gap-0">
      <div className="flex items-center gap-3 lg:gap-5">
        <Rating
          name="read-only"
          value={Number(review.rating)}
          readOnly
          sx={{ "& .MuiSvgIcon-root": { fontSize: 13 } }}
        />
        <p className="text-[#000000] text-[12px] font-medium">
          {review.user.username}
        </p>
        <p className="text-[#74767E] text-[12px] font-normal">
          {timeAgo(new Date(review.created_at))}
        </p>
      </div>
    </div>
    <p className="text-[#000000] mt-2 text-[16px] font-medium">
      {review.comment}
    </p>
    <div className="flex items-center gap-2 lg:gap-4 mt-2">
      {review.reviewImages?.map((imgObj) => (
        <Image
          key={imgObj.id}
          width={68}
          height={68}
          alt=""
          src={imgObj.url}
          className="w-[68px] h-[68px] rounded-md"
        />
      ))}
    </div>
  </div>
);

const getReviewsArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (data.item && Array.isArray(data.item.reviews)) return data.item.reviews;
    if (Array.isArray(data.reviews)) return data.reviews;
    if (data.rating) return [data];
  }
  return [];
};

const ReviewSection = ({ reviewsData }) => {
  const reviews = getReviewsArray(reviewsData);

  return (
    <div>
      <h2 className="text-[#000000] text-[19px] border-t pt-5 mt-5">Reviews</h2>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
};

export default ReviewSection;