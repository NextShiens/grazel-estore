import React from "react";

const SkeletonLoader: React.FC = () => {
  return (
    <div className="animate-pulse lg:w-[98%] w-[95%] border border-gray-200 mb-1 mt-2 mt-[24px] rounded-2xl relative">
      <div className="w-full h-[203px] bg-gray-300 rounded-2xl"></div>
      <div className="p-3">
        <div className="h-6 bg-gray-300 rounded w-[80%] mb-4"></div>
        <div className="flex items-center mt-2 gap-1">
          <div className="h-4 bg-gray-300 rounded w-10"></div>
          <div className="h-4 bg-gray-300 rounded w-5"></div>
        </div>
        <div className="h-8 bg-gray-300 rounded w-24 mt-4"></div>
        <div className="flex items-center mt-4">
          <div className="h-4 bg-gray-300 rounded w-16"></div>
          <div className="h-4 bg-gray-300 rounded w-10 ml-6"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
