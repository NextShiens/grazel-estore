"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import "./style.css";
import Loading from "@/components/loading";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import SearchOnTop from "@/components/SearchOnTop";

import electronicLED from "@/assets/Electronic-LED.png";
import tableAction from "@/assets/svgs/table-action.svg";
import { IoEye } from "react-icons/io5";

import { useRouter } from "next/navigation";
import { axiosPrivate } from "@/axios";
import { cn } from "@/lib/utils";
import OrderTable from "@/components/OrderTable";

const Orders = () => {
  const dispatch = useDispatch();
  const [selectedCustomer, setSelectedCustomer] = useState(0);
  const [orderId, setOrderId] = useState(0);
  const [selectedTab, setSelectedTab] = useState("all");
  const [allOrders, setOrders] = useState([]);
  const [cancelOrder, setCancelOrder] = useState([]);
  const [pendingOrder, setPendingOrder] = useState([]);
  const [completedOrder, setCompletedOrder] = useState([]);
  const orderRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation("orders"));
  }, [dispatch]);

  const fn_viewDetails = (id) => {
    if (id === orderId) {
      return setOrderId(0);
    }
    setOrderId(id);
  };

  useEffect(() => {
    const getAllOrders = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosPrivate.get("/admin/orders", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        orderRef.current = data?.orders;
        setOrders(data?.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    !allOrders?.length && getAllOrders();
  }, []);

  useEffect(() => {
    const allOrderArr = orderRef?.current;

    if (selectedTab === "delivered") {
      setCompletedOrder(allOrderArr.filter((item) => item.status === "completed"));
    } else if (selectedTab === "pending") {
      setPendingOrder(allOrderArr.filter((item) => item.status === "new" || item.status === "in_progress" || item.status === "shipped"));
    } else if (selectedTab === "cancelled") {
      setCancelOrder(allOrderArr.filter((item) => item.status === "cancelled"));
    } else {
      setOrders(allOrderArr);
    }

    setCurrentPage(1);
  }, [selectedTab]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const getCurrentItems = () => {
    const items = selectedTab === "delivered" ? completedOrder :
                  selectedTab === "pending" ? pendingOrder :
                  selectedTab === "cancelled" ? cancelOrder :
                  allOrders;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  const getTotalItems = () => {
    return selectedTab === "delivered" ? completedOrder.length :
           selectedTab === "pending" ? pendingOrder.length :
           selectedTab === "cancelled" ? cancelOrder.length :
           allOrders.length;
  };

  const currentItems = getCurrentItems();
  const totalItems = getTotalItems();

  const totalPages = Math.ceil(totalItems / itemsPerPage);

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
                <p
                  className={`cursor-pointer hover:text-[var(--text-color)] font-[500] border-b-[2px] hover:border-[var(--text-color)] ${
                    selectedTab === "all"
                      ? "text-[var(--text-color)] border-[var(--text-color)]"
                      : "text-[var(--text-color-body)] border-transparent"
                  }`}
                  onClick={() => setSelectedTab("all")}
                >
                  All Orders
                </p>
                <p
                  className={`cursor-pointer hover:text-[var(--text-color)] font-[500] border-b-[2px] hover:border-[var(--text-color)] ${
                    selectedTab === "delivered"
                      ? "text-[var(--text-color)] border-[var(--text-color)]"
                      : "text-[var(--text-color-body)] border-transparent"
                  }`}
                  onClick={() => setSelectedTab("delivered")}
                >
                  Delivered
                </p>
                <p
                  className={`cursor-pointer hover:text-[var(--text-color)] font-[500] border-b-[2px] hover:border-[var(--text-color)] ${
                    selectedTab === "pending"
                      ? "text-[var(--text-color)] border-[var(--text-color)]"
                      : "text-[var(--text-color-body)] border-transparent"
                  }`}
                  onClick={() => setSelectedTab("pending")}
                >
                  Pending
                </p>
                <p
                  className={`cursor-pointer hover:text-[var(--text-color)] font-[500] border-b-[2px] hover:border-[var(--text-color)] ${
                    selectedTab === "cancelled"
                      ? "text-[var(--text-color)] border-[var(--text-color)]"
                      : "text-[var(--text-color-body)] border-transparent"
                  }`}
                  onClick={() => setSelectedTab("cancelled")}
                >
                  Cancelled
                </p>
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
                        status={selectedTab === "all" ? undefined : [selectedTab === "delivered" ? "completed" : selectedTab]}
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

const ViewDetails = ({ id }) => {
  const navigate = useRouter();
  const dispatch = useDispatch();
  return (
    <div className="absolute py-[10px] px-[10px] flex flex-col items-center text-[var(--text-color-body)] bg-white rounded-[8px] shadow-md border border-gray-100 w-[max-content] left-[-145px] top-[13px] cursor-pointer">
      <div
        className="flex items-center gap-2.5 w-full px-2 py-1.5 hover:bg-gray-100 rounded-sm"
        onClick={() => {
          dispatch(updatePageLoader(true));
          navigate.push(`/orders/${id}`);
        }}
      >
        <IoEye className="w-[20px] h-[20px]" />
        <p className="text-[14px]">View Details</p>
      </div>
    </div>
  );
};