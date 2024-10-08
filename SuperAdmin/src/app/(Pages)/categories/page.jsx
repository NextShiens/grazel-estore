"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import SearchOnTop from "@/components/SearchOnTop";
import Loading from "@/components/loading";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { updatePageLoader, updatePageNavigation } from "@/features/features";

import editButton from "@/assets/svgs/edit-button.svg";
import deleteButton from "@/assets/svgs/delete-button.svg";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { axiosPrivate } from "@/axios";
import Link from "next/link";
import { toast } from "react-toastify";

import img from "@/assets/dashboard-product-1.png";

const Categories = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [selectedCategory, setSelectedCategpry] = useState(0);
  const [allCategories, setAllCategories] = useState([]);
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
    if (loggedIn && loginChecked) {
      dispatch(updatePageLoader(false));
      dispatch(updatePageNavigation("categories"));

      const getAllCategories = async () => {
        try {
          const { data } = await axiosPrivate.get("/categories", {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          });
          setAllCategories(data?.categories);
        } catch (error) {
          console.error("Error fetching categories:", error);
          toast.error("Failed to fetch categories");
        }
      };

      getAllCategories();
    }
  }, [loggedIn, loginChecked, dispatch]);

  const fn_controlCategory = (id) => {
    if (!loggedIn) return;
    if (id === selectedCategory) {
      return setSelectedCategpry(0);
    }
    return setSelectedCategpry(id);
  };

  async function onDelete(id) {
    if (!loggedIn) return;
    try {
      const category = [...allCategories];
      const filterCat = category.filter((item) => item.id !== id);
      await axiosPrivate.delete(`/categories/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setAllCategories(filterCat);
      return toast.success("Category Deleted");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  }

  if (!loggedIn) {
    return null; // Render nothing if not logged in
  }
  return (
    <>
      <Loading />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[10px] sm:px-[22px]">
            <SearchOnTop showButton={true} navigateTo={"/categories/add"} />
            {allCategories?.map((item) => (
              <div
                key={item.id}
                className="mt-[20px] bg-white rounded-[8px] shadow-sm p-[30px]"
              >
                <div className="border-1 border-gray-200 rounded-[15px] p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-[100px] w-[100px] bg-gray-100 rounded-full">
                        {item.image && (
                          <Image
                            src={item?.image}
                            width={100}
                            height={100}
                            className="rounded-full"
                          />
                        )}
                      </div>
                      <p className="font-[600] text-[22px]">{item?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href={`/categories/add?category=${item.id}`}>
                        <Image src={editButton} className="cursor-pointer" />
                      </Link>
                      <Image
                        src={deleteButton}
                        className="cursor-pointer"
                        onClick={() => onDelete(item.id)}
                      />
                      {selectedCategory === 1 ? (
                        <IoIosArrowUp
                          className="text-gray-400 text-[24px] cursor-pointer"
                          onClick={() => fn_controlCategory(item.id)}
                        />
                      ) : (
                        <IoIosArrowDown
                          className="text-gray-400 text-[24px] cursor-pointer"
                          onClick={() => fn_controlCategory(item.id)}
                        />
                      )}
                    </div>
                  </div>
                  {selectedCategory === item?.id && (
                    <div className="border-t border-gray-200 mt-4 flex flex-col gap-3 text-gray-400 pt-4">
                      <p className="text-[19px]">
                        <span className="font-bold">Slug:</span> {item?.slug}
                      </p>
                      <p className="text-[19px]">
                        <span className="font-bold">Active:</span> {item?.active ? 'Yes' : 'No'}
                      </p>
                      <p className="text-[19px]">
                        <span className="font-bold">Description:</span> {item?.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Categories;
