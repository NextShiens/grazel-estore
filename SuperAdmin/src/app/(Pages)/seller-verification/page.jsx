"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { IoEye } from "react-icons/io5";

import SearchOnTop from "@/components/SearchOnTop";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import Loading from "@/components/loading";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import { axiosPrivate } from "@/axios";

import electronicLED from "@/assets/document-image.png";
import tableAction from "@/assets/svgs/table-action.svg";

const SellerVerification = () => {
  const dispatch = useDispatch();
  const [selectedCustomer, setSelectedCustomer] = useState(0);
  const [allSellers, setAllSellers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation("seller-verification"));
  }, [dispatch]);

  useEffect(() => {
    const getAllSellers = async () => {
      const { data } = await axiosPrivate.get("/seller-stores", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setAllSellers(data?.sellers);
      console.log(data);
    };
    getAllSellers();
  }, []);

  const fn_viewDetails = (id) => {
    if (id === selectedCustomer) {
      return setSelectedCustomer(0);
    }
    setSelectedCustomer(id);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allSellers.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(allSellers.length / itemsPerPage);

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
          <div className="flex-1 mt-[30px] px-[10px] sm:px-[22px]">
            <SearchOnTop />
            <div className="my-[20px] px-[30px] py-[20px] bg-white rounded-[8px] shadow-sm overflow-x-auto w-[94vw] md:w-[67vw] lg:w-[75vw] xl:w-auto">
              <table className="w-[850px] xl:w-[100%]">
                <thead>
                  <tr className="font-[500] text-[var(--text-color-body)] text-[15px] h-[50px]">
                    <td>Name</td>
                    <td>Email Address</td>
                    <td>Phone Number</td>
                    <td>Business Name</td>
                    <td>Status</td>
                    <td className="w-[80px]">Action</td>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.id} className="h-[50px] text-[14px]">
                      <td className="flex items-center gap-1.5 h-[50px]">
                        <Image
                          width={26}
                          height={26}
                          alt=""
                          src={item?.profile?.image || electronicLED}
                          className="h-[26px] w-[26px] rounded-md"
                        />
                        {`${item?.username}`}
                      </td>
                      <td>{item?.email}</td>
                      <td>{item?.profile?.phone}</td>
                      <td className="flex flex-row gap-1">
                        <Image
                          width={26}
                          height={26}
                          alt=""
                          src={item?.store_profile?.store_image || electronicLED}
                          className="h-[26px] w-[26px] rounded-md"
                        />
                        {item?.store_profile?.store_name || "N/A"}
                      </td>
                      <td className="w-[130px]">
                        <p className="h-[23px] w-[60px] rounded-[5px] bg-[var(--bg-color-delivered)] text-[10px] text-[var(--text-color-delivered)] font-[500] flex items-center justify-center">
                          {item.active ? "Active" : "Inactive"}
                        </p>
                      </td>
                      <td className="px-[17px] relative">
                        <Image
                          alt=""
                          src={tableAction}
                          className="cursor-pointer"
                          onClick={() => fn_viewDetails(item.id)}
                        />
                        {selectedCustomer === item.id && (
                          <ViewDetails id={item.id} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allSellers.length === 0 && (
                <h3 className="text-center text-red-500">No sellers found</h3>
              )}
            </div>
            {allSellers.length > 0 && (
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
    </>
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

const ViewDetails = ({ id }) => {
  const navigate = useRouter();
  return (
    <div className="absolute py-[10px] px-[10px] flex flex-col items-center text-[var(--text-color-body)] bg-white rounded-[8px] shadow-md border border-gray-100 w-[max-content] left-[-145px] top-[13px] cursor-pointer">
      <div
        className="flex items-center gap-2.5 w-full px-2 py-1.5 hover:bg-gray-100 rounded-sm"
        onClick={() => navigate.push(`/seller-verification/${id}`)}
      >
        <IoEye className="w-[20px] h-[20px]" />
        <p className="text-[14px]">View Details</p>
      </div>
    </div>
  );
};

export default SellerVerification;