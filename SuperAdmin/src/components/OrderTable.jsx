import { axiosPrivate } from "@/axios";
import { useEffect, useState } from "react";
import electronicLED from "@/assets/document-image.png";
import { cn } from "@/lib/utils";
import Image from "next/image";
import tableAction from "@/assets/svgs/table-action.svg";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { updatePageLoader } from "@/features/features";
import { IoEye } from "react-icons/io5";

const OrderTable = ({ order, type, status }) => {
  const [orderTracking, setOrderTracking] = useState();
  const [orderId, setOrderId] = useState(0);
  const dispatch = useDispatch();
  const navigate = useRouter();
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
  }, []),
    [order.id];

  const fn_viewDetails = (id) => {
    if (id === orderId) {
      return setOrderId(0);
    }
    setOrderId(id);
  };
  const orderStatus = orderTracking?.status_history?.slice(-1)[0]?.status;
  if (status?.length > 0 && !status.includes(orderStatus)) return null;
  return (
    <>
      <tr key={order?.id} className="text-[12px]">
        <td>{order?.id}</td>
        <td className="flex items-start gap-1.5  w-[230px] py-3  my-4">
          <Image
            width={26}
            height={26}
            alt=""
            src={order?.products[0]?.featured_image || electronicLED}
            className="h-[26px] w-[26px] rounded-md"
          />
          {order?.products?.map(
            (pro, index) =>
              `${pro?.title}${index < order.products.length - 1 ? ", " : ""}`
          )}
        </td>
        <td className="w-4 sm:w-8 md:w-12 lg:w-16"></td>
        <td>
          ₹{" "}
          {order?.products?.reduce((acc, pro) => {
            return acc + pro?.quantity * pro?.price;
          }, 0)}
        </td>
        <td>{order?.date}</td>
        <td className="w-[130px]">
          <p
            className={`${orderStatus === "cancelled" && "bg-[#FFE5E5] text-red-500"
              } ${orderStatus === "completed" && "bg-[#F0FDF4] text-green-500"}
            ${orderStatus !== "completed" &&
              orderStatus !== "cancelled" &&
              "bg-[#F1F5F9] text-gray-500"
              }
             h-[23px] w-[60px] rounded-[5px]  text-[10px] font-[500] flex items-center justify-center px-4 py-2`}
          >
            {orderTracking?.status_history?.slice(-1)[0]?.status}
          </p>
        </td>
        <td>{order?.products[0]?.seller?.name}</td>

        {type === "action" && (
          <td className="px-[17px] relative">
            <Image
              alt=""
              src={tableAction}
              className="cursor-pointer"
              onClick={() => fn_viewDetails(order.id)}
            />
            {orderId === order.id && <ViewDetails id={order.id} />}
          </td>
        )}
      </tr>
      {/* Add space between orders for all screen sizes */}
      <tr className="h-4 sm:h-6 md:h-8"></tr>
    </>
  );
};

export default OrderTable;

const ViewDetails = ({ id }) => {
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