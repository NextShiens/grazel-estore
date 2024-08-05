import Image from "next/image";
import React, { useState } from "react";

import product from "@/assets/document-image.png";

const RightSection = ({ allProducts }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allProducts?.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil((allProducts?.length || 0) / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const ellipsis = <span className="mx-1">...</span>;
    
    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <PageButton 
            key={i} 
            page={i} 
            currentPage={currentPage} 
            onClick={() => handlePageChange(i)} 
          />
        );
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(
            <PageButton 
              key={i} 
              page={i} 
              currentPage={currentPage} 
              onClick={() => handlePageChange(i)} 
            />
          );
        }
        pageNumbers.push(ellipsis);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(ellipsis);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(
            <PageButton 
              key={i} 
              page={i} 
              currentPage={currentPage} 
              onClick={() => handlePageChange(i)} 
            />
          );
        }
      } else {
        pageNumbers.push(ellipsis);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(
            <PageButton 
              key={i} 
              page={i} 
              currentPage={currentPage} 
              onClick={() => handlePageChange(i)} 
            />
          );
        }
        pageNumbers.push(ellipsis);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="bg-white rounded-[8px] shadow-sm p-[20px] flex-1">
      <p className="text-[24px] font-[600]">Recent Stock</p>
      <div className="w-[78vw] sm:w-[85vw] md:w-[63vw] lg:w-[48vw] xl:w-full overflow-x-auto">
        <table className="w-[610px] xl:w-[100%]">
          <thead>
            <tr className="text-[var(--text-color-body)] font-[500] text-[15px] leading-[45px]">
              <td>Product Name</td>
              <td>Seller Name</td>
              <td>Stock</td>
              <td>Price</td>
            </tr>
          </thead>
          <tbody>
            {currentItems?.length > 0 &&
              currentItems?.map((item, i) => (
                <tr className="text-[14px] leading-[35px]" key={i}>
                  <td className="h-[100%] flex gap-1 items-center">
                    <Image
                      alt=""
                      width={30}
                      height={30}
                      src={item?.featured_image || product}
                      className="rounded-full max-h-7"
                      layout="fixed"
                    />
                    <label>{item.title}</label>
                  </td>
                  <td>{item?.user?.username} </td>
                  <td>
                    <p
                      className={`${
                        item.active ? "bg-green-200" : "bg-red-200"
                      } h-[28px] w-[75px] rounded-[5px] text-[10px] text-[var(--text-color-delivered)] font-[500] flex items-center justify-center `}
                    >
                      {item.active ? "In Stock" : "Out of Stock"}
                    </p>
                  </td>
                  <td>₹{item.price}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {!allProducts?.length && (
          <h3 className="text-center text-red-500">No product found</h3>
        )}
      </div>
      {allProducts?.length > 0 && (
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const PageButton = ({ page, currentPage, onClick }) => (
  <button
    onClick={onClick}
    className={`mx-1 px-3 py-1 rounded ${
      currentPage === page
        ? "bg-red-500 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    {page}
  </button>
);

export default RightSection;