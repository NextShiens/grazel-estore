"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import "react-circular-progressbar/dist/styles.css";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import { axiosPrivate } from "@/axios";
import Section1 from "./Section1";
import Loading from "@/components/loading";
import OrderTable from "@/components/OrderTable";

const Dashboard = () => {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation("dashboard"));
  }, [dispatch]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      const { data } = await axiosPrivate.get(`/admin/orders?${params}?page=1&limit=10`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      setOrders(data.orders);
      setTotalPages(data.meta.totalPages);
      setTotalOrders(data.meta.totalItems);
      setItemsPerPage(data.meta.itemsPerPage);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const ellipsis = (
      <span key="ellipsis" className="mx-1">
        ...
      </span>
    );

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
    <>
      <Loading />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] p-[10px] sm:px-[25px]">
            <Section1 ordersLength={totalOrders} />
            <div className="my-[30px] px-[25px] py-[20px] bg-white rounded-[8px] shadow-sm overflow-x-auto w-[94vw] md:w-[67vw] lg:w-[75vw] xl:w-auto">
              <h2 className="text-lg font-bold my-2">Recent Orders </h2>
              {isLoading ? (
                <p>Loading orders...</p>
              ) : (
                <>
                  <table className="w-[1000px] xl:w-[100%] table-fixed">
                    <thead>
                      <tr className="font-[500] text-[var(--text-color-body)] text-[15px]">
                        <td>Order No</td>
                        <td>Product Name</td>
                        <td></td>
                        <td>Price</td>
                        <td>Date</td>
                        <td>Status</td>
                        <td>Seller Name</td>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((item) => (
                        <OrderTable order={item} key={item?.id} />
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <h3 className="text-center text-red-500">
                      No orders found
                    </h3>
                  )}
                  {orders.length > 0 && (
                    <div className="flex flex-col items-center mt-4">
                      <div className="flex justify-center items-center">
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
                      <div className="mt-2 text-sm text-gray-600">
                        Page {currentPage} of {totalPages} | Total Orders:{" "}
                        {totalOrders}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
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

export default Dashboard;
