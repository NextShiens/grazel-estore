import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePageNavigation } from "../../../features/features";
import { FaCamera, FaTrash } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { LuLoader2 } from "react-icons/lu";
import Image from "next/image";
import { axiosPrivate } from "../../../axios/index";
import { toast } from "react-toastify";
import { WithContext as ReactTags } from "react-tag-input";

const EditProduct = ({ product, setSelectedTab, onProductUpdated }) => {
  const dispatch = useDispatch();
  const [isPending, setPending] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [productImage, setProductImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [title, setTitle] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    color: "",
    category_id: "",
    brand_id: "",
    price: "",
    discount: "",
  });

  useEffect(() => {
    dispatch(updatePageNavigation("products"));
    fetchCategories();
    fetchBrands();
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        color: product.color || "",
        category_id: product.category_id || "",
        brand_id: product.brand_id || "",
        price: product.price || "",
        discount: product.discount || "",
      });
      setTags(product.tags ? product.tags.split(',').map(tag => ({ id: tag, text: tag })) : []);
      if (product.featured_image) {
        setProductImage(product.featured_image);
      }
      if (product.gallery) {
        setGalleryImages(product.gallery.map(img => ({ id: img.id, url: img.image })));
      }
    }
  }, [dispatch, product]);

  const fetchCategories = async () => {
    try {
      const { data } = await axiosPrivate.get("/global/categories");
      setAllCategories(data?.categories);
    } catch (error) {
      console.error("Failed to fetch categories", error);
      toast.error("Failed to fetch categories");
    }
  };
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    const wordCount = newTitle.trim().split(/\s+/).length;

    if (wordCount <= 6) {
      setFormData(prevData => ({
        ...prevData,
        title: newTitle
      }));
    } else {
      toast.error("Title should not exceed 6 words");
    }
  };

  const fetchBrands = async () => {
    try {
      const { data } = await axiosPrivate.get("/global/brands");
      setAllBrands(data?.brands);
    } catch (error) {
      console.error("Failed to fetch brands", error);
      toast.error("Failed to fetch brands");
    }
  };

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
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.color.trim()) errors.color = "Color is required";
    if (!formData.category_id) errors.category_id = "Category is required";
    if (!formData.price) errors.price = "Price is required";
    if (!productImage) errors.featured_image = "Feature image is required";
    if (galleryImages.length === 0) errors.gallery_images = "At least one gallery image is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const onEditProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setPending(true);
      const formdata = new FormData();
      for (let key in formData) {
        formdata.append(key, formData[key]);
      }
      // Add tags to formdata
      formdata.append("tags", tags.map(tag => tag.text).join(','));
      if (productImage instanceof File) {
        formdata.append("featured_image", productImage);
      }
      galleryImages.forEach((image, index) => {
        if (image.file instanceof File) {
          formdata.append("gallery_images", image.file);
        }
      });
      await axiosPrivate.put(`/vendor/products/${product?.id}`, formdata,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      toast.success("Product has been updated");
      onProductUpdated();
      setSelectedTab("manage");
    } catch (error) {
      console.error("Failed to update product", error);
      toast.error("Something went wrong while updating the product");
    } finally {
      setPending(false);
    }
  };
  const handleDeleteProduct = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axiosPrivate.delete(`/vendor/products/${product?.id}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        toast.success("Product has been deleted");
        onProductUpdated();
        setSelectedTab("manage");
      } catch (error) {
        console.error("Failed to delete product", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const handleDeleteGalleryImage = async (imageId) => {
    try {
      await axiosPrivate.delete(`/vendor/products/${product?.id}/gallery/${imageId}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      setGalleryImages(galleryImages.filter(img => img.id !== imageId));
      toast.success("Gallery image has been deleted");
    } catch (error) {
      console.error("Failed to delete gallery image", error);
      toast.error("Failed to delete gallery image");
    }
  };

  const handleFeatureImageChange = (e) => {
    if (e.target.files[0]) {
      setProductImage(e.target.files[0]);
    }
  };

  const handleGalleryImageChange = (e) => {
    const newImages = Array.from(e.target.files).map(file => ({ url: URL.createObjectURL(file), file }));
    setGalleryImages([...galleryImages, ...newImages]);
  };

  const handleDeleteTag = (i) => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddTag = (tag) => {
    setTags([...tags, tag]);
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 mt-[30px] px-[22px]">
        <form onSubmit={onEditProduct} className="bg-white rounded-[8px] shadow-sm px-[20px] py-[25px]">
          <h2 className="text-2xl font-semibold mb-6">Edit Product</h2>

          {/* General Information */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className={`w-full p-2 border rounded-md ${formErrors.title ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Product Name"
                />
                {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <ReactTags
                  tags={tags}
                  handleDelete={handleDeleteTag}
                  handleAddition={handleAddTag}
                  delimiters={[188, 13]}
                  classNames={{
                    tags: 'w-full',
                    tagInput: 'w-full p-2 border rounded-md',
                    tag: 'bg-blue-100 inline-block rounded-full px-3 py-1 text-sm font-semibold text-blue-700 mr-2 mb-2',
                    remove: 'ml-1 text-blue-500 hover:text-blue-700',
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${formErrors.description ? "border-red-500" : "border-gray-300"}`}
                  rows="4"
                  placeholder="Product description"
                ></textarea>
                {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${formErrors.color ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Color"
                />
                {formErrors.color && <p className="text-red-500 text-xs mt-1">{formErrors.color}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${formErrors.category_id ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select a category</option>
                  {allCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {formErrors.category_id && <p className="text-red-500 text-xs mt-1">{formErrors.category_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a brand</option>
                  {allBrands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${formErrors.price ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Price"
                />
                {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Discount percentage"
                />
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Images</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="featured-image"
                  className="hidden"
                  onChange={handleFeatureImageChange}
                  accept="image/*"
                />
                <label
                  htmlFor="featured-image"
                  className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Choose File
                </label>
                {productImage && (
                  <div className="relative">
                    <Image
                      src={productImage instanceof File ? URL.createObjectURL(productImage) : productImage}
                      alt="Featured product"
                      width={100}
                      height={100}
                      className="object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setProductImage(null)}
                      className="absolute top-0 right-0 bg-white rounded-full p-1"
                    >
                      <MdCancel className="text-red-500" size={20} />
                    </button>
                  </div>
                )}
              </div>
              {formErrors.featured_image && <p className="text-red-500 text-xs mt-1">{formErrors.featured_image}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
              <input
                type="file"
                id="gallery-images"
                className="hidden"
                onChange={handleGalleryImageChange}
                multiple
                accept="image/*"
              />
              <label
                htmlFor="gallery-images"
                className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Gallery Images
              </label>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {galleryImages.map((image, index) => (
                  <div key={image.id || index} className="relative">
                    <Image
                      src={image.url}
                      alt={`Gallery image ${index + 1}`}
                      width={100}
                      height={100}
                      className="object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryImage(image.id)}
                      className="absolute top-0 right-0 bg-white rounded-full p-1"
                    >
                      <MdCancel className="text-red-500" size={20} />
                    </button>
                  </div>
                ))}
              </div>
              {formErrors.gallery_images && <p className="text-red-500 text-xs mt-1">{formErrors.gallery_images}</p>}
            </div>
          </section>

          {/* Submit and Delete buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isPending}
            >
              {isPending ? (
                <LuLoader2 className="animate-spin" size={24} />
              ) : (
                "Update Product"
              )}
            </button>
            <button
              type="button"
              onClick={handleDeleteProduct}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;