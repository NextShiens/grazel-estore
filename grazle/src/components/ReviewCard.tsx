import React from "react";
import Image from "next/image";
import { timeAgo } from "@/utils";
import { Rating } from "@mui/material";

const ReviewCard = ({ ...item }) => {
  return (
    <>
      <div className="px-4 py-3 border-b border-b-gray-300">
        <div className="flex lg:gap-0 gap-3 sm:gap-3 flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center justify-between">
          <div className="lg:gap-5 gap-9 sm:gap-9  flex items-center gap-3">
            <Rating
              name="read-only"
              mt-3
              defaultValue={Number(item.rating)}
              readOnly
              sx={{
                "& .MuiSvgIcon-root": {
                  fontSize: 13,
                },
              }}
            />

            <p className="text-[#000000] text-[12px] font-medium">
              {item.user.username}
            </p>
            <p className="text-[#74767E] text-[12px] font-normal">
              {timeAgo(new Date(item.created_at))}
            </p>
          </div>

          <p className="text-[#74767E] text-[16px] font-normal">
            {" "}
            {timeAgo(new Date(item.created_at))}
          </p>
        </div>

        <p className="text-[#000000] mt-2 text-[16px] font-medium">
          {item.comment}
        </p>

        <div className="flex items-center  lg:gap-4 gap-2 sm:gap-2 ">
          {item.reviewImages.map((imgObj: any) => (
            <Image
              width={68}
              height={68}
              alt=""
              src={imgObj.url}
              className="w-[68px]  h-[68px] rounded-md"
            />
          ))}
        </div>
        {/* <p className="text-[#74767E] mt-2 text-[16px] font-medium">
          Color Family:Gold, Bracelet Size:One Size
        </p> */}
      </div>
    </>
  );
};

export default ReviewCard;
