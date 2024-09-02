"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePageNavigation } from "@/features/features";

import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

import { FaCamera } from "react-icons/fa6";
import { toast } from "react-toastify";
import { WithContext as ReactTags } from "react-tag-input";
import { MdCancel, MdDelete } from "react-icons/md";
import Image from "next/image";
import { axiosPrivate } from "@/axios";
import { LuLoader2 } from "react-icons/lu";

const Products = () => {
  const [isPending, setPending] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [productImage, setProductImage] = useState([]);
  const [galleryImage, setGalleryImage] = useState([]);
  const [tags, setTags] = useState([]);
  const [variants, setVariants] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [title, setTitle] = useState("");
  const [dimensions, setDimensions] = useState({
    length: "",
    width: "",
    height: "",
    weight: "",
  });
  const dispatch = useDispatch();

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
      try {
        const { data } = await axiosPrivate.get("/global/brands", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        if (data && !allBrands.length) {
          setAllBrands(data?.brands);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    getAllBrands();
  }, []);

  const MAX_FILE_SIZE = 1 * 1024 * 1024;

  const isFileSizeValid = (file) => {
    return file.size <= MAX_FILE_SIZE;
  };

  const randomId = Math.floor(Math.random() * 1000);

  async function onAddProduct(e) {
    e.preventDefault();
    try {
      setPending(true);

      const formData = new FormData();
      formData.append("category_id", e.target?.category_id.value);
      formData.append("brand_id", randomId);
      formData.append("title", e.target.title?.value);
      formData.append("price", e.target.price?.value);
      formData.append("featured_image", productImage[0]);

      for (let key in galleryImage) {
        formData.append("gallery_images", galleryImage[key]);
      }

      formData.append("description", e.target.description?.value);
      formData.append("tags", e.target.tags?.value);
      formData.append("size", e.target.size?.value);
      formData.append("color", e.target.color?.value);
      formData.append("discount", e.target.discount?.value);
      formData.append("product_info", e.target.product_info?.value);

      faqs.forEach((faq, i) => {
        formData.append(`answers[${i}]`, faq.answer);
        formData.append(`questions[${i}]`, faq.question);
      });

      variants.forEach((variant, i) => {
        formData.append(`variants[${i}][price]`, variant.price);
        formData.append(`variants[${i}][variant]`, variant.variant);
      });

      Object.entries(dimensions).forEach(([key, value]) => {
        formData.append(`dimensions[${key}]`, value);
      });

      // Log the FormData object
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const { data } = await axiosPrivate.post("/admin/products", formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
      if (data.success) {
        toast.success("Product has been created");
        // Reset form fields
        e.target.reset();
        // Reset all states
        setDimensions({
          length: "",
          width: "",
          height: "",
          weight: "",
        });
        setProductImage([]);
        setGalleryImage([]);
        setTags([]);
        setVariants([]);
        setFaqs([]);
        setQuestion("");
        setAnswer("");
        setTitle("");

      } else {
        if (data.message.includes("Your store profile is under review")) {
          toast.error("Your store profile is under review by our administrator. We appreciate your patience and will notify you once the approval process is complete. Thank you for your understanding.");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Something went wrong", error);
    } finally {
      setPending(false);
    }
  }

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setDimensions(prev => ({ ...prev, [name]: value }));
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    const wordCount = newTitle.trim().split(/\s+/).length;

    if (wordCount <= 6) {
      setTitle(newTitle);
    } else {
      toast.error("Title should not exceed 6 words");
    }
  };

  function onRemoveImg(index) {
    const tempArr = [...galleryImage];
    tempArr.splice(index, 1);
    setGalleryImage(tempArr);
  }

  function onRemoveFeatureImg() {
    setProductImage([]);
  }

  const handleDelete = (i) => {
    const newTags = tags.slice(0);
    newTags.splice(i, 1);
    setTags(newTags);

    const newVariants = variants.slice(0);
    newVariants.splice(i, 1);
    setVariants(newVariants);
  };

  const handleAddition = (tag) => {
    const variant = prompt("Enter price for this variant:", "");
    if (variant !== null && variant !== "") {
      const newTags = [...tags, tag];
      setTags(newTags);

      const newVariants = [...variants, { variant: tag.text, price: variant }];
      setVariants(newVariants);
    }
  };

  const handleAddFaq = () => {
    if (question !== "" && answer !== "") {
      const newFaqs = [...faqs, { question, answer }];
      setFaqs(newFaqs);
      setQuestion("");
      setAnswer("");
    }
  };

  const handleRemoveFaq = (index) => {
    const newFaqs = faqs.filter((_, i) => i !== index);
    setFaqs(newFaqs);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 mt-[30px] px-[22px]">
          <form
            onSubmit={onAddProduct}
            className="bg-white rounded-[8px] shadow-sm px-[20px] py-[25px]"
          >
            <h1 className="text-[24px] font-[600] mb-[20px]">Create New Product</h1>

            <section className="mb-[30px]">
              <h2 className="text-[20px] font-[600] mb-[15px]">General Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Name</label>
                  <input
                    placeholder="Product Name"
                    name="title"
                    required
                    value={title}
                    onChange={handleTitleChange}
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Tags</label>
                  <input
                    placeholder="Tags"
                    name="tags"
                    required
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-4">
                <label className="text-[#777777]">Description</label>
                <textarea
                  placeholder="Write about product"
                  name="description"
                  required
                  className="focus:outline-none border-[2px] border-gray-200 py-2 rounded-[8px] px-[15px] h-[110px] text-[15px]"
                />
              </div>
            </section>

            <section className="mb-[30px]">
              <h2 className="text-[20px] font-[600] mb-[15px]">Product Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Product Info</label>
                  <input
                    placeholder="Product Info"
                    name="product_info"
                    required
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Variants</label>
                  <div className="ReactTags__tags flex justify-center items-center">
                    <ReactTags
                      tags={tags}
                      handleDelete={handleDelete}
                      handleAddition={handleAddition}
                      delimiters={[188, 13]}
                      classNames={{
                        tags: "focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px] w-full max-w-[600px]", // Increase width and set max width
                        tagInput: "focus:outline-none border-none",
                        tagInputField: "focus:outline-none border-none",
                        selected: "focus:outline-none border-none",
                        tag: "focus:outline-none border-none flex items-center",
                        remove: "focus:outline-none border-none ml-2 cursor-pointer",
                      }}
                      renderTag={(props) => (
                        <span className="tag flex items-center">
                          {props.tag.text}
                          <span className="remove ml-2 cursor-pointer" onClick={props.onDelete}>
                            &#x2715; {/* Cross icon */}
                          </span>
                        </span>
                      )}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-[30px]">
              <h2 className="text-[20px] font-[600] mb-[15px]">Dimensions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Length (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Length"
                    name="length"
                    value={dimensions.length}
                    onChange={handleDimensionChange}
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Width (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Width"
                    name="width"
                    value={dimensions.width}
                    onChange={handleDimensionChange}
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Height"
                    name="height"
                    value={dimensions.height}
                    onChange={handleDimensionChange}
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Weight"
                    name="weight"
                    value={dimensions.weight}
                    onChange={handleDimensionChange}
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
              </div>
            </section>

            <section className="mb-[30px]">
              <h2 className="text-[20px] font-[600] mb-[15px]">FAQs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Question</label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter FAQ question"
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Answer</label>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter FAQ answer"
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddFaq}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add FAQ
              </button>

              {faqs.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-[18px] font-[600] mb-2">Added FAQs:</h3>
                  <ul className="space-y-2">
                    {faqs.map((faq, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                        <div>
                          <p className="font-semibold">{faq.question}</p>
                          <p>{faq.answer}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <MdDelete size={20} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="mb-[30px]">
              <h2 className="text-[20px] font-[600] mb-[15px]">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Price</label>
                  <input
                    placeholder="Price"
                    name="price"
                    type="number"
                    required
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Discount</label>
                  <input
                    placeholder="Discount"
                    name="discount"
                    type="number"
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Size</label>
                  <input
                    placeholder="Size"
                    name="size"
                    required
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
              </div>
            </section>

            <section className="mb-[30px]">
              <h2 className="text-[20px] font-[600] mb-[15px]">Category & Brand</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Category</label>
                  <select
                    name="category_id"
                    required
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  >
                    <option value="">Select Category</option>
                    {allCategories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Brand</label>
                  <select
                    name="brand_id"

                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  >
                    <option value="">Select Brand</option>
                    {allBrands?.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="mb-[30px]">
              <h2 className="text-[20px] font-[600] mb-[15px]">Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Featured Image</label>
                  <div className="relative w-full h-[200px] border-[2px] border-dashed border-gray-300 rounded-[8px] flex items-center justify-center">
                    {productImage.length > 0 ? (
                      <>
                        <Image
                          src={URL.createObjectURL(productImage[0])}
                          alt="Featured"
                          layout="fill"
                          objectFit="cover"
                          className="rounded-[8px]"
                        />
                        <button
                          type="button"
                          onClick={onRemoveFeatureImg}
                          className="absolute top-2 right-2 bg-white rounded-full p-1"
                        >
                          <MdCancel size={24} className="text-red-500" />
                        </button>
                      </>
                    ) : (
                      <label htmlFor="featured_image" className="cursor-pointer">
                        <FaCamera size={40} className="text-gray-400" />
                        <input
                          type="file"
                          id="featured_image"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file && isFileSizeValid(file)) {
                              setProductImage([file]);
                            } else {
                              toast.error("File size should be less than 1MB");
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Gallery Images</label>
                  <div className="grid grid-cols-3 gap-2">
                    {galleryImage.map((image, index) => (
                      <div key={index} className="relative h-[100px]">
                        <Image
                          src={URL.createObjectURL(image)}
                          alt={`Gallery ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-[8px]"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveImg(index)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1"
                        >
                          <MdCancel size={20} className="text-red-500" />
                        </button>
                      </div>
                    ))}
                    {galleryImage.length < 5 && (
                      <label
                        htmlFor="gallery_images"
                        className="border-[2px] border-dashed border-gray-300 rounded-[8px] flex items-center justify-center h-[100px] cursor-pointer"
                      >
                        <FaCamera size={24} className="text-gray-400" />
                        <input
                          type="file"
                          id="gallery_images"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            const validFiles = files.filter(isFileSizeValid);
                            if (validFiles.length === files.length) {
                              setGalleryImage((prev) => [...prev, ...validFiles]);
                            } else {
                              toast.error("Some files exceed the 1MB limit");
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isPending}
              className="h-[50px] rounded-[8px] bg-[#FE4242] flex items-center justify-center text-white font-[500] w-full sm:w-[200px] disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none transition-colors hover:bg-[#E63B3B]"
            >
              {isPending ? (
                <LuLoader2 className="animate-spin" size={24} />
              ) : (
                "Add Product"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Products;