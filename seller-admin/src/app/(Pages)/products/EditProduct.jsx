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
  const [formErrors, setFormErrors] = useState({});
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: product?.title || "",
    tags: product?.tags || "",
    description: product?.description || "",
    color: product?.color || "",
    category_id: product?.category_id || "",
    price: product?.price || "",
    discount: product?.discount || "",
  });

  useEffect(() => {
    dispatch(updatePageNavigation("products"));
  }, [dispatch]);

  useEffect(() => {
    const getAllCategories = async () => {
      const { data } = await axiosPrivate.get("/global/categories", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      !allCategories.length && setAllCategories(data?.categories);
    };
    getAllCategories();
  }, []);

  useEffect(() => {
    const getAllBrands = async () => {
      const { data } = await axiosPrivate.get("/global/brands", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      !allBrands.length && setAllBrands(data?.brands);
    };
    getAllBrands();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = "Product name is required";
    if (!formData.tags.trim()) errors.tags = "Tags are required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.color.trim()) errors.color = "Color is required";
    if (tags.length === 0) errors.variants = "At least one variant is required";
    if (!formData.category_id) errors.category_id = "Category is required";
    if (!formData.price) errors.price = "Price is required";
    if (!productImage.length)
      errors.featured_image = "Feature image is required";
    if (!galleryImage.length)
      errors.gallery_images = "At least one gallery image is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function onEditProduct(e) {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setPending(true);

      const formdata = new FormData(e.target);

      for (let key in galleryImage) {
        formdata.append("gallery_images", galleryImage[key]);
      }

      await axiosPrivate.put(`/vendor/products/${product?.id}`, formdata, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success("Product has been updated");
      setSelectedTab("manage");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setTimeout(() => {
        setPending(false);
      }, 1000);
    }
  }

  function onRemoveImg(index) {
    const tempArr = [...galleryImage];
    tempArr.splice(index, 1);
    setGalleryImage(tempArr);
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
            onSubmit={onEditProduct}
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
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className={`focus:outline-none border-[2px] ${
                    formErrors.title ? "border-red-500" : "border-gray-200"
                  } rounded-[8px] px-[15px] h-[50px] text-[15px]`}
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm">{formErrors.title}</p>
                )}
              </div>
              <div className="flex flex-col gap-1 my-[15px]">
                <label className="text-[#777777]">Tags</label>
                <input
                  placeholder="Tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  required
                  className={`focus:outline-none border-[2px] ${
                    formErrors.tags ? "border-red-500" : "border-gray-200"
                  } rounded-[8px] px-[15px] h-[50px] text-[15px]`}
                />
                {formErrors.tags && (
                  <p className="text-red-500 text-sm">{formErrors.tags}</p>
                )}
              </div>
              <div className="flex flex-col gap-1 my-[15px]">
                <label className="text-[#777777]">Description</label>
                <textarea
                  placeholder="Write about product"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className={`focus:outline-none border-[2px] ${
                    formErrors.description
                      ? "border-red-500"
                      : "border-gray-200"
                  } py-2 rounded-[8px] px-[15px] h-[110px] text-[15px]`}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm">
                    {formErrors.description}
                  </p>
                )}
              </div>
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
                  className={`focus:outline-none border-[2px] ${
                    formErrors.color ? "border-red-500" : "border-gray-200"
                  } rounded-[8px] px-[15px] h-[50px] text-[15px]`}
                />
                {formErrors.color && (
                  <p className="text-red-500 text-sm">{formErrors.color}</p>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Variants</label>
                <div
                  className={`ReactTags__tags ${
                    formErrors.variants ? "border-red-500" : ""
                  }`}
                >
                  <ReactTags
                    tags={tags}
                    handleDelete={handleDelete}
                    handleAddition={handleAddition}
                    delimiters={[188, 13]}
                  />
                </div>
                {formErrors.variants && (
                  <p className="text-red-500 text-sm">{formErrors.variants}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-10 my-[15px]">
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Category</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className={`focus:outline-none border-[2px] ${
                    formErrors.category_id
                      ? "border-red-500"
                      : "border-gray-200"
                  } rounded-[8px] px-[15px] h-[50px] text-[15px] text-[var(--text-color-body)]`}
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  {allCategories?.map((item) => (
                    <option key={item?.id} value={item?.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {formErrors.category_id && (
                  <p className="text-red-500 text-sm">
                    {formErrors.category_id}
                  </p>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Brand</label>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleInputChange}
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px] text-[var(--text-color-body)]"
                >
                  <option value="" disabled>
                    Select an option
                  </option>
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
                  className={`focus:outline-none border-[2px] ${
                    formErrors.price ? "border-red-500" : "border-gray-200"
                  } rounded-[8px] px-[15px] h-[50px] text-[15px]`}
                />
                {formErrors.price && (
                  <p className="text-red-500 text-sm">{formErrors.price}</p>
                )}
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
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-10 my-[15px]">
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
                  {formErrors.featured_image && (
                    <p className="text-red-500 text-sm">
                      {formErrors.featured_image}
                    </p>
                  )}
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
                        setGalleryImage([...galleryImage, ...filesArray]);
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

                      <div className="flex flex-row gap-3">
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
                  {formErrors.gallery_images && (
                    <p className="text-red-500 text-sm">
                      {formErrors.gallery_images}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-10 pb-8">
              <button
                type="submit"
                disabled={isPending}
                className="h-[50px] rounded-[8px] bg-[#FE4242]  text-white font-[500] w-[200px] mt-10 disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none"
              >
                <div className="w-full h-full flex items-center justify-center">
                  {isPending ? (
                    <LuLoader2 className="animate-spin" />
                  ) : (
                    "Update Product"
                  )}
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
