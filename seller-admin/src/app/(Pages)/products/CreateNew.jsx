"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePageNavigation } from "../../../features/features";

import { FaCamera } from "react-icons/fa6";
import { toast } from "react-toastify";
import { WithContext as ReactTags } from "react-tag-input";
import { MdCancel, MdDelete } from "react-icons/md";
import Image from "next/image";
import { axiosPrivate } from "../../../axios/index";
import { LuLoader2 } from "react-icons/lu";

const AddProduct = ({ setSelectedTab }) => {
  const [isPending, setPending] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [productImage, setProductImage] = useState([]);
  const [galleryImage, setGalleryImage] = useState([]);
  const [tags, setTags] = useState([]);
  const [variants, setVariants] = useState([]);
  const dispatch = useDispatch();
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [title, setTitle] = useState("");
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
      formData.append("category_id", e.target.category_id.value);
      formData.append("brand_id", randomId);
      formData.append("title", e.target.title.value);
      formData.append("price", e.target.price.value);
      formData.append("featured_image", productImage[0]);

      for (let key in galleryImage) {
        formData.append("gallery_images", galleryImage[key]);
      }

      formData.append("description", e.target.description.value);
      formData.append("tags", e.target.tags.value);
      formData.append("size", e.target.size.value);
      formData.append("color", e.target.color.value);
      formData.append("discount", e.target.discount.value);
      formData.append("product_info", e.target.product_info.value);

      faqs.forEach((faq, i) => {
        formData.append(`answers[${i}]`, faq.answer);
        formData.append(`questions[${i}]`, faq.question);
      });

      variants.forEach((variant, i) => {
        formData.append(`variants[${i}][price]`, variant.price);
        formData.append(`variants[${i}][variant]`, variant.variant);
      });

      const { data } = await axiosPrivate.post("/vendor/products", formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
      if (data.success) {
        toast.success("Product has been created");
        setSelectedTab("manage");
      } else {
        if (data.message.includes("Your store profile is under review")) {
          toast.error("Your store profile is under review by our administrator. We appreciate your patience and will notify you once the approval process is complete. Thank you for your understanding.");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
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
      <div className="flex-1 flex">
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
                  <div className="ReactTags__tags">
                    <ReactTags
                      tags={tags}
                      handleDelete={handleDelete}
                      handleAddition={handleAddition}
                      delimiters={[188, 13]}
                    />
                  </div>
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
                      <li key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                        <div>
                          <p className="font-semibold">{faq.question}</p>
                          <p className="text-gray-600">{faq.answer}</p>
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
              <h2 className="text-[20px] font-[600] mb-[15px]">Category and Brand</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Category</label>
                  <select
                    name="category_id"
                    required
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px] text-[var(--text-color-body)]"
                  >
                    <option selected disabled>Select an option</option>
                    {allCategories?.map((item) => (
                      <option key={item?.id} value={item?.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Brand</label>
                  <select
                    name="brand_id"
                    required
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px] text-[var(--text-color-body)]"
                  >
                    <option selected disabled>Select an option</option>
                    {allBrands?.map((item) => (
                      <option key={item?.id} value={item?.id || randomId}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="mb-[30px]">
              <h2 className="text-[20px] font-[600] mb-[15px]">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Price</label>
                  <input
                    placeholder="₹"
                    name="price"
                    required
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Discount</label>
                  <input
                    placeholder="%"
                    name="discount"
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
              </div>
            </section>

            <section className="mb-[30px]">
              <h2 className="text-[20px] font-[600] mb-[15px]">Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Feature Image</label>
                  <div className="flex gap-5 my-[15px] flex-col xl:flex-row">
                    <input
                      type="file"
                      id="uploadPic"
                      className="hidden"
                      name="featured_image"
                      required
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (isFileSizeValid(file)) {
                          setProductImage([file]);
                        } else {
                          toast.error("Image size should not exceed 1 MB");
                        }
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
                              src={URL.createObjectURL(item)}
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
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Gallery Images</label>
                  <div className="flex gap-5 justify-between my-[15px] flex-col xl:flex-row">
                    <input
                      type="file"
                      id="uploadGalleryPic"
                      className="hidden"
                      multiple
                      onChange={(e) => {
                        const filesArray = Array.from(e.target.files);
                        const validFiles = filesArray.filter(file => isFileSizeValid(file));
                        if (validFiles.length !== filesArray.length) {
                          toast.error("Some images were not added as they exceed 1 MB size limit");
                        }
                        setGalleryImage([...galleryImage, ...validFiles]);
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
            </section>

            <section className="mb-[30px]">
              <h2 className="text-[20px] font-[600] mb-[15px]">Additional Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Size</label>
                  <input
                    placeholder="Size (e.g., XS, S, M, L, XL, XXL)"
                    name="size"
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#777777]">Color</label>
                  <input
                    placeholder="Color"
                    name="color"
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={isPending}
                className="h-[50px] rounded-[8px] bg-[#FE4242] flex items-center justify-center text-white font-[500] w-full sm:w-[200px] disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none transition-colors hover:bg-[#E63B3B]"
              >
                {isPending ? (
                  <LuLoader2
                    size={20}
                    className="animate-spin"
                    color={"white"}
                  />
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;