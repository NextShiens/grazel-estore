"use client";
import React, { useEffect, useState, useTransition } from "react";
import PayPal from "@/assets/pngwing 6.png";
import Visa from "@/assets/pngwing 7.png";
import Google from "@/assets/Group 1820549999.png";
import Card from "@/assets/card22.png";
import Chair from "@/assets/pngwing 2.png";
import Location from "@/assets/layer1.png";
import Home from "@/assets/Vectorhome.png";
import Appartment from "@/assets/Group444.png";
import Office from "@/assets/Layer_1.png";
import { Avatar, Checkbox, Radio } from "@mui/material";
import CustomModal from "@/components/CustomModel";
import {
  MdDelete,
  MdOutlineDeleteOutline,
  MdUpdate,
  MdOutlineDeleteForever,
} from "react-icons/md";
import { LiaUserSlashSolid } from "react-icons/lia";
import { FiEdit } from "react-icons/fi";
import { IoLockClosed } from "react-icons/io5";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { IoCloseSharp } from "react-icons/io5";
import { RiDeleteBin6Fill } from "react-icons/ri";
import close from "@/assets/close.png";
import Shoes from "@/assets/Rectangle 2032.png";
import AAA from "@/assets/Health Report.png";
import BBB from "@/assets/Box.png";
import CCC from "@/assets/Shipping.png";
import DDD from "@/assets/sort by time.png";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaCircleCheck } from "react-icons/fa6";
import Dots from "@/assets/Group 1820549907.png";
import { Rating } from "@mui/material";
import { PiCameraThin } from "react-icons/pi";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { FaCamera } from "react-icons/fa";
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
  getReferralApi,
  deleteuserApi,
  deactivateAccountApi,
} from "@/apis";
import { toast } from "react-toastify";
import { logout } from "@/lib";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MyorderCard from "@/components/MyorderCard";
import { BiCopy, BiLoader } from "react-icons/bi";
import { useSelector } from "react-redux";

export default function MyAccount() {
  const [showSendModel, setShowSendModel] = useState(false);
  const [showModelDelete, setShowModelDelete] = useState(false);
  const [profileImg, setProfileImg] = useState(null);
  const [activeSection, setActiveSection] = useState<string>("Personal Info");
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
  const userRedux = useSelector((state) => state.user);
  const router = useRouter();
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const [showAddress, setAddress] = useState(false);

  const profileDataHandler = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    (async () => {
      const { data } = await getProfileApi();

      setCurrentUser(data?.user);
    })();
  }, []);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    country: "",
    city: "",
    state: "",
    address: "",
    image: "",
    pincode: '',
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("theUser"));
    if (user && user.profile) {
      setCurrentUser(user);
      setProfileData({
        first_name: user.profile.first_name || "",
        last_name: user.profile.last_name || "",
        phone: user.profile.phone || "",
        country: user.profile.country || "",
        city: user.profile.city || "",
        state: user.profile.state || "",
        address: user.profile.address || "",
        image: user.profile.image || "",
        pincode: user.profile.pincode || "",
      });
    }
  }, [userRedux]);
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
  const handleCloseModel = () => {
    setShowSendModel(false);
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

  const handleSectionChangeorder = (section: string) => {
    setActiveSectiorder(section);
  };

  const handleOpeneModelLeave = () => {
    setShowLeave(true);
  };
  const handelCloseComplet = () => {
    setShowLeave(false);
  };
  const handleOpeneModelconfirm = () => {
    setShowSendModel(false);
    setShowconfirm(true);

    // Close the confirmation modal after 5 seconds
    setTimeout(() => {
      setShowconfirm(false);
    }, 5000);
  };
  const handleOpeneModel = () => {
    setShowSendModel(true);
  };

  const handleButtonClick = () => {
    setIsDivVisible((prev) => !prev);
  };

  const toggleCancelOrderVisibility = () => {
    setIsCancelOrderVisible(!isCancelOonSelectAddressrderVisible);
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
      console.log(error);

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
      setAddress(false); // Close the form after successful submission
    } catch (error) {
      console.error('Error creating address:', error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setPending(false);
    }
  };
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
  async function onEditAddress(formdata) {
    try {
      setPending(true);
      const token = localStorage.getItem("token");
      const res = await editAddressApi(formdata, token);
      console.log(res);
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

      // Clean up the object URL when the component unmounts or the file changes
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

  useEffect(() => {
    (async () => {
      if (currentUser.id) {
        const { data } = await getReferralApi(currentUser?.id);
        setReferralLink(data?.referrals[0]?.referral_code);
      }
    })();
  }, [currentUser?.id]);

  async function onEditProfile(e) {
    e.preventDefault();
    const formdata = new FormData();
    Object.keys(profileData).forEach((key) => {
      formdata.append(key, profileData[key]);
    });

    try {
      setPending(true);
      if (!currentUser.id) return null;
      const { data } = await editProfileApi(formdata, currentUser.id);

      // Update the local storage with the new data
      const updatedUser = { ...currentUser, profile: data.profile };
      // localStorage.setItem("theUser", JSON.stringify(updatedUser));

      setCurrentUser(updatedUser);
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
            {/* <div
            onClick={() => handleSectionChange("Payment Method")}
            className={`cursor-pointer pl-5  mt-[40px] text-[14px] font-medium cursor-pointer ${
              activeSection === "Payment Method"
                ? "border-l-[4px] border-[#F70000] pl-2"
                : "text-[#8B8B8B] "
            }`}
          >
            Payment Method
          </div> */}
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
              onClick={() => handleSectionChange("referral")}
              className={`cursor-pointer  mt-[40px] pl-5 text-[14px] font-medium cursor-pointer ${activeSection === "referral"
                ? "border-l-[4px] border-[#F70000] pl-2"
                : "text-[#8B8B8B] "
                }`}
            >
              Referrals
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
                  {profileImg || profileData.image ? (
                    <Image
                      alt="profile"
                      width={120}
                      height={120}
                      src={profileImg ? profileImg : profileData.image}
                      className="rounded-full w-[100%] h-[100%] absolute top-0 right-0"
                    />
                  ) : (
                    <div className="rounded-full w-[100%] h-[100%] absolute top-0 right-0 bg-gray-200 flex items-center justify-center">
                      <span>No Image</span>
                    </div>
                  )}
                  <label htmlFor="profile">
                    <FaCamera
                      className="absolute cursor-pointer text-black/65 top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%]"
                      size={30}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center gap-4">
                  <div className="flex-col mt-[30px] lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%]">
                    <label className="text-[16px] font-semibold">
                      First Name *
                    </label>
                    <input
                      onChange={profileDataHandler}
                      placeholder="Enter First Name"
                      name="first_name"
                      value={profileData.first_name}
                      className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                    />
                  </div>
                  <div className="flex-col mt-[30px] lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%]">
                    <label className="text-[16px] font-semibold">
                      Last Name *
                    </label>
                    <input
                      onChange={profileDataHandler}
                      placeholder="Enter Last Name"
                      name="last_name"
                      value={profileData.last_name}
                      className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                    />
                  </div>
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
                    value={profileData.phone}
                    className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                  />
                </div>
                <div className="flex-col mt-[30px]">
                  <label className="text-[16px] font-semibold">Email *</label>
                  <input
                    onChange={profileDataHandler}
                    placeholder="Enter Email"
                    type="email"
                    name="email"
                    value={currentUser.email}
                    className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                  />
                </div>
                <div className="flex-col mt-[30px]">
                  <label className="text-[16px] font-semibold">Country</label>
                  <input
                    onChange={profileDataHandler}
                    placeholder="Enter Country"
                    name="country"
                    value={profileData.country}
                    className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center gap-4">
                  <div className="flex-col mt-[30px] lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%]">
                    <label className="text-[16px] font-semibold">City</label>
                    <input
                      onChange={profileDataHandler}
                      placeholder="Enter City"
                      name="city"
                      value={profileData.city}
                      className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                    />
                  </div>
                  <div className="flex-col mt-[30px] lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%]">
                    <label className="text-[16px] font-semibold">State</label>
                    <input
                      onChange={profileDataHandler}
                      placeholder="Enter State"
                      name="state"
                      value={profileData.state}
                      className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex-col mt-[30px]">
                  <label className="text-[16px] font-semibold">Address</label>
                  <input
                    onChange={profileDataHandler}
                    placeholder="Enter Address"
                    name="address"
                    value={profileData.address}
                    className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                  />
                </div>
                <div className="flex-col mt-[30px]">
                  <label className="text-[16px] font-semibold">Pincode</label>
                  <input
                    onChange={profileDataHandler}
                    placeholder="Enter Pincode"
                    name="pincode"
                    value={profileData.pincode}
                    className="border-[1px] mt-[9px] border-[#7777777] w-full rounded-md h-[50px] p-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center justify-between mt-[30px]">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-[#F70000] disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none rounded-2xl h-[50px]  lg:w-[181px] w-[100%] text-[18px] font-medium text-white"
                  >
                    Update Profile
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
                <CustomModal
                  showModal={showModelDelete}
                  onClose={handleCloseModelDelete}
                >
                  <div className="p-4 sm:p-6 relative w-full max-w-[100%] sm:max-w-md mx-auto sm:rounded-lg">
                    <h2 className="text-xl sm:text-2xl text-center font-bold text-gray-800 mb-3 sm:mb-4">
                      Delete Account
                    </h2>
                    <p className="text-sm sm:text-base text-center text-gray-600 mb-3 sm:mb-4">
                      Deleting your account will remove all your information
                      from our database. This action cannot be undone.
                    </p>
                    <input
                      className="border border-gray-300 w-full sm:rounded-md h-10 sm:h-12 px-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-3 sm:mb-4"
                      placeholder="Type 'Delete' to confirm"
                    />
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                      <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 sm:rounded-md h-10 sm:h-12 w-full text-sm sm:text-base font-medium transition-colors"
                        onClick={handleCloseModelDelete}
                      >
                        Cancel
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 sm:rounded-md h-10 sm:h-12 w-full text-sm sm:text-base font-medium text-white transition-colors"
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
                      Deactivating your account will hide your profile and
                      content from other users. You can reactivate your account
                      at any time by logging in.
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
              </form>
            )}

            {activeSection === "Orders" &&
              (userOrders && userOrders.length > 0 ? (
                userOrders.map((item, index) => (
                  <MyorderCard
                    setHasOrderCanceled={setHasOrderCanceled}
                    key={index}
                    order={item}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 mt-5">
                  No orders Found...
                </div>
              ))}

            {activeSection === "Manage Address" && (
              <>
                <form action={onEditAddress}>
                  {allAddress?.map((item, index) => (
                    <div
                      style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
                      className="rounded-3xl p-[20px] w-full h-auto hover:border-[#F70000] border-[1px] "
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
                          <Image
                            src={Location}
                            alt=""
                            className="w-[18px] h-[23px] mr-2"
                          />
                          <p className="text-[14px] font-medium text-[#777777] ">
                            {currentUser.profile?.city || "No City Added"}
                          </p>
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
                      <label className="block text-sm font-medium mb-1">Pin Code</label>
                      <input
                        name="pin_code"
                        required
                        placeholder="Pin Code"
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
            {/* {activeSection === "Payment Method" && (
            <div>
              <div
                style={{ boxShadow: " 0px 4px 29px 0px #0000000A" }}
                className="w-full rounded-3xl border-[1px] border-[#00000014] p-[16px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-[#191919]">
                    <Image
                      src={PayPal}
                      alt=""
                      className="w-[36px] h-[36px] mr-[20px]"
                    />
                    <p className="text-[16px] font-medium">Paypal</p>
                  </div>
                  <p className="text-[16px] font-medium">Link Account</p>
                </div>
              </div>
              <div
                style={{ boxShadow: " 0px 4px 29px 0px #0000000A" }}
                className="w-full rounded-3xl mt-[16px] border-[1px] border-[#00000014] p-[16px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-[#191919]">
                    <Image
                      src={Visa}
                      alt=""
                      className="w-[36px] h-[36px] mr-[20px]"
                    />
                    <p className="text-[16px] font-medium">Paypal</p>
                  </div>
                  <p className="text-[16px] font-medium">Link Account</p>
                </div>
              </div>
              <div
                style={{ boxShadow: " 0px 4px 29px 0px #0000000A" }}
                className="w-full rounded-3xl mt-[16px] border-[1px] border-[#00000014] p-[16px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-[#191919]">
                    <Image
                      src={Google}
                      alt=""
                      className="w-[36px] h-[36px] mr-[20px]"
                    />
                    <p className="text-[16px] font-medium">Paypal</p>
                  </div>
                  <p className="text-[16px] font-medium">Link Account</p>
                </div>
              </div>
              <div
                style={{ boxShadow: " 0px 4px 29px 0px #0000000A" }}
                className="w-full rounded-3xl mt-[16px] border-[1px] border-[#00000014] p-[16px]"
              >
                <div className="flex items-center">
                  <div className="rounded-full border-[0.5px] border-[#00000014] w-[20px] h-[20px]"></div>
                  <Image
                    src={Card}
                    alt=""
                    className="w-[24px] h-[20px] mr-[20px] ml-4"
                  />
                  <p className="text-[16px] font-medium text-[#777777]">
                    Add New Credit/Debit Card
                  </p>
                </div>
                <div className="flex-col mt-[20px]">
                  <label className="text-[16px] font-semibold">
                    {" "}
                    Create New Password *
                  </label>
                  <input
                    placeholder="Enter Password"
                    className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                  />
                </div>{" "}
                <div className="flex-col mt-[20px]">
                  <label className="text-[16px] font-semibold">
                    {" "}
                    Create New Password *
                  </label>
                  <input
                    placeholder="Enter Password"
                    className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center gap-4">
                  <div className="flex-col mt-[20px] lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%]">
                    <label className="text-[16px] font-semibold">
                      {" "}
                      Create New Password *
                    </label>
                    <input
                      placeholder="Enter Password"
                      className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                    />
                  </div>
                  <div className="flex-col mt-[20px] lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%]">
                    <label className="text-[16px] font-semibold">
                      {" "}
                      Create New Password *
                    </label>
                    <input
                      placeholder="Enter Password"
                      className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    sx={{
                      color: "#F70000",
                      "& .MuiSvgIcon-root": {
                        fontSize: 34,
                      },
                      "&.Mui-checked": {
                        color: "#F70000",
                      },
                    }}
                  />
                  <p className="text-[14px] font-medium text-[#777777]">
                    Save card for future payment
                  </p>
                </div>
                <button className=" bg-[#F70000] rounded-full h-[50px] mt-[30px] w-[275px] text-[18px] font-medium text-white">
                  Add Payment
                </button>
              </div>
            </div>
          )} */}

            {activeSection === "referral" && (
              <div>
                <p className="text-[16px] font-medium text-[#777777]">
                  Referral Code
                </p>
                <input
                  value={referralLink}
                  readOnly
                  className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                />
                {referralLink?.trim() === "" ? (
                  <button
                    disabled={referralLink?.trim() !== "" || pending}
                    type="button"
                    onClick={generateRefLink}
                    className=" bg-[#F70000] rounded-full mx-auto h-[50px] mt-[30px] w-[275px] text-[18px] font-medium text-white"
                  >
                    {pending ? (
                      <BiLoader className="animate-spin h-5 w-5 mx-auto" />
                    ) : (
                      "Generate"
                    )}
                  </button>
                ) : (
                  <button
                    className=" bg-[#F70000] rounded-full mx-auto p-2 px-3 mt-[30px]  text-[18px] font-medium text-white"
                    onClick={copyToClipboard}
                  >
                    <BiCopy className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
            {activeSection === "Password Manager" && (
              <form
                action={onEditPassword}
                style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
                className="rounded-3xl p-[30px] w-full "
              >
                <div className="flex-col">
                  <label className="text-[16px] font-semibold">
                    {" "}
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
