import { axiosPrivate } from "@/axios";
import { Circle } from "rc-progress";
import { useEffect, useState } from "react";

import { FaArrowUp, FaArrowDown } from "react-icons/fa6";

const Section1 = ({ ordersLength }) => {
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersAvarage, setOrdersAvarage] = useState(0);
  const [totalBuyers, setTotalBuyers] = useState(0);
  const [totalSellers, setTotalSellers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({});

  useEffect(() => {
    (async () => {
      const { data } = await axiosPrivate.get("/admin/sales/sale-stats", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      setTotalSales(data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await axiosPrivate.get(
        "/admin/sales/order-value-stats",
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      setOrdersAvarage(data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await axiosPrivate.get("/admin/statistics/revenue", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      setTotalRevenue(data);
    })();
  }, []);

  const salesChange = parseFloat(
    totalSales?.percentage_change?.replace("%", "")
  );
  const ordersChange = parseFloat(
    ordersAvarage?.percentage_change?.replace("%", "")
  );
  const revenueChange = parseFloat(
    totalRevenue?.last_thirty_revenue_percentage
  );
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      <div className="flex-1 bg-white px-[20px] py-[30px] rounded-[8px] shadow-sm flex justify-between items-center">
        <div>
          <div
            className={`${
              salesChange > 0 ? "text-[#06E775]" : "text-[#F70000]"
            } h-[32px] rounded-[44px] px-3 bg-[#E9FFF6]  flex gap-1 items-center w-[max-content]`}
          >
            {salesChange > 0 ? <FaArrowUp /> : <FaArrowDown />}
            <label className="text-[12px]">
              {totalSales?.percentage_change}
            </label>
          </div>
          <p className="mt-4 mb-1">Total Sales</p>
          <p className="text-[32px] text-black font-[600]">
            {totalSales?.sales_current_month}
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Circle
            percent={Number(
              totalSales?.completed_sales_percentage_change?.replace("%", "")
            )}
            strokeWidth={10}
            trailWidth={10}
            trailColor={"#F4F7FE"}
            strokeColor="#77B1FF"
            style={{ width: "90px" }}
          />
          <p className="text-[20px] text-center absolute font-[500]">
            {totalSales?.completed_sales_percentage_change}
          </p>
        </div>
      </div>
      <div className="flex-1 bg-white px-[20px] py-[30px] rounded-[8px] shadow-sm flex justify-between items-center">
        <div>
          <div
            className={`${
              revenueChange > 0 ? "text-[#06E775]" : "text-[#F70000]"
            } h-[32px] rounded-[44px] px-3 bg-[#FFF2F2]  flex gap-1 items-center w-[max-content]`}
          >
            {revenueChange > 0 ? <FaArrowUp /> : <FaArrowDown />}
            <label className="text-[12px]">
              {totalRevenue?.last_thirty_revenue_percentage} %
            </label>
          </div>
          <p className="mt-4 mb-1">Total Revenue</p>
          <p className="text-[32px] text-black font-[600]">
            {totalRevenue?.total_revenue}
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Circle
            percent={totalRevenue?.total_revenue_percentage}
            strokeWidth={10}
            trailWidth={10}
            trailColor={"#FFF2F2"}
            strokeColor="#F70000"
            style={{ width: "90px" }}
          />
          <p className="text-[20px] text-center absolute font-[500]">
            {totalRevenue?.total_revenue_percentage}%
          </p>
        </div>
      </div>
      <div className="flex-1 bg-white px-[20px] py-[30px] rounded-[8px] shadow-sm flex justify-between items-center">
        <div>
          <div
            className={`${
              ordersChange > 0 ? "text-[#06E775]" : "text-[#F70000]"
            } h-[32px] rounded-[44px] px-3 bg-[#E9FFF6] flex gap-1 items-center w-[max-content]`}
          >
            {ordersChange > 0 ? <FaArrowUp /> : <FaArrowDown />}
            <label className="text-[12px]">
              {ordersAvarage?.percentage_change}
            </label>
          </div>
          <p className="mt-4 mb-1">Average Order Value</p>
          <p className="text-[32px] text-black font-[600]">
            ₹{ordersAvarage?.total_current_month_order_price}
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Circle
            percent={ordersAvarage?.completed_orders_percentage_change?.replace(
              "%",
              ""
            )}
            strokeWidth={10}
            trailWidth={10}
            trailColor={"#F4F7FE"}
            strokeColor="#FEB6B7"
            style={{ width: "90px" }}
          />
          <p className="text-[20px] text-center absolute font-[500]">
            {ordersAvarage?.completed_orders_percentage_change}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Section1;
