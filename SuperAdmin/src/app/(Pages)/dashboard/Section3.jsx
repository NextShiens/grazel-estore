import Image from "next/image";
import React, { useState } from "react";
import electronicLED from "@/assets/Electronic-LED.png";
import { cn } from "@/lib/utils";
import OrderTable from "@/components/OrderTable";

const Section3 = ({ allOrders }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(allOrders.length / itemsPerPage));

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const ellipsis = <span key="ellipsis" className="mx-1">...</span>;

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
      let startPage = Math.max(1, currentPage - 1);
      let endPage = Math.min(startPage + 3, totalPages);

      if (endPage - startPage < 3) {
        startPage = Math.max(1, endPage - 3);
      }

      if (startPage > 1) {
        pageNumbers.push(
          <PageButton
            key={1}
            page={1}
            currentPage={currentPage}
            onClick={() => handlePageChange(1)}
          />
        );
        if (startPage > 2) {
          pageNumbers.push(ellipsis);
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <PageButton
            key={i}
            page={i}
            currentPage={currentPage}
            onClick={() => handlePageChange(i)}
          />
        );
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push(ellipsis);
        }
        pageNumbers.push(
          <PageButton
            key={totalPages}
            page={totalPages}
            currentPage={currentPage}
            onClick={() => handlePageChange(totalPages)}
          />
        );
      }
    }

    return pageNumbers;
  };

  return (
    <div className="my-[30px] px-[25px] py-[20px] bg-white rounded-[8px] shadow-sm overflow-x-auto w-[94vw] md:w-[67vw] lg:w-[75vw] xl:w-auto">
      <h2 className="text-lg font-bold my-2">Recent Orders</h2>
      <table className="w-[1000px] xl:w-[100%] table-fixed">
        <thead>
          <tr className="font-[500] text-[var(--text-color-body)] text-[15px]">
            <td>Order No</td>
            <td>Product Name</td>
            <td>Price</td>
            <td>Date</td>
            <td className="">Status</td>
            <td className="">Seller Name</td>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
            <OrderTable order={item} key={item?.id} />
          ))}
        </tbody>
      </table>
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
    </div>
  );
};

const PageButton = ({ page, currentPage, onClick }) => (
  <button
    onClick={onClick}
    className={`mx-1 px-3 py-1 rounded ${currentPage === page
      ? "bg-red-500 text-white"
      : "bg-gray-200 text-gray-700"
      }`}
  >
    {page}
  </button>
);

export default Section3;