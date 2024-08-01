"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePageNavigation } from "../../../features/features";

import { FaCamera } from "react-icons/fa6";
import { toast } from "react-toastify";
import { WithContext as ReactTags } from "react-tag-input";
import { MdCancel } from "react-icons/md";
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
const randomId =  Math.floor(Math.random() * 1000);
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
      toast.success("Product has been created");
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 flex">
        <div className="flex-1 mt-[30px] px-[22px]">
          <form
            onSubmit={onAddProduct}
            className="bg-white rounded-[8px] shadow-sm px-[20px] py-[25px]"
          >
            <p className="text-[20px] font-[600]">Create New Product</p>
            <p className="text-[18px] font-[600] pt-[20px]">
              General Information
            </p>
            <div>
              <div className="flex flex-col gap-1 my-[15px]">
                <label className="text-[#777777]">Name</label>
                <input
                  placeholder="Product Name"
                  name="title"
                  required
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
              <div className="flex flex-col gap-1 my-[15px]">
                <label className="text-[#777777]">Tags</label>
                <input
                  placeholder="Tags"
                  name="tags"
                  required
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
              <div className="flex flex-col gap-1 my-[15px]">
                <label className="text-[#777777]">Description</label>
                <textarea
                  placeholder="Write about product"
                  name="description"
                  required
                  className="focus:outline-none border-[2px] border-gray-200 py-2 rounded-[8px] px-[15px] h-[110px] text-[15px]"
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-3 lg:gap-10 my-[15px]">
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Product Info</label>
                <input
                  placeholder="Product Info"
                  name="product_info"
                  required
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
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

            <div className="flex flex-col lg:flex-row gap-3 lg:gap-10 my-[15px]">
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Add FAQs Question</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Question"
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-3 lg:gap-10 my-[15px]">
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Add FAQs Answer</label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Answer"
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddFaq}
              className="p-2 bg-blue-500 text-white rounded-lg"
            >
              Add FAQ
            </button>

            <div className="flex flex-col lg:flex-row gap-3 lg:gap-10 my-[15px]">
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Category</label>
                <select
                  name="category_id"
                  required
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px] text-[var(--text-color-body)]"
                >
                  <option selected disabled>
                    Select an option
                  </option>
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
                  required
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px] text-[var(--text-color-body)]"
                >
                  <option selected disabled>
                    Select an option
                  </option>
                  {allBrands?.map((item) => (
                    <option key={item?.id} value={item?.id||randomId}>
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
                  required
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Discount</label>
                <input
                  placeholder="%"
                  name="discount"
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
                      required
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
            </div>

            <div className="flex flex-col lg:flex-row gap-3 lg:gap-10 my-[15px]">
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Size</label>
                <input
                  placeholder="Size (e.g., XS, S, M, L, XL, XXL)"
                  name="size"
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1 lg:my-[15px]">
                <label className="text-[#777777]">Color</label>
                <input
                  placeholder="Color"
                  name="color"
                  className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-10 pb-8">
              <button
                type="submit"
                disabled={isPending}
                className="h-[50px] rounded-[8px] bg-[#FE4242] flex items-center justify-center text-white font-[500] w-full sm:w-[200px] mt-10 disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none"
              >
                {isPending ? (
                  <p>
                    <LuLoader2
                      size={20}
                      className="animate-spin mx-auto mt-3"
                      color={"white"}
                    />
                  </p>
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
