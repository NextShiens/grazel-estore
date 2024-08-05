import React from "react";
import {
  Rating,
  Box,
  Typography,
  LinearProgress,
  Divider,
} from "@mui/material";
import Image from "next/image";
import { timeAgo } from "@/utils";

const RatingsOverview = ({ reviewsData }) => {
  const reviews = Array.isArray(reviewsData)
    ? reviewsData
    : reviewsData.reviews || [];
  const totalReviews = reviews.length;
  const averageRating =
    reviews.reduce((acc, review) => acc + Number(review.rating), 0) /
      totalReviews || 0;

  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    ratingCounts[Math.floor(Number(review.rating)) - 1]++;
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "flex-start",
        gap: 4,
        p: 4,
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Box sx={{ textAlign: "center", minWidth: 120 }}>
        <Typography
          variant="body1"
          fontWeight="bold"
          sx={{
            backgroundColor: "#F69B26",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            marginBottom: 1,
          }}
        >
          {totalReviews === 0 || averageRating === 0
            ? "Rating"
            : averageRating < 2
            ? "Poor"
            : averageRating < 3
            ? "Good"
            : averageRating < 4
            ? "Very Good"
            : averageRating < 5
            ? "outstanding"
            : "Excellent"}
        </Typography>
        <Typography variant="h3" component="div" fontWeight="bold">
          {averageRating.toFixed(1)}
        </Typography>
        <Rating
          value={averageRating}
          readOnly
          precision={0.1}
          size="small"
          sx={{
            "& .MuiRating-iconFilled": {
              color: "#F69B26",
            },
            "& .MuiRating-iconHover": {
              color: "#F69B26",
            },
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {totalReviews} {totalReviews === 1 ? "Review" : "Rating"}
        </Typography>
      </Box>
      <Divider
        orientation="vertical"
        flexItem
        sx={{ display: { xs: "none", sm: "block" } }}
      />
      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          maxWidth: { sm: "70%", md: "60%", lg: "50%" },
        }}
      >
        {[5, 4, 3, 2, 1].map((star) => (
          <Box key={star} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 70 }}>
              <Rating
                value={star}
                readOnly
                size="small"
                sx={{
                  "& .MuiRating-iconFilled": {
                    color: "#F69B26",
                  },
                }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={(ratingCounts[star - 1] / totalReviews) * 100}
              sx={{
                flexGrow: 1,
                mx: 1,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#F69B26",
                },
              }}
            />
            <Typography variant="body2" sx={{ minWidth: 30 }}>
              {ratingCounts[star - 1]}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const ReviewCard = ({ reviewData }) => {
  const getReviewsArray = (data) => {
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === "object") {
      if (data.item && Array.isArray(data.item.reviews)) {
        return data.item.reviews;
      } else if (Array.isArray(data.reviews)) {
        return data.reviews;
      } else if (data.rating) {
        return [data];
      }
    }
    return [];
  };

  const reviews = getReviewsArray(reviewData);

  if (reviews.length === 0) {
    return (
      <div className="p-4 sm:p-6 text-center text-gray-500">
        No Reviews Found...
      </div>
    );
  }

  return (
    <>
      {reviews.map((review) => (
        <div
          key={review.id}
          className="p-4 sm:p-6 border-b border-gray-200 hover:bg-gray-50 transition-all duration-300 ease-in-out"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
            <div className="flex items-center space-x-4 mb-2 sm:mb-0">
              {review.user.profile && review.user.profile.image ? (
                <Image
                  src={review.user.profile.image}
                  alt={`${review.user.username}'s profile`}
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-base sm:text-lg">
                  {review.user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-gray-800 font-semibold text-sm sm:text-base">
                  {review.user.username}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {timeAgo(new Date(review.created_at))}
                </p>
              </div>
            </div>
            <Rating
              name="read-only"
              value={Number(review.rating)}
              readOnly
              sx={{
                "& .MuiSvgIcon-root": {
                  fontSize: { xs: 16, sm: 20 },
                  color: "#F69B26",
                },
              }}
            />
          </div>

          <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
            {review.comment}
          </p>

          {review.reviewImages && review.reviewImages.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:gap-4 mt-4">
              {review.reviewImages.map((imgObj) => (
                <div
                  key={imgObj.id}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <Image
                    fill
                    alt={`Review image by ${review.user.username}`}
                    src={imgObj.url}
                    className="object-contain"
                    sizes="(max-width: 640px) 80px, 100px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
};

const ReviewSection = ({ reviewsData }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 bg-gray-50 p-4 sm:p-6 border-b border-gray-200">
        Ratings & Reviews
      </h2>
      <RatingsOverview reviewsData={reviewsData} />
      <div>
        <ReviewCard reviewData={reviewsData} />
      </div>
    </div>
  );
};

export default ReviewSection;
