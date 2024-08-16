"use client";
import React, { useEffect, useState, useTransition } from "react";
import Location from "@/assets/layer1.png";
import Home from "@/assets/Vectorhome.png";
import { Avatar, Checkbox, Radio } from "@mui/material";
import CustomModal from "@/components/CustomModel";
import {
  MdDelete,
  MdOutlineDeleteOutline,
  MdUpdate,
  MdOutlineDeleteForever,
} from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { AiFillCloseCircle, AiOutlineClose } from "react-icons/ai";
import { FaCircleCheck } from "react-icons/fa6";
import Dots from "@/assets/Group 1820549907.png";
import { FaCamera } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import {
  createAddressApi,
  createReferralApi,
  deleteAddressApi,
  editAddressApi,
  editPasswordApi,
  editProfileApi,
  getAddressApi,
  getBuyerOrdersApi,
  getOrderByStatusApi,
  getProfileApi,
  deleteuserApi,
  deactivateAccountApi,
} from "@/apis";
import { toast } from "react-toastify";
import { logout } from "@/lib";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MyorderCard from "@/components/MyorderCard";
import { BiCopy, BiLoader } from "react-icons/bi";
import SkeletonLoader from "@/components/SkeletonLoader";
import { useSelector } from "react-redux";
import { count } from "console";

export default function MyAccount() {
  const [showSendModel, setShowSendModel] = useState(false);
  const [showModelDelete, setShowModelDelete] = useState(false);
  const [profileImg, setProfileImg] = useState(null);
  const [activeSection, setActiveSection] = useState<string>("Orders");
  const [showConfirm, setShowconfirm] = useState(false);
  const [showleave, setShowLeave] = useState(false);
  const [isPending, setPending] = useState(false);
  const [activeSectionorder, setActiveSectiorder] = useState<string>("new");
  const [isCancelOrderVisible, setIsCancelOrderVisible] = useState(false);
  const [isDivVisible, setIsDivVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [allAddress, setAllAddress] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [editEnabled, setEditEnabled] = useState("");

  const [activeOrder, setActiveOrder] = useState([]);
  const [completedOrder, setCompletedOrder] = useState([]);
  const [canceledOrder, setCanceledOrder] = useState([]);
  const [productId, setProductId] = useState("");
  const [userOrders, setUserOrders] = useState([]);
  const [referralLink, setReferralLink] = useState("");
  const [hasOrderCanceled, setHasOrderCanceled] = useState(false);
  const router: any = useRouter();
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const cartProducts = useSelector((state: any) => state.user);

  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    address: "",
    phone: "",
    gender: "",
    image: "",
    country: "",
    state: "",
    city: "",
  });
  const [meta, setMeta] = useState({});
  const user = localStorage.getItem("theUser");
  const [orders, setOrders] = useState([]);
  const [activeSections, setActiveSections] = useState<string>("Active");
  const handleSectionChanges = (section: string) => {
    setActiveSections(section);
  };

  useEffect(() => {
    getMyAllOrders();
  }, []);
  const getMyAllOrders = async () => {
    try {
      const { data } = await getBuyerOrdersApi();
      setOrders(data.orders);
      setMeta(data.meta);
    } catch (e) { }
  };

  const profileDataHandler = (e: any) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    (async () => {
      const { data } = await getProfileApi();
      setCurrentUser(data?.user);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await getAddressApi();
      setAllAddress(res?.data?.addresses || []);
    })();
  }, []);

  useEffect(() => {
    const getOrderByStatus = async () => {
      if (activeSectionorder === "new" && !activeOrder.length) {
        const { data } = await getOrderByStatusApi(activeSectionorder);
        setActiveOrder(data?.orders || []);
      } else if (activeSectionorder === "completed" && !completedOrder.length) {
        const { data } = await getOrderByStatusApi(activeSectionorder);
        setCompletedOrder(data?.orders || []);
      } else if (activeSectionorder === "cancelled" && !canceledOrder.length) {
        const { data } = await getOrderByStatusApi(activeSectionorder);
        setCanceledOrder(data?.orders || []);
      } else {
        return;
      }
    };

    getOrderByStatus();
  }, [activeSectionorder]);

  useEffect(() => {
    (async () => {
      const { data } = await getBuyerOrdersApi();
      setUserOrders(data.orders);
    })();
  }, [hasOrderCanceled]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };
  const handleCloseModelDelete = () => {
    setShowModelDelete(false);
  };
  const handleOpenModelDelete = () => {
    setShowModelDelete(true);
  };
  const handelLogout = () => {
    handleSectionChange("Logout");
    setShowSendModel(true);
  };

  const handleDeactivateAccount = async () => {
    try {
      setPending(true);
      const response = await deactivateAccountApi();

      if (response.data && response.data.success) {
        localStorage.clear();
        toast.success("Your account has been deactivated");
        window.location.href = "/signIn";
        router.push("/signIn");
      } else {
        toast.error(
          response.data?.message ||
          "Failed to deactivate account. Please try again."
        );
      }
    } catch (error) {
      console.error("Deactivate account error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setTimeout(() => {
        setPending(false);
      }, 500);
    }
  };

  const deleteuser = async () => {
    try {
      setPending(true);
      const formdata = new FormData();
      formdata.append("message", "User requested account deletion"); // Add a default message

      const response = await deleteuserApi(formdata);

      if (response.data && response.data.success) {
        localStorage.clear();
        toast.success("User has been deleted");
        window.location.href = "/signIn";
        router.push("/signIn");
      } else {
        toast.error(
          response.data?.message || "Failed to delete user. Please try again."
        );
      }
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setTimeout(() => {
        setPending(false);
      }, 500);
    }
  };

  async function onEditPassword(formdata) {
    const cPassword = formdata.get("cPassword");
    const newPassword = formdata.get("new_password");
    if (cPassword !== newPassword) {
      return toast.error("Password did not match");
    }
    try {
      setPending(true);
      await editPasswordApi(formdata);
      toast.success("Password has been updated");
    } catch (error) {
      if (error?.response?.status === 400) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setTimeout(() => {
        setPending(false);
      }, 500);
    }
  }
  async function onLogout() {
    try {
      await logout();
      localStorage.clear();
      window.location.href = "/signIn";
      router.push("/signIn");
    } catch (error) {
      console.log(error);
    }
  }

  async function onEditAddress(formdata: any) {
    try {
      setPending(true);
      const res = await editAddressApi(formdata, addressId);
      toast.success("Address has been updated");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setTimeout(() => {
        setPending(false);
      }, 500);
    }
  }
  async function onDeleteAddress(id) {
    if (!addressId) {
      return toast.error("Please select the address");
    }
    try {
      setPending(true);
      await deleteAddressApi(id);
      const filterAddress = allAddress.filter((item) => item.id !== id);
      setAllAddress(filterAddress);
      toast.success("Address has been deleted");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setTimeout(() => {
        setPending(false);
      }, 500);
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileData({ ...profileData, image: file });
      const objectUrl = URL.createObjectURL(file);
      setProfileImg(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const generateRefLink = () => {
    startTransition(async () => {
      if (currentUser) {
        const formdata = new FormData();
        formdata.append("sender_user_id", currentUser.id);
        const { data } = await createReferralApi(formdata);
        setReferralLink(data?.referral.referral_code);
      }
    });
  };
  const onCreateAddress = async (event) => {
    event.preventDefault();
    try {

      const token = localStorage.getItem("token");
      if (!token) return toast.error("Please login to continue");
      setPending(true);

      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData);
      console.log('Form data:', data);

      const res = await createAddressApi(data, token);
      setAllAddress([...allAddress, res?.data?.address]);
      toast.success("Address has been created");
    } catch (error) {
      console.error('Error creating address:', error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setPending(false);
    }
  };
  async function onEditProfile(e) {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("first_name", profileData.first_name);
    formdata.append("last_name", profileData.last_name);
    formdata.append("address", profileData.address);
    formdata.append("phone", profileData.phone);
    formdata.append("gender", profileData.gender);
    formdata.append("image", profileData.image);
    formdata.append("country", profileData.country);
    formdata.append("state", profileData.state);
    formdata.append("city", profileData.city);
    try {
      setPending(true);
      if (!currentUser.id) return null;
      const { data } = await editProfileApi(formdata, currentUser.id);
      toast.success("Profile has been updated");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setTimeout(() => {
        setPending(false);
      }, 500);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <>
      <div className="lg:my-[20px] my-[20px] sm:my-[20px] md:my-[30px] lg:mx-[150px] mx-[20px] sm:mx-[20px] md:mx-[30px]">
        <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-start gap-6 h-auto">
          <div
            style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
            className="rounded-3xl p-[30px] lg:w-[23%] w-[100%] "
          >
            <div
              onClick={() => handleSectionChange("Personal Info")}
              className={`cursor-pointer pl-5 text-[14px] font-medium cursor-pointer ${activeSection === "Personal Info"
                ? "border-l-[4px] border-[#F70000] pl-2"
                : "text-[#8B8B8B] "
                }`}
            >
              Personal Information
            </div>
            <div
              onClick={() => handleSectionChange("Orders")}
              className={`cursor-pointer pl-5  mt-[40px] text-[14px] font-medium cursor-pointer ${activeSection === "Orders"
                ? "border-l-[4px] border-[#F70000] pl-2"
                : "text-[#8B8B8B]"
                }`}
            >
              My Orders
            </div>
            <div
              onClick={() => handleSectionChange("Manage Address")}
              className={`cursor-pointer pl-5  mt-[40px] text-[14px] font-medium cursor-pointer ${activeSection === "Manage Address"
                ? "border-l-[4px] border-[#F70000] pl-2"
                : "text-[#8B8B8B] "
                }`}
            >
              Manage Address
            </div>
            <div
              onClick={() => handleSectionChange("Password Manager")}
              className={`cursor-pointer  mt-[40px] pl-5 text-[14px] font-medium cursor-pointer ${activeSection === "Password Manager"
                ? "border-l-[4px] border-[#F70000] pl-2"
                : "text-[#8B8B8B] "
                }`}
            >
              Password Manager
            </div>
            <div
              onClick={handelLogout}
              className={`cursor-pointer  mt-[40px] pl-5  text-[14px] font-medium cursor-pointer   ${activeSection === "Logouts"
                ? "border-l-[4px] border-[#F70000] pl-2"
                : "text-[#8B8B8B] "
                }`}
            >
              Logouts
            </div>
            <div
              onClick={() => router.push("/")}
              className={`cursor-pointer  mt-[40px] pl-5 text-[14px] font-medium cursor-pointer ${activeSection === "nothing"
                ? "border-l-[4px] border-[#F70000] pl-2"
                : "text-[#8B8B8B] "
                }`}
            >
              Go Back
            </div>
          </div>
          <div className="rounded-3xl  lg:w-[77%] w-[100%] min-h-[454px] max-h-auto">
            {activeSection === "Personal Info" && (
              <form
                onSubmit={onEditProfile}
                style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
                className="rounded-3xl p-[30px] w-full "
              >
                <input
                  type="file"
                  id="profile"
                  name="image"
                  className="hidden"
                  accept="image/*,capture=camera"
                  onChange={handleFileChange}
                />
                <div className="relative w-[120px] h-[120px] rounded-full border-zinc-400 border-2">
                  {profileImg ||
                    (currentUser?.profile?.image && (
                      <Image
                        alt="profile"
                        width={120}
                        height={120}
                        src={
                          profileImg ? profileImg : currentUser?.profile?.image
                        }
                        className="rounded-full w-[100%] h-[100%] absolute top-0 right-0"
                      />
                    ))}
                  <label htmlFor="profile">
                    <FaCamera
                      className="absolute cursor-pointer text-black/65 top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%]"
                      size={30}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center gap-4  ">
                  <div className="flex-col mt-[30px] lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%]">
                    <label className="text-[16px] font-semibold">
                      First Name *
                    </label>
                    <input
                      onChange={profileDataHandler}
                      placeholder="Enter Name "
                      name="first_name"
                      defaultValue={currentUser?.profile?.first_name}
                      className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                    />
                  </div>
                  <div className="flex-col mt-[30px] lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%]">
                    <label className="text-[16px] font-semibold">
                      Last Name *
                    </label>
                    <input
                      onChange={profileDataHandler}
                      placeholder="Enter Name "
                      name="last_name"
                      defaultValue={currentUser?.profile?.last_name}
                      className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex-col mt-[30px]">
                  <label className="text-[16px] font-semibold">Email</label>
                  <input
                    onChange={profileDataHandler}
                    placeholder="Enter Phone Number"
                    type="tel"
                    name="phone"
                    defaultValue={currentUser?.email}
                    className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                  />
                </div>
                <div className="flex-col mt-[30px]">
                  <label className="text-[16px] font-semibold">
                    Phone Number *
                  </label>
                  <input
                    onChange={profileDataHandler}
                    placeholder="Enter Phone Number"
                    type="tel"
                    name="phone"
                    defaultValue={currentUser?.profile?.phone}
                    className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                  />
                </div>
                <div className="flex-col mt-[30px]">
                  <label className="text-[16px] font-semibold">Address</label>
                  <input
                    onChange={profileDataHandler}
                    placeholder="Enter Address"
                    name="address"
                    defaultValue={currentUser?.profile?.address}
                    className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center gap-4  ">
                  <div className="flex-col mt-[30px] lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%]">
                    <label className="text-[16px] font-semibold">
                      Country *
                    </label>
                    <input
                      onChange={profileDataHandler}
                      placeholder="country"
                      name="country"
                      defaultValue={currentUser?.profile?.country}
                      className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                    />
                  </div>
                  <div className="flex-col mt-[30px] lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%]">
                    <label className="text-[16px] font-semibold">
                      State *
                    </label>
                    <input
                      onChange={profileDataHandler}
                      placeholder="state "
                      name="state"
                      defaultValue={currentUser?.profile?.state}
                      className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex-col mt-[30px] lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%]">
                  <label className="text-[16px] font-semibold">
                    City *
                  </label>
                  <input
                    onChange={profileDataHandler}
                    placeholder="city "
                    name="city"
                    defaultValue={currentUser?.profile?.city}
                    className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                  />
                </div>
                {/* <div className="flex-col mt-[30px]">
                  <label className="text-[16px] font-semibold"> Gender *</label>
                  <select
                    name="gender"
                    onChange={profileDataHandler}
                    className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                  >
                    <option value={"Male"}>Male</option>
                    <option value={"FeMale"}>FeMale</option>
                  </select>
                </div> */}
                <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center justify-between mt-[30px]">
                  <button
                    type="submit"
                    disabled={isPending}
                    className=" bg-[#F70000] disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none rounded-2xl h-[50px]  lg:w-[181px] w-[100%] text-[18px] font-medium text-white"
                  >
                    Update Change
                  </button>
                  <div className="flex items-center lg:mt-0 mt-3 sm:mt-3">
                    <MdOutlineDeleteOutline
                      className="text-[#F70000] lg:text-[28px] text-[20px] sm:text-[20px]"
                      onClick={handleOpenModelDelete}
                    />
                    <p
                      className="cursor-pointer text-[#F70000] lg:text-[16px] text-[12px] sm:text-[14px] font-semibold mr-[16px]"
                      onClick={handleOpenModelDelete}
                    >
                      Delete Account
                    </p>
                    <div className="flex items-center">
                      <MdOutlineDeleteForever
                        className="text-[#777777] lg:text-[28px] text-[20px] sm:text-[20px]"
                        onClick={() => setShowDeactivateModal(true)}
                      />
                      <p
                        className="cursor-pointer text-[#777777] lg:text-[16px] text-[12px] sm:text-[14px] font-semibold"
                        onClick={() => setShowDeactivateModal(true)}
                      >
                        Deactivate Account
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            )}
            <CustomModal
              showModal={showModelDelete}
              onClose={handleCloseModelDelete}
            >
              <div className="p-3 sm:p-6 relative w-full max-w-[100%] sm:max-w-md mx-auto rounded-md sm:rounded-lg">
                <h2 className="text-lg sm:text-2xl text-center font-bold text-gray-800 mb-2 sm:mb-4">
                  Delete Account
                </h2>
                <p className="text-xs sm:text-base text-center text-gray-600 mb-2 sm:mb-4">
                  Deleting your account will remove all your information from
                  our database. This action cannot be undone.
                </p>
                <input
                  className=" w-full h-8 sm:h-12 px-3 text-xs sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 mb-2 sm:mb-4"
                  placeholder="Type 'Delete' to confirm"
                />
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md h-8 sm:h-12 w-full text-xs sm:text-base font-medium transition-colors"
                    onClick={handleCloseModelDelete}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 rounded-md h-8 sm:h-12 w-full text-xs sm:text-base font-medium text-white transition-colors"
                    onClick={deleteuser}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </CustomModal>
            <CustomModal
              showModal={showDeactivateModal}
              onClose={() => setShowDeactivateModal(false)}
            >
              <div className="p-4 sm:p-6 relative w-full max-w-[100%] sm:max-w-md mx-auto sm:rounded-lg">
                <h2 className="text-xl sm:text-2xl text-center font-bold text-gray-800 mb-3 sm:mb-4">
                  Deactivate Account
                </h2>
                <p className="text-sm sm:text-base text-center text-gray-600 mb-3 sm:mb-4">
                  Deactivating your account will hide your profile and content
                  from other users. You can reactivate your account at any time
                  by logging in.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 sm:rounded-md h-10 sm:h-12 w-full text-sm sm:text-base font-medium transition-colors"
                    onClick={() => setShowDeactivateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 sm:rounded-md h-10 sm:h-12 w-full text-sm sm:text-base font-medium text-white transition-colors"
                    onClick={handleDeactivateAccount}
                  >
                    Deactivate Account
                  </button>
                </div>
              </div>
            </CustomModal>
            {activeSection === "Orders" && (
              <>
                <div className="">
                  <div
                    style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
                    className="rounded-3xl p-[20px] w-[100%] gap-8 md:justify-start justify-center flex items-algin "
                  >
                    <p
                      onClick={() => handleSectionChanges("Active")}
                      className={`lg:text-[16px] text-[10px] md:text-[14px]  font-normal cursor-pointer bold ${activeSections === "Active"
                        ? "border-b-[4px] border-[#F70000] font-semibold"
                        : "text-[#8B8B8B]"
                        }`}
                    >
                      Active orders
                    </p>

                    <p
                      onClick={() => handleSectionChanges("Completed")}
                      className={`lg:text-[16px] text-[10px] md:text-[14px] font-normal cursor-pointer bold ${activeSections === "Completed"
                        ? "border-b-[4px] border-[#F70000] font-semibold"
                        : "text-[#8B8B8B]"
                        }`}
                    >
                      Completed orders
                    </p>

                    <p
                      onClick={() => handleSectionChanges("Cancelled")}
                      className={`lg:text-[16px] text-[10px] md:text-[14px] font-normal cursor-pointer ${activeSections === "Cancelled"
                        ? "border-b-[4px] border-[#F70000] font-semibold"
                        : "text-[#8B8B8B]"
                        }`}
                    >
                      Cancelled orders
                    </p>
                  </div>

                  {activeSections === "Active" && (
                    <>
                      {!orders?.length ? (
                        <p className="text-center text-gray-500 text-lg mt-4">
                          No active orders found...
                        </p>
                      ) : (
                        orders.map((order: any) => {
                          return (
                            <MyorderCard
                              key={order?.id}
                              status={["in_progress", "new", "shipped"]}
                              order={order}
                              getMyAllOrders={getMyAllOrders}
                            />
                          );
                        })
                      )}
                    </>
                  )}

{activeSections === "Completed" && (
                    <>
                      {!orders?.length ? (
                        <p className="text-center text-gray-500 text-lg mt-4">
                          No completed orders found...
                        </p>
                      ) : (
                        orders.map((order: any) => {
                          return (
                            <MyorderCard
                              key={order.id}
                              status={["completed"]}
                              order={order}
                            />
                          );
                        })
                      )}
                    </>
                  )}
                  {activeSections === "Cancelled" && (
                    <>
                      {!orders?.length ? (
                        <p className="text-center text-gray-500 text-lg mt-4">
                          No cancelled orders found...
                        </p>
                      ) : (
                        orders.map((order: any) => {
                          return (
                            <MyorderCard
                              key={order.id}
                              status={["cancelled"]}
                              order={order}
                            />
                          );
                        })
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            {activeSection === "Manage Address" && (
              <>
                <form action={onEditAddress}>
                  {allAddress?.map((item, index) => (
                    <div
                      key={item.id}
                      style={{ boxShadow: "0px 4px 29px 0px #0000000A " }}
                      className="rounded-3xl p-[20px] w-full h-auto hover:border-[#F70000] border-[1px] mb-4"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          autoFocus
                          readOnly={editEnabled === item?.id ? false : true}
                          name="address_label"
                          className="text-[24px] font-medium w-full rounded-md h-[50px] p-3 focus:outline-none "
                          defaultValue={item?.address_label?.toUpperCase()}
                        />
                        <Radio
                          sx={{
                            color: "#F70000",
                            "& .MuiSvgIcon-root": {
                              fontSize: 34,
                            },
                            "&.Mui-checked": {
                              color: "#F70000",
                            },
                          }}
                          checked={addressId === item?.id ? true : false}
                          onChange={() => setAddressId(item?.id)}
                        />
                      </div>
                      <div className="flex items-center ">
                        <Image
                          src={Home}
                          alt=""
                          className="md:w-[50px] w-[25px] md:h-[50px] h-[25px] mr-4"
                        />
                        <div>
                          <p className="flex items-center">
                            <input
                              readOnly={editEnabled === item?.id ? false : true}
                              name="recipient_name"
                              className="text-[16px] font-semibold  w-full rounded-md p-3 focus:outline-none "
                              defaultValue={item?.recipient_name}
                            />
                            <input
                              readOnly={editEnabled === item?.id ? false : true}
                              name="recipient_phone"
                              className="text-[16px] w-full rounded-md p-3 focus:outline-none "
                              defaultValue={item?.recipient_phone}
                            />
                          </p>
                          <input
                            readOnly={editEnabled === item?.id ? false : true}
                            name="address"
                            className="text-[14px] mt-2 font-medium text-[#777777]  w-full rounded-md p-3 focus:outline-none"
                            defaultValue={item?.address}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center ">
                          {/* <Image
                            src={Location}
                            alt=""
                            className="w-[18px] h-[23px] mr-2"
                          />
                          <p className="text-[14px] font-medium text-[#777777] ">
                            New, York
                          </p> */}
                        </div>
                        <div className="flex items-center ">
                          <div className="flex items-center justify-center border-[1px] border-[#BABABA] rounded-md w-[55px] h-[35px] mr-3">
                            {editEnabled !== item?.id ? (
                              <FiEdit
                                className={`${editEnabled === item?.id
                                  ? "text-[#F70000]"
                                  : "text-[#BABABA]"
                                  } h-[20px] w-[20px]  cursor-pointer`}
                                onClick={() => setEditEnabled(item?.id)}
                              />
                            ) : (
                              <button className="p-[6px] rounded-md text-white bg-[#F70000]">
                                Update
                              </button>
                            )}
                          </div>
                          <div
                            onClick={() => onDeleteAddress(item?.id)}
                            style={{ pointerEvents: `${isPending} && "none"` }}
                            className="flex cursor-pointer items-center justify-center border-[1px] border-[#BABABA] rounded-md w-[35px] h-[35px] "
                          >
                            <MdOutlineDeleteOutline className="h-[20px] w-[20px] text-[#BABABA]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </form>
                <form onSubmit={onCreateAddress} className="mt-8 bg-white rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Add New Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        name="recipient_name"
                        required
                        placeholder="Enter Your Name"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Address Title</label>
                      <input
                        name="address_label"
                        required
                        placeholder="Address Title e.g Home/Office etc"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Street Address</label>
                      <input
                        name="address"
                        required
                        placeholder="Address"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number</label>
                      <input
                        name="recipient_phone"
                        required
                        placeholder="Phone Number"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Note</label>
                      <input
                        name="note"
                        placeholder="Note"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="mt-6 w-full bg-red-600 text-white py-3 rounded-md font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-red-700"
                  >
                    Add Address
                  </button>
                </form>
              </>
            )}

            {activeSection === "Password Manager" && (
              <form
                action={onEditPassword}
                style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
                className="rounded-3xl p-[30px] w-full "
              >
                <div className="flex-col">
                  <label className="text-[16px] font-semibold">
                    Password *
                  </label>
                  <input
                    placeholder="Enter Password"
                    name="old_password"
                    required
                    min={8}
                    className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                  />
                </div>
                <div className="flex-col mt-[30px]">
                  <label className="text-[16px] font-semibold">
                    New Password *
                  </label>
                  <input
                    placeholder="Enter Password"
                    name="new_password"
                    required
                    min={8}
                    className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                  />
                </div>
                <div className="flex-col mt-[30px]">
                  <label className="text-[16px] font-semibold">
                    Confirm Password *
                  </label>
                  <input
                    placeholder="Enter Password"
                    name="cPassword"
                    required
                    min={8}
                    className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className=" bg-[#F70000] disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none rounded-full h-[50px] mt-[30px] w-[275px] text-[18px] font-medium text-white"
                >
                  Update Password
                </button>
              </form>
            )}
            {activeSection === "Logout" && (
              <>
                <CustomModal
                  showModal={showSendModel}
                  onClose={() => setShowSendModel(false)}
                >
                  <form
                    action={onLogout}
                    className="w-full max-w-[400px] p-4 sm:p-6"
                  >
                    <p className="text-2xl sm:text-3xl md:text-4xl text-center font-bold text-[#191919]">
                      Logout
                    </p>
                    <p className="text-center font-medium text-[#777777] mt-4 sm:mt-6 text-sm sm:text-base">
                      Are you sure you want to log out?
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center mt-6 sm:mt-8 space-y-3 sm:space-y-0 sm:space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowSendModel(false)}
                        className="bg-gray-200 hover:bg-gray-300 rounded-full h-12 w-full sm:w-[130px] text-base sm:text-lg font-medium text-[#191919] transition duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#F70000] hover:bg-[#d60000] rounded-full h-12 w-full sm:w-[130px] text-base sm:text-lg font-medium text-white transition duration-300"
                      >
                        Yes, Logout
                      </button>
                    </div>
                  </form>
                </CustomModal>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
