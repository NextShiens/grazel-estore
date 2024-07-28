"use client";
import React, { useEffect, useState, useTransition } from "react";
import Location from "@/assets/layer1.png";
import Home from "@/assets/Vectorhome.png";
import { Avatar, Checkbox, Radio } from "@mui/material";
import CustomModal from "@/components/CustomModel";
import { MdDelete, MdOutlineDeleteOutline, MdUpdate } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaCircleCheck } from "react-icons/fa6";
import Dots from "@/assets/Group 1820549907.png";
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
  deleteuserApi,
} from "@/apis";
import { toast } from "react-toastify";
import { logout } from "@/lib";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MyorderCard from "@/components/MyorderCard";
import { BiCopy, BiLoader } from "react-icons/bi";
import Auth from "@/components/Auth";
import SkeletonLoader from "@/components/SkeletonLoader";
import { UseSelector } from "react-redux";

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

  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    address: "",
    phone: "",
    gender: "",
    image: "",
  });
  const [meta, setMeta] = useState({});
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
      console.log("my orders", data.orders);
    } catch (e) {}
  };

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

  const deleteuser = async () => {
    
    console.log("delete user");
    try {
      let formdata: any = [];
      setPending(true);
      await deleteuserApi(formdata);
      toast.success("User has been deleted");
      router.push("/signIn");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setTimeout(() => {
        setPending(false);
      }, 500);
    }
  };

  async function onEditPassword(formdata) {
    debugger;
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
  async function onCreateAddress(formdata) {
    try {
      setPending(true);

      const res = await createAddressApi(formdata);

      setAllAddress([...allAddress, res?.data?.address]);
      toast.success("Address has been created");
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

  async function onEditAddress(formdata) {
    debugger;
    try {
      setPending(true);
      const res = await editAddressApi(formdata, addressId);
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

  async function onEditProfile(e) {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("first_name", profileData.first_name);
    formdata.append("last_name", profileData.last_name);
    formdata.append("address", profileData.address);
    formdata.append("phone", profileData.phone);
    formdata.append("gender", profileData.gender);
    formdata.append("image", profileData.image);
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
  console.log(currentUser);

  return (
    <Auth>
      <div className="lg:my-[20px] my-[20px] sm:my-[20px] md:my-[30px] lg:mx-[150px] mx-[20px] sm:mx-[20px] md:mx-[30px]">
        <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-start gap-6 h-auto">
          <div
            style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
            className="rounded-3xl p-[30px] lg:w-[23%] w-[100%] "
          >
            <div
              onClick={() => handleSectionChange("Personal Info")}
              className={`cursor-pointer pl-5 text-[14px] font-medium cursor-pointer ${
                activeSection === "Personal Info"
                  ? "border-l-[4px] border-[#F70000] pl-2"
                  : "text-[#8B8B8B] "
              }`}
            >
              Personal Information
            </div>
            <div
              onClick={() => handleSectionChange("Orders")}
              className={`cursor-pointer pl-5  mt-[40px] text-[14px] font-medium cursor-pointer ${
                activeSection === "Orders"
                  ? "border-l-[4px] border-[#F70000] pl-2"
                  : "text-[#8B8B8B]"
              }`}
            >
              My Orders
            </div>
            <div
              onClick={() => handleSectionChange("Manage Address")}
              className={`cursor-pointer pl-5  mt-[40px] text-[14px] font-medium cursor-pointer ${
                activeSection === "Manage Address"
                  ? "border-l-[4px] border-[#F70000] pl-2"
                  : "text-[#8B8B8B] "
              }`}
            >
              Manage Address
            </div>
            <div
              onClick={() => handleSectionChange("Password Manager")}
              className={`cursor-pointer  mt-[40px] pl-5 text-[14px] font-medium cursor-pointer ${
                activeSection === "Password Manager"
                  ? "border-l-[4px] border-[#F70000] pl-2"
                  : "text-[#8B8B8B] "
              }`}
            >
              Password Manager
            </div>

            <div
              onClick={handelLogout}
              className={`cursor-pointer  mt-[40px] pl-5  text-[14px] font-medium cursor-pointer   ${
                activeSection === "Logouts"
                  ? "border-l-[4px] border-[#F70000] pl-2"
                  : "text-[#8B8B8B] "
              }`}
            >
              Logouts
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
                {/* <Avatar className="w-[80px] h-[80px]" /> */}
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
                  <label className="text-[16px] font-semibold">Address</label>
                  <input
                    onChange={profileDataHandler}
                    placeholder="Enter Address"
                    name="address"
                    defaultValue={currentUser?.profile?.address}
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
                  <label className="text-[16px] font-semibold"> Gender *</label>
                  <select
                    name="gender"
                    onChange={profileDataHandler}
                    className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                  >
                    <option value={"Male"}>Male</option>
                    <option value={"FeMale"}>FeMale</option>
                  </select>
                </div>
                <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center justify-between mt-[30px]">
                  <button
                    type="submit"
                    disabled={isPending}
                    className=" bg-[#F70000] disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none rounded-2xl h-[50px]  lg:w-[181px] w-[100%] text-[18px] font-medium text-white"
                  >
                    Update Change
                  </button>
                  <div className="flex items-center lg:mt-0  mt-3 sm:mt-3">
                    <MdOutlineDeleteOutline
                      className="text-[#F70000] lg:text-[28px] text-[20px] sm:text-[20px]  mr-[16px]"
                      onClick={handleOpenModelDelete}
                    />
                    <p className="cursor-pointer text-[#F70000] lg:text-[16px] text-[12px] sm:text-[14px] font-semibold mr-[16px]">
                      Delete Account
                    </p>
                  </div>
                </div>
              </form>
            )}
            <CustomModal showModal={showModelDelete}>
              <div className=" w-[620px] p-6">
                <p className="text-[40px] text-center font-bold text-[#777777]">
                  Delete Account
                </p>
                <p className="text-[20px]  font-medium text-[#777777] mt-[32px]">
                  Deleting your account may remove all your information From our
                  database, this can not be undone.
                </p>
                <p className="text-[14px] font-normal text-[#777777] mt-[18px]">
                  To Confirm this ype ‘Delete’
                </p>
                <div className="flex items-center gap-4 mt-[4px]">
                  <input className="border-[1px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"></input>
                  <button
                    className=" bg-[#d63131] rounded-2xl h-[50px] w-[275px] text-[18px] font-medium text-white"
                    onClick={deleteuser}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </CustomModal>
            {activeSection === "Orders" && (
              <>
                <Auth>
                  <div className="">
                    <div
                      style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
                      className="rounded-3xl p-[20px] w-[100%] gap-8 md:justify-start justify-center flex items-algin "
                    >
                      <p
                        onClick={() => handleSectionChanges("Active")}
                        className={`lg:text-[16px] text-[10px] md:text-[14px]  font-normal cursor-pointer ${
                          activeSections === "Active"
                            ? "border-b-[4px] border-[#F70000] font-semibold"
                            : "text-[#8B8B8B]"
                        }`}
                      >
                        Active orders
                      </p>

                      <p
                        onClick={() => handleSectionChanges("Completed")}
                        className={`lg:text-[16px] text-[10px] md:text-[14px] font-normal cursor-pointer ${
                          activeSections === "Completed"
                            ? "border-b-[4px] border-[#F70000] font-semibold"
                            : "text-[#8B8B8B]"
                        }`}
                      >
                        Completed orders
                      </p>

                      <p
                        onClick={() => handleSectionChanges("Cancelled")}
                        className={`lg:text-[16px] text-[10px] md:text-[14px] font-normal cursor-pointer ${
                          activeSections === "Cancelled"
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
                          <SkeletonLoader />
                        ) : (
                          orders.map((order: any) => {
                            return (
                              <MyorderCard
                                status={["in_progress", "new", "shipped"]}
                                order={order}
                                getMyAllOrders={getMyAllOrders}
                              />
                            );
                          })
                        )}

                        <CustomModal showModal={showConfirm}>
                          <div className="flex-col justify-center w-[800px]">
                            <div className="mx-[150px] my-[100px]">
                              <div className="flex justify-center mb-[22px]">
                                <Image
                                  src={Dots}
                                  alt=""
                                  className="h-[64px] w-[64px]"
                                />

                                <FaCircleCheck className="text-[#E24C4B] h-[105px] mx-[16px] w-[105px]" />
                                <Image
                                  src={Dots}
                                  alt=""
                                  className="h-[64px] w-[64px]"
                                />
                              </div>

                              <p className="text-[24px] mt-10 text-center font-bold text-[#434343]">
                                You Have Successfully purchased Prime Plan. Your
                                order has been successfully cancelled.{" "}
                              </p>
                            </div>
                          </div>
                        </CustomModal>
                      </>
                    )}

                    {activeSections === "Completed" && (
                      <>
                        {!orders?.length ? (
                          <SkeletonLoader />
                        ) : (
                          orders.map((order: any) => {
                            return (
                              <MyorderCard
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
                          <SkeletonLoader />
                        ) : (
                          orders.map((order: any) => {
                            return (
                              <MyorderCard
                                status={["cancelled"]}
                                order={order}
                              />
                            );
                          })
                        )}
                      </>
                    )}
                  </div>
                </Auth>
              </>
            )}

            {activeSection === "Manage Address" && (
              <>
                <form action={onEditAddress}>
                  {allAddress?.map((item, index) => (
                    <div
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
                          <Image
                            src={Location}
                            alt=""
                            className="w-[18px] h-[23px] mr-2"
                          />
                          <p className="text-[14px] font-medium text-[#777777] ">
                            New, York
                          </p>
                        </div>
                        <div className="flex items-center ">
                          <div className="flex items-center justify-center border-[1px] border-[#BABABA] rounded-md w-[55px] h-[35px] mr-3">
                            {editEnabled !== item?.id ? (
                              <FiEdit
                                className={`${
                                  editEnabled === item?.id
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
                <form
                  action={onCreateAddress}
                  style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
                  className="rounded-3xl p-[30px] w-full mt-6 "
                >
                  <p className="text-[24px] font-semibold">Add New Address</p>
                  <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap   items-center gap-4  ">
                    <div className="flex-col mt-[30px] lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%]">
                      <label className="text-[16px] font-semibold">Name</label>
                      <input
                        placeholder="Enter Your Name "
                        name="recipient_name"
                        required
                        className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex-col mt-[30px]">
                    <label className="text-[16px] font-semibold">
                      Address Title
                    </label>
                    <input
                      placeholder="Address Title e.g Home/Office etc"
                      required
                      name="address_label"
                      className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                    />
                  </div>
                  <div className="flex-col mt-[30px]">
                    <label className="text-[16px] font-semibold">
                      Street Address
                    </label>
                    <input
                      placeholder="Address"
                      name="address"
                      required
                      className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                    />
                  </div>
                  <div className="flex-col mt-[30px]">
                    <label className="text-[16px] font-semibold">
                      Phone Number
                    </label>
                    <input
                      placeholder="Phone Number"
                      name="recipient_phone"
                      required
                      className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                    />
                  </div>
                  <div className="flex-col mt-[30px]">
                    <label className="text-[16px] font-semibold">Note</label>
                    <input
                      placeholder="Note"
                      name="note"
                      required
                      className="border-[1px] mt-[9px] border-[#7777777]  w-full rounded-md h-[50px] p-3 focus:outline-none"
                    />
                  </div>
                  <div className=" mt-[30px]">
                    <button
                      disabled={isPending}
                      type="submit"
                      className=" bg-[#F70000] disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none rounded-2xl h-[50px]  w-[181px] text-[18px] font-medium text-white"
                    >
                      Add Address
                    </button>
                  </div>
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
                <CustomModal showModal={showSendModel}>
                  <form action={onLogout} className=" w-[400px] p-6">
                    <p className="text-[40px] text-center font-bold text-[#191919]">
                      Logout
                    </p>
                    <p className="text-center font-medium text-[#777777] mt-[16px]">
                      Are you sure you want to log out?
                    </p>
                    <div className="flex justify-center">
                      <button
                        type="submit"
                        className=" bg-[#F70000]  rounded-full h-[50px] mt-[24px] w-[275px] text-[18px] font-medium text-white"
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
    </Auth>
  );
}
