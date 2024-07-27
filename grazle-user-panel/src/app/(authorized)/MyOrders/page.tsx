"use client";
import {
  getProfileApi,
  getBuyerOrdersApi,
  getCurrentUserRefsApi,
} from "@/apis";
import Image from "next/image";
import { FaCircleCheck } from "react-icons/fa6";
import Dots from "@/assets/Group 1820549907.png";
import CustomModal from "@/components/CustomModel";
import MyorderCard from "@/components/MyorderCard";
import React, { useEffect, useState } from "react";
import SkeletonLoader from "@/components/SkeletonLoader";

import BBB from "@/assets/Box.png";
import close from "@/assets/close.png";
import { Rating } from "@mui/material";
import CCC from "@/assets/Shipping.png";
import Chair from "@/assets/pngwing 2.png";
import DDD from "@/assets/sort by time.png";
import AAA from "@/assets/Health Report.png";
import { PiCameraThin } from "react-icons/pi";
import { FaCheckCircle } from "react-icons/fa";
import Shoes from "@/assets/Rectangle 2032.png";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { AiFillCloseCircle } from "react-icons/ai";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { IoCloseSharp, IoLockClosed } from "react-icons/io5";

export default function Leave() {
  const [meta, setMeta] = useState({});
  const [orders, setOrders] = useState([]);
  const [showleave, setShowLeave] = useState(false);
  const [showConfirm, setShowconfirm] = useState(false);
  const [showSendModel, setShowSendModel] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("Active");
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  useEffect(() => {
    (async () => {
      const { data } = await getProfileApi();

      const res = await getCurrentUserRefsApi(data.user.id);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await getBuyerOrdersApi();
      setOrders(data.orders);
      setMeta(data.meta);
      console.log("my orders", data);
    })();
  }, []);

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
    }, 1000);
  };

  const handleOpeneModel = () => {
    setShowSendModel(true);
  };

  const handleCloseModel = () => {
    setShowSendModel(false);
  };
  const [isDivVisible, setIsDivVisible] = useState(false);

  const handleButtonClick = () => {
    setIsDivVisible((prev) => !prev);
  };

  return (
    <div className="lg:my-[50px] my-[20px] sm:my-[20px] md:my-[30px] lg:mx-[150px] mx-[20px] sm:mx-[20px] md:mx-[30px]">
      <div
        style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
        className="rounded-3xl p-[20px] w-[100%] gap-8 md:justify-start justify-center flex items-algin "
      >
        <p
          onClick={() => handleSectionChange("Active")}
          className={`lg:text-[16px] text-[10px] md:text-[14px]  font-normal cursor-pointer ${
            activeSection === "Active"
              ? "border-b-[4px] border-[#F70000] font-semibold"
              : "text-[#8B8B8B]"
          }`}
        >
          Active orders
        </p>

        <p
          onClick={() => handleSectionChange("Completed")}
          className={`lg:text-[16px] text-[10px] md:text-[14px] font-normal cursor-pointer ${
            activeSection === "Completed"
              ? "border-b-[4px] border-[#F70000] font-semibold"
              : "text-[#8B8B8B]"
          }`}
        >
          Completed orders
        </p>

        <p
          onClick={() => handleSectionChange("Cancelled")}
          className={`lg:text-[16px] text-[10px] md:text-[14px] font-normal cursor-pointer ${
            activeSection === "Cancelled"
              ? "border-b-[4px] border-[#F70000] font-semibold"
              : "text-[#8B8B8B]"
          }`}
        >
          Cancelled orders
        </p>
      </div>

      {activeSection === "Active" && (
        <>
          {!orders?.length ? (
            <SkeletonLoader />
          ) : (
            orders.map((order: any) => {
              return (
                <MyorderCard
                  status={["in_progress", "new", "shipped"]}
                  order={order}
                />
              );
            })
          )}

          <CustomModal showModal={showConfirm}>
            <div className="flex-col justify-center w-[800px]">
              <div className="mx-[150px] my-[100px]">
                <div className="flex justify-center mb-[22px]">
                  <Image src={Dots} alt="" className="h-[64px] w-[64px]" />

                  <FaCircleCheck className="text-[#E24C4B] h-[105px] mx-[16px] w-[105px]" />
                  <Image src={Dots} alt="" className="h-[64px] w-[64px]" />
                </div>

                <p className="text-[24px] mt-10 text-center font-bold text-[#434343]">
                  You Have Successfully purchased Prime Plan. Your order has
                  been successfully cancelled.{" "}
                </p>
              </div>
            </div>
          </CustomModal>
        </>
      )}

      {activeSection === "Completed" && (
        <>
          {!orders?.length ? (
            <SkeletonLoader />
          ) : (
            orders.map((order: any) => {
              return <MyorderCard status={["completed"]} order={order} />;
            })
          )}
        </>
      )}

      {activeSection === "Cancelled" && (
        <>
          {!orders?.length ? (
            <SkeletonLoader />
          ) : (
            orders.map((order: any) => {
              return <MyorderCard status={["cancelled"]} order={order} />;
            })
          )}
        </>
      )}
    </div>
  );
}

//  <div>
// <div
//   style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
//   className="w-100 rounded-3xl p-6 mt-6 hover:border-[1px] border-[#F70000]"
// >
//   <div className="flex  items-center justify-between">
//     <div className="border-[1px] border-[#777777] rounded-full w-[230px] px-4 py-2 flex items-center">
//       <IoLockClosed className="w-[14px] h-[14px] mr-2" />
//       <p className="text-[14px] font-normal text-[#777777]">
//         Yesterday, 12 jan, 2024
//       </p>
//     </div>
//   </div>
//   <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center lg:gap-[80px] mt-5">
//     <div className="flex items-center">
//       <div className="h-[100px] bg-[#F700000D] flex items-center justify-center w-[100px] rounded-2xl mr-5">
//         <Image src={Chair} alt="" className="w-[60px] h-[60px]" />
//       </div>
//       <div className="lg:w-[200px]">
//         <p className="text-[18px] font-medium ">Wear Saka Store </p>
//         <p className="text-[16px] mt-2 text-[#777777] font-medium">
//           Color: Grey
//         </p>
//         <p className="text-[16px] text-[#777777] mt-3 font-medium">
//           Size 10.5 UK
//         </p>
//       </div>
//     </div>
//     <p className="lg:text-[24px] text-[16px] sm:text-[16px] md:text-[18px] text-[#777777] mt-3 lg:mt-0 sm:mt-3 mr-2 lg:mr-0  font-medium">
//       Quantity 4
//     </p>
//     <p className="lg:text-[24px] text-[16px] sm:text-[16px] md:text-[18px] text-[#777777] mt-3 lg:mt-0 sm:mt-3 lg:ml-[0px] ml-[70px] sm:ml-[70px]  font-medium">
//       Price: $567.00
//     </p>
//     <div className="mt-3 lg:block flex sm:flex lg:mt-0 sm:mt-3">
//       <button className=" mr-4 bg-[#00F7630F] rounded-2xl h-[50px] outline-[2px] outline-[#26F63B] outline-dashed  lg:w-[181px] w-[130px] lg:text-[18px] text-[14px] sm:text-[14px] lg:ml-auto font-medium text-[#07D459]">
//         Completed
//       </button>
//       <button
//         className=" bg-[#FFFAF4] lg:mt-3 mt-0 outline-[2px] outline-[#F69B26] outline-dashed rounded-2xl h-[50px] lg:w-[181px] w-[130px] lg:w-[181px] sm:w-[100px]   lg:text-[18px] text-[14px] sm:text-[14px] font-medium text-[#F69B26]"
//         onClick={handleOpeneModelLeave}
//       >
//         Leave Review
//       </button>
//     </div>
//   </div>
// </div>
// <div
//   // style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
//   className="w-100 rounded-3xl p-6 mt-6 hover:border-[1px] border-[#F70000]"
// >
//   <div className="flex  items-center justify-between">
//     <div className="border-[1px] border-[#777777] rounded-full w-[230px] px-4 py-2 flex items-center">
//       <IoLockClosed className="w-[14px] h-[14px] mr-2" />
//       <p className="text-[14px] font-normal text-[#777777]">
//         Yesterday, 12 jan, 2024
//       </p>
//     </div>
//   </div>
//   <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center lg:gap-[80px] mt-5">
//     <div className="flex items-center">
//       <div className="h-[100px] bg-[#F700000D] flex items-center justify-center w-[100px] rounded-2xl mr-5">
//         <Image src={Chair} alt="" className="w-[60px] h-[60px]" />
//       </div>
//       <div className="lg:w-[200px]">
//         <p className="text-[18px] font-medium ">Wear Saka Store </p>
//         <p className="text-[16px] mt-2 text-[#777777] font-medium">
//           Color: Grey
//         </p>
//         <p className="text-[16px] text-[#777777] mt-3 font-medium">
//           Size 10.5 UK
//         </p>
//       </div>
//     </div>
//     <p className="lg:text-[24px] text-[16px] sm:text-[16px] md:text-[18px] text-[#777777] mt-3 lg:mt-0 sm:mt-3 mr-2 lg:mr-0  font-medium">
//       Quantity 4
//     </p>
//     <p className="lg:text-[24px] text-[16px] sm:text-[16px] md:text-[18px] text-[#777777] mt-3 lg:mt-0 sm:mt-3 lg:ml-[0px] ml-[70px] sm:ml-[70px]  font-medium">
//       Price: $567.00
//     </p>
//     <div className="mt-3 lg:block flex sm:flex lg:mt-0 sm:mt-3">
//       <button className=" mr-4 bg-[#00F7630F] rounded-2xl h-[50px] outline-[2px] outline-[#26F63B] outline-dashed  lg:w-[181px] w-[130px] lg:text-[18px] text-[14px] sm:text-[14px] lg:ml-auto font-medium text-[#07D459]">
//         Completed
//       </button>
//       <button
//         className=" bg-[#FFFAF4] lg:mt-3 mt-0 outline-[2px] outline-[#F69B26] outline-dashed rounded-2xl h-[50px] lg:w-[181px] w-[130px] lg:w-[181px] sm:w-[100px]   lg:text-[18px] text-[14px] sm:text-[14px] font-medium text-[#F69B26]"
//         onClick={handleOpeneModelLeave}
//       >
//         Leave Review
//       </button>
//     </div>
//   </div>
// </div>
// <div
//   style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
//   className="w-100 rounded-3xl p-6 mt-6 hover:border-[1px] border-[#F70000]"
// >
//   <div className="flex  items-center justify-between">
//     <div className="border-[1px] border-[#777777] rounded-full w-[230px] px-4 py-2 flex items-center">
//       <IoLockClosed className="w-[14px] h-[14px] mr-2" />
//       <p className="text-[14px] font-normal text-[#777777]">
//         Yesterday, 12 jan, 2024
//       </p>
//     </div>
//   </div>
//   <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center lg:gap-[80px] mt-5">
//     <div className="flex items-center">
//       <div className="h-[100px] bg-[#F700000D] flex items-center justify-center w-[100px] rounded-2xl mr-5">
//         <Image src={Chair} alt="" className="w-[60px] h-[60px]" />
//       </div>
//       <div className="lg:w-[200px]">
//         <p className="text-[18px] font-medium ">Wear Saka Store </p>
//         <p className="text-[16px] mt-2 text-[#777777] font-medium">
//           Color: Grey
//         </p>
//         <p className="text-[16px] text-[#777777] mt-3 font-medium">
//           Size 10.5 UK
//         </p>
//       </div>
//     </div>
//     <p className="lg:text-[24px] text-[16px] sm:text-[16px] md:text-[18px] text-[#777777] mt-3 lg:mt-0 sm:mt-3 mr-2 lg:mr-0  font-medium">
//       Quantity 4
//     </p>
//     <p className="lg:text-[24px] text-[16px] sm:text-[16px] md:text-[18px] text-[#777777] mt-3 lg:mt-0 sm:mt-3 lg:ml-[0px] ml-[70px] sm:ml-[70px]  font-medium">
//       Price: $567.00
//     </p>
//     <div className="mt-3 lg:block flex sm:flex lg:mt-0 sm:mt-3">
//       <button className=" mr-4 bg-[#00F7630F] rounded-2xl h-[50px] outline-[2px] outline-[#26F63B] outline-dashed  lg:w-[181px] w-[130px] lg:text-[18px] text-[14px] sm:text-[14px] lg:ml-auto font-medium text-[#07D459]">
//         Completed
//       </button>
//       <button
//         className=" bg-[#FFFAF4] lg:mt-3 mt-0 outline-[2px] outline-[#F69B26] outline-dashed rounded-2xl h-[50px] lg:w-[181px] w-[130px] lg:w-[181px] sm:w-[100px]   lg:text-[18px] text-[14px] sm:text-[14px] font-medium text-[#F69B26]"
//         onClick={handleOpeneModelLeave}
//       >
//         Leave Review
//       </button>
//     </div>
//   </div>
// </div>
// <CustomModal showModal={showleave}>
//   <div className="flex-col justify-center w-[800px]">
//     <div className="w-[100%] rounded-[30px] p-[30px]">
//       <p className="text-[40px]  font-medium">Write a Review</p>
//       <p className="text-[20px]  font-semibold  mt-3">
//         Rate the Product
//       </p>
//       <Rating
//         name="read-only"
//         mt-3
//         defaultValue={2}
//         readOnly
//         sx={{
//           "& .MuiSvgIcon-root": {
//             fontSize: 50,
//           },
//         }}
//       />

//       <div className="flex items-center gap-5 mt-5">
//         <div className="w-[50%]">
//           <label className="text-[16px] font-semibold text-[#777777]">
//             Name
//           </label>
//           <input
//             className="border-[1px] border-[#0000061]  w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
//             placeholder="Email Address"
//           />
//         </div>
//         <div className="w-[50%] ">
//           <label className="text-[16px] font-semibold text-[#777777]">
//             Email
//           </label>
//           <input
//             className="border-[1px] border-[#0000061]  w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
//             placeholder="Email"
//           />
//         </div>
//       </div>
//       <div className="mt-5">
//         <label className="text-[16px] font-semibold text-[#777777]">
//           Messsage
//         </label>
//         <textarea
//           className="border-[1px] border-[#0000061] resize-none  w-full rounded-md h-[100px] p-3 focus:outline-none placeholder:text-[#777777]"
//           placeholder="Messsage"
//         />
//       </div>
//       <div className="flex items-center justify-between gap-4 mt-5">
//         <Image
//           src={Shoes}
//           className="rounded-2xl w-[130px] h-[130px]"
//           alt=""
//         />
//         <Image
//           src={Shoes}
//           className="rounded-2xl w-[130px] h-[130px]"
//           alt=""
//         />
//         <Image
//           src={Shoes}
//           className="rounded-2xl w-[130px] h-[130px]"
//           alt=""
//         />
//         <Image
//           src={Shoes}
//           className="rounded-2xl w-[130px] h-[130px]"
//           alt=""
//         />
//         <div className=" w-[130px] h-[130px] border-[3px] rounded-2xl border-[#F70000] flex justify-center items-center">
//           <PiCameraThin className="h-[90px] w-[90px] text-[#F70000]" />
//         </div>
//       </div>
//       <div className="flex mt-5 items-center gap-6">
//         <button className=" bg-[#F70000] rounded-xl h-[50px]  mt-[30px] w-[230px] text-[18px] font-medium text-white">
//           Submit
//         </button>
//         <button
//           className=" bg-[#F69B26] rounded-xl h-[50px] mt-[30px] w-[230px] text-[18px] font-medium text-white"
//           onClick={handelCloseComplet}
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   </div>
// </CustomModal>
// </div>
// }
