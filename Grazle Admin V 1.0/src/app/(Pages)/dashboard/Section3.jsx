import Image from "next/image";
import React from "react";
import electronicLED from "@/assets/Electronic-LED.png";
import { cn } from "@/lib/utils";
import OrderTable from "@/components/OrderTable";

const Section3 = ({ allOrders }) => {
  console.log(allOrders);
  return (
    <div className="my-[30px] px-[25px] py-[20px] bg-white rounded-[8px] shadow-sm overflow-x-auto w-[94vw] md:w-[67vw] lg:w-[75vw] xl:w-auto">
      <h2 className="text-lg font-bold my-2">Recent Orders</h2>
      <table className="w-[1000px] xl:w-[100%] table-fixed">
        <thead>
          <tr className="font-[500] text-[var(--text-color-body)] text-[15px]">
            <td>Order No</td>
            <td>Product Name</td>
            <td>Price</td>
            {/* <td>Seller</td> */}
            <td>Date</td>
            <td className="">Status</td>
            <td className="">Seller Name</td>
          </tr>
        </thead>
        <tbody>
          {allOrders?.map((item) => (
            <OrderTable order={item} key={item?.id} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Section3;
