"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { cn } from "@/lib/utils";
import SearchOnTop from "@/components/SearchOnTop";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import electronicLED from "@/assets/document-image.png";
import tableAction from "@/assets/svgs/table-action.svg";
import Image from "next/image";
import { axiosPrivate } from "@/axios";
import Loading from "@/components/loading";
import { IoEye } from "react-icons/io5";
import { useRouter } from "next/navigation";

const Sellers = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [sellerId, setSellerId] = useState(0);
  const [selectedTab, setSelectedTab] = useState("recent");
  const [sellers, setSellers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSellers, setTotalSellers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const [loggedIn, setLoggedIn] = useState(true);
  const [loginChecked, setLoginChecked] = useState(false);

  const getLocalStorage = (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

  const token = getLocalStorage("token");

  useEffect(() => {
    handleCheckLogin();
  }, []);

  const handleCheckLogin = () => {
    if (!token) {
      setLoggedIn(false);
      router.push("/");
    } else {
      setLoggedIn(true);
    }
    setLoginChecked(true);
  };

  useEffect(() => {
    if (loginChecked && loggedIn) {
      dispatch(updatePageLoader(false));
      dispatch(updatePageNavigation("sellers"));
    }
  }, [dispatch, loginChecked, loggedIn]);

  useEffect(() => {
    if (loginChecked && loggedIn) {
      fetchSellers();
    }
  }, [currentPage, selectedTab, loginChecked, loggedIn]);

  const fetchSellers = async () => {
    if (!loggedIn) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (selectedTab === "recent") {
        params.append("active", "true");
      }

      const { data } = await axiosPrivate.get(`/seller-stores?${params}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      console.log("API Response:", data); // Debugging log

      setSellers(data.sellers);
      setTotalPages(data.totalPages);
      setTotalSellers(data.total);
      setItemsPerPage(data.limit);

      console.log("Current Page:", currentPage);
      console.log("Total Pages:", data.totalPages);
      console.log("Total Sellers:", data.total);
    } catch (error) {
      console.error("Failed to fetch sellers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = (value) => {
    if (!loggedIn) return;
    setSelectedTab(value);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  const handlePageChange = (pageNumber) => {
    if (!loggedIn) return;
    console.log("Changing to page:", pageNumber); // Debugging log
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
        pageNumbers.push(
          <PageButton
            key={totalPages}
            page={totalPages}
            currentPage={currentPage}
            onClick={() => handlePageChange(totalPages)}
          />
        );
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(
          <PageButton
            key={1}
            page={1}
            currentPage={currentPage}
            onClick={() => handlePageChange(1)}
          />
        );
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
        pageNumbers.push(
          <PageButton
            key={1}
            page={1}
            currentPage={currentPage}
            onClick={() => handlePageChange(1)}
          />
        );
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

  const fn_viewDetails = (id) => {
    if (!loggedIn) return;
    if (id === sellerId) {
      return setSellerId(0);
    }
    setSellerId(id);
  };

  if (isLoading) {
    return <Loading />;
  }


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
                    selectedTab === "recent"
                      ? "text-[var(--text-color)] border-[var(--text-color)]"
                      : "text-[var(--text-color-body)] border-transparent"
                  }`}
                  onClick={() => filterData("recent")}
                >
                  Recent
                </p>
                <p
                  className={`cursor-pointer hover:text-[var(--text-color)] font-[500] border-b-[2px] hover:border-[var(--text-color)] ${
                    selectedTab === "all"
                      ? "text-[var(--text-color)] border-[var(--text-color)]"
                      : "text-[var(--text-color-body)] border-transparent"
                  }`}
                  onClick={() => filterData("all")}
                >
                  All
                </p>
              </div>
              {isLoading ? (
                <p>Loading sellers...</p>
              ) : (
                <>
                  <table className="w-[850px] xl:w-[100%]">
                    <thead>
                      <tr className="font-[500] text-[var(--text-color-body)] text-[15px] h-[50px]">
                        <td>Seller Name</td>
                        <td>Email Address</td>
                        <td>Phone Number</td>
                        <td>Status</td>
                        <td className="w-[80px]">Action</td>
                      </tr>
                    </thead>
                    <tbody>
                      {sellers.map((item) => (
                        <tr key={item.id} className="h-[50px] text-[14px]">
                          <td className="flex items-center gap-1.5 h-[50px]">
                            <Image
                              alt=""
                              width={26}
                              height={26}
                              src={
                                item.profile?.image !== null
                                  ? item.profile?.image
                                  : electronicLED
                              }
                              className="h-[26px] w-[26px] rounded-[6px]"
                            />
                            {item.username}
                          </td>
                          <td>{item?.email}</td>
                          <td>{item?.profile?.phone}</td>
                          <td className="w-[130px]">
                            <p
                              className={cn(
                                "h-[23px] w-[60px] rounded-[5px] flex items-center font-[500]  justify-center text-[10px]",
                                item?.active
                                  ? "bg-[var(--bg-color-delivered)] text-[var(--text-color-delivered)]"
                                  : "bg-[var(--bg-color-pending)]  text-[var(--text-color-pending)]"
                              )}
                            >
                              {item?.active ? "Active" : "Pending"}
                            </p>
                          </td>
                          <td className="px-[17px] relative">
                            <Image
                              alt=""
                              src={tableAction}
                              className="cursor-pointer"
                              onClick={() => fn_viewDetails(item?.id)}
                            />
                            {sellerId === item?.id && <ViewDetails id={item.id} />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sellers.length > 0 && (
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
                        Page {currentPage} of {totalPages} | Total Sellers: {totalSellers}
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

const ViewDetails = ({ id }) => {
  const navigate = useRouter();
  const dispatch = useDispatch();
  return (
    <div className="absolute py-[10px] px-[10px] flex flex-col items-center text-[var(--text-color-body)] bg-white rounded-[8px] shadow-md border border-gray-100 w-[max-content] left-[-145px] top-[13px] cursor-pointer">
      <div
        className="flex items-center gap-2.5 w-full px-2 py-1.5 hover:bg-gray-100 rounded-sm"
        onClick={() => {
          dispatch(updatePageLoader(true));
          navigate.push(`/sellers/${id}`);
        }}
      >
        <IoEye className="w-[20px] h-[20px]" />
        <p className="text-[14px]">View Details</p>
      </div>
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

export default Sellers;