"use client";

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import SearchOnTop from "@/components/SearchOnTop";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import { axiosPrivate } from "@/axios";

const options = [
  { label: "Offers Page", value: "Offers" },
  { label: "Categories Page", value: "Categories" },
  { label: "Product related with category Page", value: "CategoryListing" },
  { label: "Home", value: "Home" },
  { label: "Product Detail", value: "productdetail" }
];

const AdminNotificationComponent = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    data: {},
    thumbnail: '',
    url: options[0].value,
    categoryId: '',
    productId: ''
  });
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
    }
    setLoginChecked(true);
  };

  useEffect(() => {
    if (loggedIn && loginChecked) {
      const getAllCategories = async () => {
        try {
          const { data } = await axiosPrivate.get("/categories", {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          });
          setAllCategories(data?.categories);
        } catch (error) {
          console.error('Error fetching categories:', error);
          toast.error('Failed to fetch categories');
        }
      };
      getAllCategories();
    }
  }, [loggedIn, loginChecked]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updatePageLoader(true));
      const dataToSend = {
        title: formData.title,
        body: formData.body,
        thumbnail: formData.thumbnail,
        url: formData.url,
        data: {
          categoryId: formData.categoryId || undefined,
          productId: formData.productId || undefined
        }
      };
      await axiosPrivate.post('/admin/push-notification', dataToSend, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Notification sent successfully');
      setFormData({
        title: '',
        body: '',
        data: {},
        thumbnail: '',
        url: options[0].value,
        categoryId: '',
        productId: ''
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      dispatch(updatePageLoader(false));
    }
  };

  const handleSelectionChange = (event) => {
    setFormData({
      ...formData,
      url: event.target.value,
      categoryId: '',
      productId: ''
    });
  };

  if (!loggedIn) {
    return null; // Render nothing if not logged in
  }
  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[10px] sm:px-[22px]">
            <SearchOnTop showButton={false} />
            <div className="mt-[20px] bg-white rounded-[8px] shadow-sm p-[30px]">
              <h2 className="text-2xl font-semibold mb-6">Send Notification</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block mb-2 font-medium">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="body" className="block mb-2 font-medium">
                    Body
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="thumbnail" className="block mb-2 font-medium">
                    Thumbnail (Optional)
                  </label>
                  <input
                    type="text"
                    id="thumbnail"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="url" className="block mb-2 font-medium">
                    Select Page
                  </label>
                  <select
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleSelectionChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.url === 'CategoryListing' && (
                  <div>
                    <label htmlFor="categoryId" className="block mb-2 font-medium">
                      Select Category
                    </label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select a category</option>
                      {allCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {(formData.url === 'CategoryListing' || formData.url === 'productdetail') && (
                  <div>
                    <label htmlFor="productId" className="block mb-2 font-medium">
                      Product ID
                    </label>
                    <input
                      type="text"
                      id="productId"
                      name="productId"
                      value={formData.productId}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                      placeholder="Enter Product ID"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Send Notification
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminNotificationComponent;
