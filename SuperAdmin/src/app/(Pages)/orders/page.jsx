"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import { axiosPrivate } from "@/axios";
import Loading from "@/components/loading";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import SearchOnTop from "@/components/SearchOnTop";
import OrderTable from "@/components/OrderTable";

const Orders = () => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation("orders"));
  }, [dispatch]);

  useEffect(() => {
    const getOrders = async () => {
      setIsLoading(true);
      try {
        const endpoint = selectedTab === "all" 
          ? "/admin/orders"
          : `/admin/orders?status=${selectedTab}`;
        
        const { data } = await axiosPrivate.get(endpoint, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        setOrders(data?.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getOrders();
  }, [selectedTab]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

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
    <>
      <Loading />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[10px] sm:px-[25px]">
            <SearchOnTop />
            <div className="my-[20px] p-[30px] bg-white rounded-[8px] shadow-sm overflow-x-auto w-[94vw] md:w-[67vw] lg:w-[75vw] xl:w-auto">
              <div className="flex gap-10 mb-[15px] w-[max-content]">
                {["all", "new", "shipped", "completed", "cancelled"].map((tab) => (
                  <p
                    key={tab}
                    className={`cursor-pointer hover:text-[var(--text-color)] font-[500] border-b-[2px] hover:border-[var(--text-color)] ${
                      selectedTab === tab
                        ? "text-[var(--text-color)] border-[var(--text-color)]"
                        : "text-[var(--text-color-body)] border-transparent"
                    }`}
                    onClick={() => setSelectedTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} Orders
                  </p>
                ))}
              </div>
              {isLoading ? (
                <p>Loading orders...</p>
              ) : (
                <table className="w-[1000px] xl:w-[100%]">
                  <thead>
                    <tr className="font-[500] text-[var(--text-color-body)] text-[15px] h-[50px]">
                      <td>Order No</td>
                      <td>Product Name</td>
                      <td>Price</td>
                      <td>Date</td>
                      <td>Status</td>
                      <td>Seller</td>
                      <td className="w-[80px]">Action</td>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item) => (
                      <OrderTable
                        type="action"
                        order={item}
                        key={item?.id}
                      />
                    ))}
                  </tbody>
                </table>
              )}
              {!isLoading && currentItems.length === 0 && (
                <h3 className="text-center text-red-500">No orders found</h3>
              )}
              {!isLoading && currentItems.length > 0 && (
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

export default Orders;