"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePageNavigation } from "../../../features/features";
import { WithContext as ReactTags } from "react-tag-input";

import Navbar from "../../../components/navbar";
import Sidebar from "../../../components/sidebar";

import { FaCamera } from "react-icons/fa6";
import { toast } from "react-toastify";

import { MdCancel } from "react-icons/md";
import Image from "next/image";
import { axiosPrivate } from "../../../axios/index";
import { LuLoader2 } from "react-icons/lu";

const EditProduct = ({ product, setSelectedTab }) => {
  const [isPending, setPending] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [productImage, setProductImage] = useState([]);
  const [galleryImage, setGalleryImage] = useState([]);
  const [tags, setTags] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updatePageNavigation("products"));
  }, [dispatch]);

  useEffect(() => {
    const getAllCategories = async () => {
      try {
        const { data } = await axiosPrivate.get("/global/categories", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        if (data?.categories && !allCategories.length) {
          setAllCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories");
      }
    };
    getAllCategories();
  }, []);

  useEffect(() => {
    const getAllBrands = async () => {
      try {
        const { data } = await axiosPrivate.get("/global/brands", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        if (data?.brands && !allBrands.length) {
          setAllBrands(data.brands);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
        toast.error("Failed to fetch brands");
      }
    };
    getAllBrands();
  }, []);

  async function onEditProduct(formData) {
    try {
      setPending(true);

      // Append gallery images to formData
      // galleryImage.forEach((image, index) => {
      //   formData.append(`gallery_images[${index}]`, image);
      // });

      // Append featured image if it exists
      if (productImage.length > 0) {
        formData.append("featured_image", productImage[0]);
      }

      // Append tags
      formData.append("tags", JSON.stringify(tags.map(tag => tag.text)));

      const response = await axiosPrivate.put(`/vendor/products/${product?.id}`, formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Product has been updated successfully");
        setSelectedTab('manage');
      } else {
        throw new Error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setPending(false);
    }
  }

  function onRemoveImg(index) {
    setGalleryImage(prevImages => prevImages.filter((_, i) => i !== index));
  }

  function onRemoveFeatureImg() {
    setProductImage([]);
  }

  const handleDelete = (i) => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddition = (tag) => {
    setTags([...tags, tag]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 flex">
        <div className="flex-1 mt-[30px] px-[22px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              onEditProduct(formData);
            }}
            className="bg-white rounded-[8px] shadow-sm px-[20px] py-[25px]"
          >
            <p className="text-[20px] font-[600]">Edit Product</p>
            <p className="text-[18px] font-[600] pt-[20px]">
              General Information
            </p>
            <div>
              <div className="flex flex-col gap-1 my-[15px]">
                <label className="text-[#777777]">Name</label>
                <input
                  placeholder="Product Name"
                  name="title"
                  defaultValue={product?.title}
                  required
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
              <div className="flex flex-col gap-1 my-[15px]">
                <label className="text-[#777777]">Tags</label>
                <ReactTags
                  tags={tags}
                  handleDelete={handleDelete}
                  handleAddition={handleAddition}
                  delimiters={[188, 13]} // Comma and Enter keys
                  placeholder="Add tags"
                  classNames={{
                    tags: 'focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] min-h-[50px] text-[15px]',
                    tagInput: 'inline-block',
                    tagInputField: 'focus:outline-none text-[15px]',
                    selected: 'inline',
                    tag: 'inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2',
                    remove: 'ml-2 text-gray-500 hover:text-gray-700 cursor-pointer',
                  }}
                />
              </div>
              <div className="flex flex-col gap-1 my-[15px]">
                <label className="text-[#777777]">Description</label>
                <textarea
                  placeholder="Write about product"
                  name="description"
                  defaultValue={product?.description}
                  required
                  className="focus:outline-none border-[2px] border-gray-200 py-2 rounded-[8px] px-[15px] h-[110px] text-[15px]"
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-3 lg:gap-10 my-[15px]">
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Color</label>
                <input
                  placeholder="Color"
                  name="color"
                  defaultValue={product?.color}
                  required
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Variants</label>
                <input
                  placeholder="Variants (comma-separated)"
                  name="variants"
                  defaultValue={product?.variants?.join(', ')}
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-10 my-[15px]">
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Category</label>
                <select
                  name="category_id"
                  defaultValue={product?.category_id}
                  required
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px] text-[var(--text-color-body)]"
                >
                  <option value="" disabled>Select an option</option>
                  {allCategories?.map((item) => (
                    <option key={item?.id} value={item?.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Brand</label>
                <select
                  name="brand_id"
                  defaultValue={product?.brand_id}
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px] text-[var(--text-color-body)]"
                >
                  <option value="" disabled>Select an option</option>
                  {allBrands?.map((item) => (
                    <option key={item?.id} value={item?.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[18px] font-[600] pt-[20px]">Pricing</p>
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-10 my-[15px]">
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Price</label>
                <input
                  placeholder="₹"
                  defaultValue={product?.price}
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Discount</label>
                <input
                  placeholder="%"
                  defaultValue={product?.discount}
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
            </div>
            {/* <div className="flex flex-col lg:flex-row gap-3 lg:gap-10 my-[15px]">
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <p className="text-[18px] font-[600] pt-[20px]">
                  Feature Image
                </p>
                <div className="my-[15px] ">
                  <label className="text-[#777777]">Feature Image</label>
                  <div className="flex gap-5  my-[15px]  xl:flex-row">
                    <input
                      type="file"
                      id="uploadPic"
                      className="hidden"
                      name="featured_image"
                      onChange={(e) => {
                        setProductImage([e.target.files[0]]);
                      }}
                    />
                    <div className="flex flex-col gap-2 mt-3">
                      <label
                        htmlFor="uploadPic"
                        className="min-w-[230px] cursor-pointer h-[180px] rounded-[10px] border-[2px] border-dashed border-blue-100 bg-[#F8F8FF] flex items-center justify-center flex-col"
                      >
                        <FaCamera className="h-[40px] w-[45px] text-[var(--text-color-body)] mb-4" />
                        <p className="font-[500] text-[13px] text-center">
                          Drag & drop files or Browse
                        </p>
                        <p className="text-[11px] text-[var(--text-color-body)] text-center mt-1">
                          Supported formats: JPEG, PNG
                        </p>
                      </label>
                      <div className="flex flex-row gap-3">
                        {productImage?.map((item, index) => (
                          <div key={index} className="relative">
                            <Image
                              width={120}
                              height={120}
                              src={URL?.createObjectURL(item)}
                              alt=""
                            />
                            <span
                              onClick={() => onRemoveFeatureImg(index)}
                              className="absolute top-0 right-0 cursor-pointer"
                            >
                              <MdCancel className="text-white" size={20} />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <p className="text-[18px] font-[600] pt-[20px]">
                  Gallery Images
                </p>
                <div className="my-[15px]">
                  <label className="text-[#777777]">Gallery Image</label>
                  <div className="flex gap-5 justify-between my-[15px] flex-col xl:flex-row">
                    <input
                      type="file"
                      id="uploadGalleryPic"
                      className="hidden"
                      multiple
                      onChange={(e) => {
                        const filesArray = Array.from(e.target.files);
                        setGalleryImage(prevImages => [...prevImages, ...filesArray]);
                      }}
                    />
                    <div className="flex flex-col gap-2 mt-3">
                      <label
                        htmlFor="uploadGalleryPic"
                        className="min-w-[230px] cursor-pointer h-[180px] rounded-[10px] border-[2px] border-dashed border-blue-100 bg-[#F8F8FF] flex items-center justify-center flex-col"
                      >
                        <FaCamera className="h-[40px] w-[45px] text-[var(--text-color-body)] mb-4" />
                        <p className="font-[500] text-[13px] text-center">
                          Drag & drop files or Browse
                        </p>
                        <p className="text-[11px] text-[var(--text-color-body)] text-center mt-1">
                          Supported formats: JPEG, PNG
                        </p>
                      </label>

                      <div className="flex flex-row gap-3 flex-wrap">
                        {galleryImage?.map((item, index) => (
                          <div key={index} className="relative">
                            <Image
                              width={120}
                              height={120}
                              src={URL.createObjectURL(item)}
                              alt=""
                            />
                            <span
                              onClick={() => onRemoveImg(index)}
                              className="absolute top-0 right-0 cursor-pointer"
                            >
                              <MdCancel className="text-white" size={20} />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

            <div className="flex flex-col gap-10 pb-8">
              <button
                type="submit"
                disabled={isPending}
                className="h-[50px] rounded-[8px] bg-[#FE4242] text-white font-[500] w-[200px] mt-10 disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none"
              >
                <div className="w-full h-full flex items-center justify-center">
                  {isPending ? <LuLoader2 className="animate-spin" /> : "Update Product"}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;