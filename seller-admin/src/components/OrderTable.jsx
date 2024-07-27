"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { axiosPrivate } from "../axios";
import { IoEye } from "react-icons/io5";
import tableAction from "../assets/svgs/table-action.svg";
import { useDispatch } from "react-redux";
import { updatePageLoader } from "../features/features";
import { useRouter } from "next/navigation";

const OrderTable = ({ order, type, allOrders, action, status }) => {
  const [orderTracking, setOrderTracking] = useState();
  const [orderId, setOrderId] = useState(0);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await axiosPrivate.get(
        `/buyer/orders/${order.id}/track-status`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      setOrderTracking(data.order);
    })();
  }, [order.id]);

  const fn_viewDetails = (id) => {
    if (id === orderId) {
      return setOrderId(0);
    }
    setOrderId(id);
  };

  function onNavigate(orderDetails) {
    let filterOrder = allOrders?.filter(
      (item) => item?.user_id == orderDetails?.user_id
    );
    if (typeof window !== undefined) {
      localStorage.setItem("recentOrder", JSON.stringify(filterOrder));
    }
    dispatch(updatePageLoader(true));
    router.push(`/customers/${order?.user_id}`);
  }

  const orderStatus = orderTracking?.status_history?.slice(-1)[0]?.status;
  if (status?.length > 0 && !status.includes(orderStatus)) return null;

  return (
    <>
      {type === "orders" && (
        <tr key={order?.id} className="h-[50px] text-[14px]">
          <td>{order?.id}</td>
          <td className="flex items-center gap-1.5 h-[50px] capitalize">
            <Image
              alt=""
              src={order?.products[0]?.image}
              className="h-[26px] w-[26px]"
            />
            {order?.products?.map(
              (pro, index) =>
                `${pro?.title}${index < order.products.length - 1 ? ", " : ""}`
            )}
          </td>
          <td>
            ₹
            {order?.products?.reduce((acc, pro) => {
              return (
                acc +
                Number(
                  pro?.discount
                    ? pro.discounted_price
                    : pro.price * pro.quantity
                )
              );
            }, 0)}
          </td>
          {!action && (
            <td className="capitalize">{order?.customer?.username}</td>
          )}
          <td>{order?.date}</td>
          <td className="w-[130px]">
            {orderTracking?.status_history?.slice(-1)[0]?.status}
          </td>

          {action && (
            <td className="px-[17px] relative">
              <Image
                alt=""
                src={tableAction}
                className="cursor-pointer"
                onClick={() => fn_viewDetails(order.id)}
              />
              {orderId === order.id && <ViewOrderDetails id={order.id} />}
            </td>
          )}
        </tr>
      )}

      {type === "customers" && (
        <>
          <tr key={order?.id} className="h-[50px] text-[14px]">
            <td className="flex items-center gap-1.5 h-[50px]">
              <Image
                alt=""
                width={26}
                height={26}
                src={"/" + order.customer.image}
                className="h-[26px] w-[26px] rounded-[5px]"
              />
              {order?.customer?.username}
            </td>

            <td>{order?.customer?.email}</td>
            <td>{order?.customer_address.recipient_phone}</td>
            <td className="flex items-center gap-1.5 h-[50px] capitalize">
              <Image
                width={26}
                height={26}
                alt=""
                src={"/" + order.products[0].featured_image}
                className="h-[26px] w-[26px]"
              />
              {order?.products?.map(
                (pro, index) =>
                  `${pro?.title}${
                    index < order.products.length - 1 ? ", " : ""
                  }`
              )}
            </td>
            <td className="w-[130px]">
              {orderTracking?.status_history?.slice(-1)[0]?.status}
            </td>

            <td className="px-[17px] relative">
              <Image
                alt=""
                src={tableAction}
                className="cursor-pointer"
                onClick={() => fn_viewDetails(order.id)}
              />
              {orderId === order.id && (
                <ViewDetails onNavigate={onNavigate} order={order} />
              )}
            </td>
          </tr>
        </>
      )}
    </>
  );
};

export default OrderTable;

const ViewDetails = ({ onNavigate, order }) => {
  return (
    <div className="absolute py-[10px] px-[10px] flex flex-col items-center text-[var(--text-color-body)] bg-white rounded-[8px] shadow-md border border-gray-100 w-[max-content] left-[-145px] top-[13px] cursor-pointer">
      <div
        className="flex items-center gap-2.5 w-full px-2 py-1.5 hover:bg-gray-100 rounded-sm"
        onClick={() => onNavigate(order)}
      >
        <IoEye className="w-[20px] h-[20px]" />
        <p className="text-[14px]">View Details</p>
      </div>
    </div>
  );
};

const ViewOrderDetails = ({ id }) => {
  const navigate = useRouter();
  const dispatch = useDispatch();
  return (
    <div className="absolute py-[10px] px-[10px] flex flex-col items-center text-[var(--text-color-body)] bg-white rounded-[8px] shadow-md border border-gray-100 w-[max-content] left-[-145px] top-[13px] cursor-pointer">
      <div
        className="flex items-center gap-2.5 w-full px-2 py-1.5 hover:bg-gray-100 rounded-sm"
        onClick={() => {
          dispatch(updatePageLoader(true));
          navigate.push(`/orders/${id}`);
        }}
      >
        <IoEye className="w-[20px] h-[20px]" />
        <p className="text-[14px]">View Details</p>
      </div>
    </div>
  );
};
