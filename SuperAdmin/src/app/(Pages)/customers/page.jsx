"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { cn } from "@/lib/utils";

import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import SearchOnTop from "@/components/SearchOnTop";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import electronicLED from "@/assets/document-image.png";
import tableAction from "@/assets/svgs/table-action.svg";
import { IoEye } from "react-icons/io5";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";

import { axiosPrivate } from "@/axios";
import Loading from "@/components/loading";
import { Modal, Button, Form, Input, Switch, DatePicker, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useRouter } from "next/navigation";

const Customers = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedCustomer, setSelectedCustomer] = useState(0);
  const [allCustomers, setAllCustomers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

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
    if (loginChecked && loggedIn) {
      getAllCustomers();
    }
  }, [currentPage, loginChecked, loggedIn]);

  useEffect(() => {
    if (loginChecked && loggedIn) {
      dispatch(updatePageLoader(false));
      dispatch(updatePageNavigation("customers"));
    }
  }, [dispatch, loginChecked, loggedIn]);

  const getAllCustomers = async () => {
    if (!loggedIn) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      const { data } = await axiosPrivate.get(`/users?${params}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      setAllCustomers(data.users);
      setTotalPages(data.totalPages);
      setTotalCustomers(data.total);
      setItemsPerPage(data.limit);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fn_viewDetails = (id) => {
    if (!loggedIn) return;
    if (id === selectedCustomer) {
      return setSelectedCustomer(0);
    }
    setSelectedCustomer(id);
  };

  const showModal = (user = null) => {
    if (!loggedIn) return;
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        ...user,
        ...user.profile,
        created_at: (user.created_at),
        updated_at: (user.updated_at),
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    if (!loggedIn) return;
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    if (!loggedIn) return;
    const formData = new FormData();

    Object.keys(values).forEach(key => {
      if (key !== 'profile' && key !== 'image') {
        formData.append(key, values[key]);
      }
    });

    Object.keys(values.profile || {}).forEach(key => {
      formData.append(`profile[${key}]`, values.profile[key]);
    });

    if (values.image && values.image[0]) {
      formData.append('image', values.image[0].originFileObj);
    }

    try {
      if (editingUser) {
        await axiosPrivate.put(`/users/${editingUser.id}`, formData, {
          headers: {
            'Authorization': "Bearer " + localStorage.getItem("token"),
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axiosPrivate.post("/users", formData, {
          headers: {
            'Authorization': "Bearer " + localStorage.getItem("token"),
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      handleCancel();
      getAllCustomers();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!loggedIn) return;
    try {
      await axiosPrivate.delete(`/users/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      getAllCustomers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (!loggedIn) return;
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const ellipsis = <span className="mx-1">...</span>;

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <PageButton
            key={i}
            page={i}
            currentPage={currentPage}
            onClick={() => handlePageChange(i)}
          />
        );
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(
            <PageButton
              key={i}
              page={i}
              currentPage={currentPage}
              onClick={() => handlePageChange(i)}
            />
          );
        }
        pageNumbers.push(ellipsis);
        pageNumbers.push(
          <PageButton
            key={totalPages}
            page={totalPages}
            currentPage={currentPage}
            onClick={() => handlePageChange(totalPages)}
          />
        );
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(
          <PageButton
            key={1}
            page={1}
            currentPage={currentPage}
            onClick={() => handlePageChange(1)}
          />
        );
        pageNumbers.push(ellipsis);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(
            <PageButton
              key={i}
              page={i}
              currentPage={currentPage}
              onClick={() => handlePageChange(i)}
            />
          );
        }
      } else {
        pageNumbers.push(
          <PageButton
            key={1}
            page={1}
            currentPage={currentPage}
            onClick={() => handlePageChange(1)}
          />
        );
        pageNumbers.push(ellipsis);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(
            <PageButton
              key={i}
              page={i}
              currentPage={currentPage}
              onClick={() => handlePageChange(i)}
            />
          );
        }
        pageNumbers.push(ellipsis);
        pageNumbers.push(
          <PageButton
            key={totalPages}
            page={totalPages}
            currentPage={currentPage}
            onClick={() => handlePageChange(totalPages)}
          />
        );
      }
    }

    return pageNumbers;
  };

  return (
    <>
      <Loading />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[10px] sm:px-[22px]">
            <SearchOnTop />
            <div className="my-[20px] px-[30px] py-[20px] bg-white rounded-[8px] shadow-sm overflow-x-auto w-[94vw] md:w-[67vw] lg:w-[75vw] xl:w-auto">
              <Button onClick={() => showModal()} className="mb-4">Add New User</Button>
              {isLoading ? (
                <p>Loading customers...</p>
              ) : (
                <>
                  <table className={`w-[850px] xl:w-[100%]`}>
                    <thead>
                      <tr className="font-[500] text-[var(--text-color-body)] text-[15px] h-[50px]">
                        <td>Name</td>
                        <td>Email Address</td>
                        <td>Phone Number</td>
                        <td>Status</td>
                        <td className="w-[120px]">Action</td>
                      </tr>
                    </thead>
                    <tbody>
                      {allCustomers?.map((item) => (
                        <tr key={item.id} className="h-[50px] text-[14px]">
                          <td className="flex items-center gap-1.5 h-[50px]">
                            <Image
                              alt=""
                              width={50}
                              height={50}
                              src={item?.profile?.image || electronicLED}
                              className="h-[26px] w-[26px] rounded-md"
                            />
                            {item?.username}
                          </td>
                          <td>{item?.email}</td>
                          <td>{item?.profile?.phone}</td>
                          <td className="w-[130px]">
                            <p
                              className={cn(
                                "h-[23px] w-[60px] rounded-[5px] flex items-center font-[500] justify-center text-[10px]",
                                item?.active
                                  ? "bg-[var(--bg-color-delivered)] text-[var(--text-color-delivered)]"
                                  : "bg-[var(--bg-color-pending)] text-[var(--text-color-pending)]"
                              )}
                            >
                              {item?.active ? "Active" : "Pending"}
                            </p>
                          </td>
                          <td className="px-[17px] relative">
                            <Image
                              alt=""
                              src={tableAction}
                              className="cursor-pointer"
                              onClick={() => fn_viewDetails(item.id)}
                            />
                            {selectedCustomer === item.id && (
                              <ViewDetails
                                user={item}
                                onEdit={() => showModal(item)}
                                onDelete={() => handleDelete(item.id)}
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {allCustomers.length > 0 && (
                    <div className="flex flex-col items-center mt-4">
                      <div className="flex justify-center items-center">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {renderPageNumbers()}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Page {currentPage} of {totalPages} | Total Customers: {totalCustomers}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal
        title={editingUser ? "Edit User" : "Add New User"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="score" label="Score">
            <Input type="number" />
          </Form.Item>
          <Form.Item name={['profile', 'first_name']} label="First Name">
            <Input />
          </Form.Item>
          <Form.Item name={['profile', 'last_name']} label="Last Name">
            <Input />
          </Form.Item>
          <Form.Item name={['profile', 'phone']} label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name={['profile', 'country']} label="Country">
            <Input />
          </Form.Item>
          <Form.Item name={['profile', 'city']} label="City">
            <Input />
          </Form.Item>
          <Form.Item name={['profile', 'state']} label="State">
            <Input />
          </Form.Item>
          <Form.Item name={['profile', 'address']} label="Address">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name={['profile', 'active']} label="Profile Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="image" label="Profile Image">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingUser ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default Customers;
const ViewDetails = ({ user, onEdit, onDelete }) => {
  return (
    <div className="absolute py-[10px] px-[10px] flex flex-col items-center text-[var(--text-color-body)] bg-white rounded-[8px] shadow-md border border-gray-100 w-[max-content] left-[-145px] top-[13px] cursor-pointer z-[999]">
      <div className="flex items-center gap-2.5 w-full px-2 py-1.5 hover:bg-gray-100 rounded-sm" onClick={onEdit}>
        <FaEdit className="w-[20px] h-[20px]" />
        <p className="text-[14px]">Edit</p>
      </div>
      <div className="flex items-center gap-2.5 w-full px-2 py-1.5 hover:bg-gray-100 rounded-sm" onClick={onDelete}>
        <RiDeleteBin6Fill className="w-[20px] h-[20px]" />
        <p className="text-[14px]">Delete</p>
      </div>
      {/* <div className="flex items-center gap-2.5 w-full px-2 py-1.5 hover:bg-gray-100 rounded-sm">
        <IoEye className="w-[20px] h-[20px]" />
        <p className="text-[14px]">{user.active ? "Disable" : "Enable"}</p>
      </div> */}
    </div>
  );
};

const PageButton = ({ page, currentPage, onClick }) => (
  <button
    onClick={onClick}
    className={`mx-1 px-3 py-1 rounded ${
      currentPage === page
        ? "bg-red-500 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    {page}
  </button>
);