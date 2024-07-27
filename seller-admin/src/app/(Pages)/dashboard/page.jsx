"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Image from "next/image";
import Navbar from "../../../components/navbar";
import Sidebar from "../../../components/sidebar";
import OrderTable from "../../../components/OrderTable";
import {
  updatePageLoader,
  updatePageNavigation,
} from "../../../features/features";
import Loading from "../../../components/loading";

import { GoDotFill } from "react-icons/go";

import salesIcon from "../../../assets/svgs/dashboard-sales.svg";
import ordersIcon from "../../../assets/svgs/dashboard-orders.svg";
import revenueIcon from "../../../assets/svgs/dashboard-revenue.svg";
import returnIcon from "../../../assets/svgs/dashboard-return.svg";
import dashboardTableImg from "../../../assets/svgs/dashboard-table-img.svg";

import productOne from "../../../assets/dashboard-product-1.png";
import productTwo from "../../../assets/dashboard-product-2.png";
import productThree from "../../../assets/dashboard-product-3.png";
import electronicLED from "../../../assets/Electronic-LED.png";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { axiosPrivate } from "../../../axios/index";
import { cn } from "../../../lib/utils";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Dashboard = () => {
  const [allOrders, setOrders] = useState([]);
  const [returnOrders, setReturnOrders] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [sales, setSales] = useState(0);
  useEffect(() => {
    const getAllOrders = async () => {
      const { data } = await axiosPrivate.get("/seller/orders", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      setOrders(data?.orders);
    };
    !allOrders?.length && getAllOrders();
  }, [allOrders?.length]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation("dashboard"));
  }, [dispatch]);
  const data = {
    labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
    datasets: [
      {
        label: "Order",
        data: [5300, 5200, 9300, 13500, 5300, 10200, 1200, 7100],
        backgroundColor: "#00A1FF",
        borderRadius: 5,
      },
      {
        label: "Revenue",
        data: [4500, 4000, 9300, 15000, 4000, 11000, 2000, 8000],
        backgroundColor: "#06E775",
        borderRadius: 5,
      },
    ],
  };
  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  // total sales
  useEffect(() => {
    (async () => {
      const { data } = await axiosPrivate.get("/seller/statistics/sales", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setSales(data);
    })();
  }, []);

  // total current month orders
  useEffect(() => {
    (async () => {
      const { data } = await axiosPrivate.get(
        "/seller/statistics/orders-stats",
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      setTotalOrdersCount(data);
    })();
  }, []);

  // life time revenue
  useEffect(() => {
    (async () => {
      const { data } = await axiosPrivate.get(
        "/seller/statistics/lifetime-revenue",
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      console.log(data);
      setRevenue(data);
    })();
  }, []);

  // return orders
  useEffect(() => {
    (async () => {
      const { data } = await axiosPrivate.get(
        "/seller/statistics/return-stats",
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      setReturnOrders(data);
    })();
  }, []);

  return (
    <>
      <Loading />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[22px]">
            {/* boxes */}
            <div className="flex flex-col sm:flex-row justify-between sm:flex-wrap gap-5">
              <div className="min-w-[250px] flex-1 h-[140px] rounded-[10px] bg-white shadow-sm flex flex-col justify-between p-[20px]">
                <div className="flex justify-between">
                  <p className="text-[15px] font-[500] text-[var(--text-color-body)]">
                    Total Sales
                  </p>
                  <Image alt="" src={salesIcon} />
                </div>
                <div>
                  <p className="text-[32px] font-[600] text-black">
                    ₹ {sales?.current_month_sales}
                  </p>
                  {/* <p className="text-[12px] font-[500] text-[var(--text-color-body-plus)]">
                  + 3.16% From last month
                </p> */}
                </div>
              </div>
              <div className="min-w-[250px] flex-1 h-[140px] rounded-[10px] bg-white shadow-sm flex flex-col justify-between p-[20px]">
                <div className="flex justify-between">
                  <p className="text-[15px] font-[500] text-[var(--text-color-body)]">
                    Total Orders
                  </p>
                  <Image alt="" src={ordersIcon} />
                </div>
                <div>
                  <p className="text-[32px] font-[600] text-black">
                    {totalOrdersCount?.current_month_orders}
                  </p>
                  {/* <p className="text-[12px] font-[500] text-[var(--text-color-body-minus)]">
                  - 1.18% From last month
                </p> */}
                </div>
              </div>
              <div className="min-w-[250px] flex-1 h-[140px] rounded-[10px] bg-white shadow-sm flex flex-col justify-between p-[20px]">
                <div className="flex justify-between">
                  <p className="text-[15px] font-[500] text-[var(--text-color-body)]">
                    Lifetime Revenue
                  </p>
                  <Image alt="" src={revenueIcon} />
                </div>
                <div>
                  <p className="text-[32px] font-[600] text-black">
                    ₹ {revenue?.total_revenue}
                  </p>
                  {/* <p className="text-[12px] font-[500] text-[var(--text-color-body-plus)]">
                  + 2.24% From last month
                </p> */}
                </div>
              </div>
              <div className="min-w-[250px] flex-1 h-[140px] rounded-[10px] bg-white shadow-sm flex flex-col justify-between p-[20px]">
                <div className="flex justify-between">
                  <p className="text-[15px] font-[500] text-[var(--text-color-body)]">
                    Return Orders
                  </p>
                  <Image alt="" src={returnIcon} />
                </div>
                <div>
                  <p className="text-[32px] font-[600] text-black">
                    {returnOrders?.total_return_amount}
                  </p>
                  {/* <p className="text-[12px] font-[500] text-[var(--text-color-body-minus)]">
                  - 1.18% From last month
                </p> */}
                </div>
              </div>
            </div>
            {/* graphs and products */}
            {/* <div className="mt-[30px] flex gap-5 flex-col xl:flex-row">
            <div className="xl:w-[55%] bg-white shadow-sm rounded-[10px] p-[20px]">
              <div className="flex justify-between items-center">
                <p className="text-[20px] font-[600]">Revenue Trend</p>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1 text-[15px]">
                    <GoDotFill className="text-[var(--text-color-body-plus)]" />
                    Revenue
                  </div>
                  <div className="flex items-center gap-1 text-[15px]">
                    <GoDotFill className="text-[var(--text-color-body-order)]" />
                    Order
                  </div>
                </div>
              </div>
              <div className="w-[100%]">
                <Bar data={data} options={options}></Bar>
              </div>
            </div>
            <div className="xl:w-[45%] bg-white shadow-sm rounded-[10px] px-[20px] py-[25px] flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <p className="text-[20px] font-[600]">Customer Favorite</p>
                <button className="w-[135px] h-[32px] text-[var(--text-color-body)] rounded-[4px] border-black border-[1px] py-[6px] px-[12px] text-[13px] font-[500]">
                  See All Products
                </button>
              </div>
              <div className="flex gap-5">
                <Image alt="" src={productOne} className="w-[67px] h-[67px]" />
                <div className="flex-1 flex justify-between items-center">
                  <div className="flex flex-col gap-1.5">
                    <p className="font-[500] leading-[24px]">
                      Lorem ipsum dolor sit amet
                    </p>
                    <p className="text-[14px] text-[var(--text-color-body)]">
                      12,429 Sales
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[12px] text-[var(--text-color-body-plus)] flex items-center gap-1">
                      <GoDotFill />
                      Available
                    </p>
                    <p className="text-[var(--text-color-body)] text-[11px] ps-[15px]">
                      135 Stocks
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-5">
                <Image alt="" src={productTwo} className="w-[67px] h-[67px]" />
                <div className="flex-1 flex justify-between items-center">
                  <div className="flex flex-col gap-1.5">
                    <p className="font-[500] leading-[24px]">
                      Lorem ipsum dolor sit amet
                    </p>
                    <p className="text-[14px] text-[var(--text-color-body)]">
                      12,429 Sales
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[12px] text-[var(--text-color-body-plus)] flex items-center gap-1">
                      <GoDotFill />
                      Available
                    </p>
                    <p className="text-[var(--text-color-body)] text-[11px] ps-[15px]">
                      135 Stocks
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-5">
                <Image
                  alt=""
                  src={productThree}
                  className="w-[67px] h-[67px]"
                />
                <div className="flex-1 flex justify-between items-center">
                  <div className="flex flex-col gap-1.5">
                    <p className="font-[500] leading-[24px]">
                      Lorem ipsum dolor sit amet
                    </p>
                    <p className="text-[14px] text-[var(--text-color-body)]">
                      12,429 Sales
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[12px] text-[var(--text-color-body-plus)] flex items-center gap-1">
                      <GoDotFill />
                      Available
                    </p>
                    <p className="text-[var(--text-color-body)] text-[11px] ps-[15px]">
                      135 Stocks
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
            {/* table */}

            <div className="my-[30px] px-[25px] py-[20px] bg-white rounded-[8px] shadow-sm overflow-x-auto w-[94vw] md:w-[67vw] lg:w-[75vw] xl:w-auto">
              <h2 className="text-[20px] font-[600] mt-2 mb-5">
                Recent Orders
              </h2>
              <table className="w-[1000px] xl:w-[100%] table-fixed">
                <thead>
                  <tr className="font-[500] text-[var(--text-color-body)] text-[15px]">
                    <td>Order No</td>
                    <td>Product Name</td>
                    <td>Price</td>
                    <td>Customer</td>
                    <td>Date</td>
                    <td className="w-[80px]">Status</td>
                  </tr>
                </thead>

                <tbody>
                  {allOrders.length > 0 &&
                    allOrders.map((order) => (
                      <OrderTable
                        type={"orders"}
                        key={order.id}
                        order={order}
                      />
                    ))}
                  {!allOrders.length && (
                    <h3 className="text-red-500 text-center mt-2">
                      No order found
                    </h3>
                  )}
                </tbody>
              </table>
            </div>
            {/* </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
