"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { updatePageNavigation } from "../../../features/features";
import { WithContext as ReactTags } from "react-tag-input";
import { FaCamera } from "react-icons/fa6";
import { toast } from "react-toastify";
import { MdCancel } from "react-icons/md";
import Image from "next/image";
import { axiosPrivate } from "../../../axios/index";
import { LuLoader2 } from "react-icons/lu";

const EditProduct = ({ product }) => {
  const [isPending, setPending] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [productImage, setProductImage] = useState([]);
  const [galleryImage, setGalleryImage] = useState([]);
  const [tags, setTags] = useState(
    (product?.tags?.split(',') || []).map(tag => ({ id: tag, text: tag }))
  );
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    color: product?.color || '',
    category_id: product?.category_id || '',
    brand_id: product?.brand_id || '',
    price: product?.price || '',
    discount: product?.discount || '',
  });

  const dispatch = useDispatch();
  const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://api.grazle.co.in/api";

  useEffect(() => {
    dispatch(updatePageNavigation("products"));
    fetchCategories();
    fetchBrands();
  }, [dispatch]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axiosPrivate.get("/global/categories", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      setAllCategories(data?.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const { data } = await axiosPrivate.get("/global/brands", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      setAllBrands(data?.brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setPending(true);
      const formDataToSend = new FormData();

      // Append form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append tags
      formDataToSend.append('tags', tags.map(tag => tag.text).join(','));

      // Append images
      if (productImage.length) {
        formDataToSend.append('featured_image', productImage[0]);
      }
      galleryImage.forEach((image, index) => {
        formDataToSend.append(`gallery_images[${index}]`, image);
      });

      await axiosPrivate.put(`/vendor/products/${product?.id}`, formDataToSend, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success("Product has been updated");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Something went wrong");
    } finally {
      setPending(false);
    }
  };

  const onRemoveImg = (index) => {
    setGalleryImage(prev => prev.filter((_, i) => i !== index));
  };

  const onRemoveFeatureImg = () => {
    setProductImage([]);
  };

  const handleDelete = (i) => {
    setTags(tags.filter((_, index) => index !== i));
  };

  const handleAddition = (tag) => {
    setTags([...tags, tag]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 flex">
        <div className="flex-1 mt-[30px] px-[22px]">
          <form onSubmit={handleSubmit} className="bg-white rounded-[8px] shadow-sm px-[20px] py-[25px]">
            <p className="text-[20px] font-[600]">Edit Product</p>
            <p className="text-[18px] font-[600] pt-[20px]">General Information</p>
            
            <div className="flex flex-col gap-1 my-[15px]">
              <label className="text-[#777777]">Name</label>
              <input
                placeholder="Product Name"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
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
                delimiters={[188, 13]}
                inputFieldPosition="top"
                autocomplete
              />
            </div>

            <div className="flex flex-col gap-1 my-[15px]">
              <label className="text-[#777777]">Description</label>
              <textarea
                placeholder="Write about product"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="focus:outline-none border-[2px] border-gray-200 py-2 rounded-[8px] px-[15px] h-[110px] text-[15px]"
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-3 lg:gap-10 my-[15px]">
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Color</label>
                <input
                  placeholder="Color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Category</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
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
            </div>

            <div className="flex flex-col lg:flex-row gap-3 lg:gap-10 my-[15px]">
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Brand</label>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleInputChange}
                  required
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
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Discount</label>
                <input
                  placeholder="%"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
            </div>

            <p className="text-[18px] font-[600] pt-[20px]">Images</p>
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-10 my-[15px]">
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Feature Image</label>
                <input
                  type="file"
                  id="uploadPic"
                  className="hidden"
                  onChange={(e) => setProductImage([e.target.files[0]])}
                />
                <label
                  htmlFor="uploadPic"
                  className="cursor-pointer h-[180px] rounded-[10px] border-[2px] border-dashed border-blue-100 bg-[#F8F8FF] flex items-center justify-center flex-col"
                >
                  <FaCamera className="h-[40px] w-[45px] text-[var(--text-color-body)] mb-4" />
                  <p className="font-[500] text-[13px] text-center">
                    Drag & drop files or Browse
                  </p>
                  <p className="text-[11px] text-[var(--text-color-body)] text-center mt-1">
                    Supported formats: JPEG, PNG
                  </p>
                </label>
                {productImage.length > 0 && (
                  <div className="mt-2 relative inline-block">
                    <Image
                      width={120}
                      height={120}
                      src={URL.createObjectURL(productImage[0])}
                      alt="Feature Image"
                    />
                    <button
                      type="button"
                      onClick={onRemoveFeatureImg}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <MdCancel size={20} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Gallery Images</label>
                <input
                  type="file"
                  id="uploadGalleryPic"
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    const filesArray = Array.from(e.target.files);
                    setGalleryImage(prev => [...prev, ...filesArray]);
                  }}
                />
                <label
                  htmlFor="uploadGalleryPic"
                  className="cursor-pointer h-[180px] rounded-[10px] border-[2px] border-dashed border-blue-100 bg-[#F8F8FF] flex items-center justify-center flex-col"
                >
                  <FaCamera className="h-[40px] w-[45px] text-[var(--text-color-body)] mb-4" />
                  <p className="font-[500] text-[13px] text-center">
                    Drag & drop files or Browse
                  </p>
                  <p className="text-[11px] text-[var(--text-color-body)] text-center mt-1">
                    Supported formats: JPEG, PNG
                  </p>
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {galleryImage.map((image, index) => (
                    <div key={index} className="relative inline-block">
                      <Image
                        width={120}
                        height={120}
                        src={URL.createObjectURL(image)}
                        alt={`Gallery Image ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveImg(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        <MdCancel size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="h-[50px] rounded-[8px] bg-[#FE4242] text-white font-[500] w-[200px] mt-10 disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none"
            >
              <div className="w-full h-full flex items-center justify-center">
                {isPending ? <LuLoader2 className="animate-spin" /> : "Update Product"}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;