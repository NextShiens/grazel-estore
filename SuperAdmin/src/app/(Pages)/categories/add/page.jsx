"use client";
import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import SearchOnTop from "@/components/SearchOnTop";
import Loading from "@/components/loading";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { FaCamera } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { useRouter, useSearchParams } from "next/navigation";
import { axiosPrivate } from "@/axios";
import { toast } from "react-toastify";

const AddCategories = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const [categoryImage, setCategoryImage] = useState([]);
  const [categoryDetail, setCategoryDetail] = useState({});
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation("categories"));
  }, [dispatch]);

  function onRemoveCategoryImg() {
    setCategoryImage([]);
  }

  useEffect(() => {
    const getCategory = async () => {
      try {
        const { data } = await axiosPrivate.get(
          `/categories/details/${category}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        setCategoryDetail(data?.category);
        if (data?.category?.image) {
          setCategoryImage([data.category.image]);
        }
      } catch (error) {
        console.error("Error fetching category details:", error);
        toast.error("Failed to fetch category details");
      }
    };
    if (category) {
      getCategory();
    } else {
      setCategoryDetail({});
      setCategoryImage([]);
    }
  }, [category]);

  async function onCreate(formData) {
    if (!category && !categoryImage?.length) {
      setLoader(false);
      return toast.error("Please select an image");
    }
    try {
      const url = category ? `/categories/${category}` : "/categories";
      const method = category ? "PUT" : "POST";
      await axiosPrivate({
        url,
        method,
        data: formData,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data"
        },
      });
      const message = category
        ? "Category has been updated"
        : "Category has been created";
      toast.success(message);
      setLoader(false);
      router.push("/categories");
      dispatch(updatePageLoader(true));
    } catch (error) {
      console.error("Error creating/updating category:", error);
      toast.error("Something went wrong");
    } finally {
      setLoader(false);
    }
  }

  return (
    <Suspense fallback={<>Loading...</>}>
      <Loading />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[10px] sm:px-[22px]">
            <SearchOnTop showButton={true} navigateTo={"/categories/add"} />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                setLoader(true);
                onCreate(formData);
              }}
              className="mt-[20px] bg-white rounded-[8px] shadow-sm p-[30px]"
            >
              <p className="text-[20px] font-[600]">
                {category ? "Edit Category" : "Create New Category"}
              </p>
              <div className="flex flex-col gap-1 my-[15px]">
                <label className="text-[#777777]">Category Name</label>
                <input
                  placeholder="Category Name"
                  name="name"
                  required
                  defaultValue={categoryDetail?.name || ""}
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
              <div className="flex flex-col gap-1 my-[15px]">
                <label className="text-[#777777]">Slug</label>
                <input
                  placeholder="category-slug"
                  name="slug"
                  required
                  defaultValue={categoryDetail?.slug || ""}
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
              <div className="flex flex-col gap-1 my-[15px]">
                <label className="text-[#777777]">Description</label>
                <textarea
                  placeholder="Category Description"
                  name="description"
                  defaultValue={categoryDetail?.description || ""}
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] py-[10px] h-[100px] text-[15px]"
                />
              </div>
              <div className="my-[15px] ">
                <label className="text-[#777777]">Image Upload</label>
                <div className="flex gap-5 xl:flex-row">
                  <input
                    type="file"
                    id="uploadPic"
                    className="hidden"
                    name="image"
                    onChange={(e) => {
                      setCategoryImage([e.target.files[0]]);
                    }}
                  />
                  <div className="flex flex-col gap-2 mt-3">
                    <label
                      htmlFor="uploadPic"
                      className="min-w-[250px] cursor-pointer h-[180px] rounded-[10px] border-[2px] border-dashed border-blue-100 bg-[#F8F8FF] flex items-center justify-center flex-col"
                    >
                      <FaCamera className="h-[40px] w-[45px] text-[var(--text-color-body)] mb-4" />
                      <p className="font-[500] text-[13px] text-center">
                        Drag & drop files or{" "}
                        <span className="text-[var(--text-color)] hover:underline">
                          Browse
                        </span>
                      </p>
                      <p className="text-[11px] text-[var(--text-color-body)] text-center mt-1">
                        Supported formats: JPEG, PNG
                      </p>
                    </label>
                    <div className="flex flex-row gap-3">
                      {categoryImage?.map((item, index) => (
                        <div key={index} className="relative">
                          <Image
                            width={120}
                            height={120}
                            src={typeof item === 'string' ? item : URL.createObjectURL(item)}
                            alt=""
                          />
                          <span
                            onClick={() => onRemoveCategoryImg()}
                            className="absolute top-0 right-0 cursor-pointer"
                          >
                            <MdCancel
                              className="text-white bg-[var(--text-color)] rounded-full"
                              size={20}
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loader}
                className={`${loader ? "bg-red-300 cursor-not-allowed" : "bg-[#FE4242]"
                  } rounded-[8px] h-[40px] px-[40px] py-[10px] text-white text-[15px] font-[500] w-[max-content]`}
              >
                {loader ? "Loading..." : category ? "Save Changes" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default AddCategories;