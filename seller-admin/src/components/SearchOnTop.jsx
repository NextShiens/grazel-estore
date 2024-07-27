import React from "react";

import { IoSearch } from "react-icons/io5";

const SearchOnTop = () => {
  return (
    <div className="bg-white h-[50px] rounded-[8px] flex items-center px-[25px] gap-3 shadow-sm">
      <IoSearch className="text-[var(--text-color-body)] text-[20px]" />
      <input className="flex-1 focus:outline-none text-[15px]" placeholder="Search Here" />
    </div>
  );
};

export default SearchOnTop;
