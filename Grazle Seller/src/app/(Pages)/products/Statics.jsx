import React from "react";
import Image from "next/image";
import { Circle } from "rc-progress";

import { FaArrowUp, FaArrowDown } from "react-icons/fa6";
import StaticsGraph from "../../../components/staticsGraph";
import StaticsBarGraph from "../../../components/staticsBarGraph";

import electronicLED from "../../../assets/Electronic-LED.png";

const Statics = () => {
  return (
    <div className="pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        <div className="flex-1 bg-white px-[20px] py-[30px] rounded-[8px] shadow-sm flex justify-between items-center">
          <div>
            <div className="h-[32px] rounded-[44px] px-3 bg-[#E9FFF6] text-[#06E775] flex gap-1 items-center w-[max-content]">
              <FaArrowUp />
              <label className="text-[12px]">33.77 %</label>
            </div>
            <p className="mt-4 mb-1">Total Sales</p>
            <p className="text-[32px] text-black font-[600]">1000</p>
          </div>
          <div className="flex items-center justify-center">
            <Circle
              percent={90}
              strokeWidth={10}
              trailWidth={10}
              trailColor={"#F4F7FE"}
              strokeColor="#FFB800"
              style={{ width: "90px" }}
            />
            <p className="text-[20px] text-center absolute font-[500]">90%</p>
          </div>
        </div>
        <div className="flex-1 bg-white px-[20px] py-[30px] rounded-[8px] shadow-sm flex justify-between items-center">
          <div>
            <div className="h-[32px] rounded-[44px] px-3 bg-[#FFF2F2] text-[#F70000] flex gap-1 items-center w-[max-content]">
              <FaArrowDown />
              <label className="text-[12px]">33.77 %</label>
            </div>
            <p className="mt-4 mb-1">Conversation Rates</p>
            <p className="text-[32px] text-black font-[600]">500</p>
          </div>
          <div className="flex items-center justify-center">
            <Circle
              percent={60}
              strokeWidth={10}
              trailWidth={10}
              trailColor={"#FFF2F2"}
              strokeColor="#F70000"
              style={{ width: "90px" }}
            />
            <p className="text-[20px] text-center absolute font-[500]">60%</p>
          </div>
        </div>
        <div className="flex-1 bg-white px-[20px] py-[30px] rounded-[8px] shadow-sm flex justify-between items-center">
          <div>
            <div className="h-[32px] rounded-[44px] px-3 bg-[#E9FFF6] text-[#06E775] flex gap-1 items-center w-[max-content]">
              <FaArrowUp />
              <label className="text-[12px]">33.77%</label>
            </div>
            <p className="mt-4 mb-1">Average Order Value</p>
            <p className="text-[32px] text-black font-[600]">₹45,000</p>
          </div>
          <div className="flex items-center justify-center">
            <Circle
              percent={70}
              strokeWidth={10}
              trailWidth={10}
              trailColor={"#F4F7FE"}
              strokeColor="#00A1FF"
              style={{ width: "90px" }}
            />
            <p className="text-[20px] text-center absolute font-[500]">70%</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col xl:flex-row gap-5 mt-[20px]">
        <div className="xl:w-[60%] bg-white shadow-sm rounded-[8px]">
          <StaticsGraph />
        </div>
        <div className="xl:w-[40%] bg-white rounded-[8px] shadow-sm">
          <p className="text-[27px] font-[600] text-center mt-3 mb-1">₹2098</p>
          <p className="text-[18px] text-center mb-6">
            Average sales this week
          </p>
          <StaticsBarGraph />
        </div>
      </div>
      <div className="mt-[20px] flex flex-col xl:flex-row gap-5">
        <div className="p-5 bg-white rounded-[8px] xl:w-[60%]">
          <p className="text-[24px] font-[600]">Recent Orders</p>
          <table className="w-[100%] mt-2">
            <thead>
              <tr className="text-[var(--text-color-body)] font-[500] h-[50px]">
                <td>No</td>
                <td>Product Name</td>
                <td>Price</td>
                <td>Country</td>
                <td>Date</td>
                <td>Status</td>
              </tr>
            </thead>
            <tbody>
              <tr className="h-[45px]">
                <td>PK08656</td>
                <td className="flex gap-1 items-center pt-2.5">
                  <Image alt="" src={electronicLED} />
                  <p>Electric LED</p>
                </td>
                <td>₹111.00</td>
                <td>United State</td>
                <td>12 Jan, 2024</td>
                <td>
                  <div className="h-[25px] text-[11px] text-[#06E775] rounded-[5px] bg-green-100 flex justify-start items-center w-[max-content] px-3">
                    Pending
                  </div>
                </td>
              </tr>
              <tr className="h-[45px]">
                <td>PK08656</td>
                <td className="flex gap-1 items-center pt-2.5">
                  <Image alt="" src={electronicLED} />
                  <p>Electric LED</p>
                </td>
                <td>₹111.00</td>
                <td>United State</td>
                <td>12 Jan, 2024</td>
                <td>
                  <div className="h-[25px] text-[11px] text-[#06E775] rounded-[5px] bg-green-100 flex justify-start items-center w-[max-content] px-3">
                    Pending
                  </div>
                </td>
              </tr>
              <tr className="h-[45px]">
                <td>PK08656</td>
                <td className="flex gap-1 items-center pt-2.5">
                  <Image alt="" src={electronicLED} />
                  <p>Electric LED</p>
                </td>
                <td>₹111.00</td>
                <td>United State</td>
                <td>12 Jan, 2024</td>
                <td>
                  <div className="h-[25px] text-[11px] text-[#06E775] rounded-[5px] bg-green-100 flex justify-start items-center w-[max-content] px-3">
                    Pending
                  </div>
                </td>
              </tr>
              <tr className="h-[45px]">
                <td>PK08656</td>
                <td className="flex gap-1 items-center pt-2.5">
                  <Image alt="" src={electronicLED} />
                  <p>Electric LED</p>
                </td>
                <td>₹111.00</td>
                <td>United State</td>
                <td>12 Jan, 2024</td>
                <td>
                  <div className="h-[25px] text-[11px] text-[#06E775] rounded-[5px] bg-green-100 flex justify-start items-center w-[max-content] px-3">
                    Pending
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className=" xl:w-[40%] p-5 rounded-[8px] shadow-sm bg-white">
          <p className="text-[24px] font-[600]">Recent Orders</p>
          <div className="mt-5 flex flex-col gap-3">
            <div className="flex justify-between">
              <p className="text-[var(--text-color-body)] font-[500]">Orders</p>
              <p className="font-[500]">
                126777{" "}
                <span className="text-[var(--text-color-body)]">-12</span>
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-[var(--text-color-body)] font-[500]">Units</p>
              <p className="font-[500]">
                64665 <span className="text-[var(--text-color-body)]">-44</span>
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-[var(--text-color-body)] font-[500]">Buyers</p>
              <p className="font-[500]">
                8898 <span className="text-[var(--text-color-body)]">-12</span>
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-[var(--text-color-body)] font-[500]">
                Unique Buyers
              </p>
              <p className="font-[500]">
                8898 <span className="text-[var(--text-color-body)]">-12</span>
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-[var(--text-color-body)] font-[500]">
                Average Purchase
              </p>
              <p className="font-[500]">
                98989 <span className="text-[var(--text-color-body)]">-12</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statics;
