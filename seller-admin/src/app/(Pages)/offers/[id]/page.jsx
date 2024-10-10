"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePageNavigation } from "../../../../features/features";
import Navbar from "../../../../components/navbar";
import Sidebar from "../../../../components/sidebar";
import SearchOnTop from "../../../../components/SearchOnTop";
import { useRouter } from "next/navigation";
import { Radio } from "antd";
import { axiosPrivate } from "../../../../axios/index";
import { toast } from "react-toastify";
import { LuLoader2 } from "react-icons/lu";
import { RotatingLines } from "react-loader-spinner";

const EditOffer = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [offer, setOffer] = useState(null);
    const [isPending, setPending] = useState(false);
    const [isLoading,setIsLoading] = useState(false);

    useEffect(() => {
        dispatch(updatePageNavigation("offers"));
        const url = window.location.href;
        const offerId = url.split("/").pop();
        if (offerId) {
            fetchOfferDetails(offerId);
        }
    }, [dispatch]);

    const fetchOfferDetails = async (id) => {
        try {
            setIsLoading(true);
            const { data } = await axiosPrivate.get(`/vendor/offers`, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });
            if (data?.data) {
                data?.data?.forEach((offer) => {
                    if (offer.id == id) {
                        setOffer(offer);
                        setIsLoading(false);
                    }
                });
            }
        } catch (error) {
            toast.error("Failed to fetch offer details");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const startDate = offer ? formatDate(offer?.start_date) : '';
    const endDate = offer ? formatDate(offer?.end_date) : '';

    const onUpdateOffer = async (formData) => {
        try {
            setPending(true);
            const url = window.location.href;
            const offerId = url.split("/").pop();
            await axiosPrivate.put(`/vendor/offers/${offerId}`, formData, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "multipart/form-data", 
                },
            });
            toast.success("Offer has been updated");
            router.push("/offers");
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setTimeout(() => {
                setPending(false);
            }, 700);
        }
    };

    if (isLoading) {
        return   <div className="z-[99999999] fixed w-full top-0 left-0 h-screen flex justify-center items-center bg-[#9999999f] text-[20px] text-[var(--text-color)] font-[600] overflow-hidden">
        <RotatingLines
          visible={true}
          height="96"
          width="96"
          color="red"
          strokeWidth="5"
          animationDuration="0.75"
          ariaLabel="rotating-lines-loading"
          wrapperStyle={{}}
          wrapperClass=""
          strokeColor={"red"}
        />
      </div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex-1 flex">
                <Sidebar />
                <div className="flex-1 mt-[30px] px-[22px]">
                    <SearchOnTop />
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            onUpdateOffer(Object.fromEntries(formData));
                        }}
                        className="my-[20px] px-[20px] py-[30px] bg-white rounded-[8px] shadow-sm"
                    >
                        <p className="text-[21px] font-[600]">Edit Offer</p>

                        <div className="flex flex-col gap-5 pb-2 mt-5">
                            <div className="flex flex-col gap-1">
                                <label className="text-[#777777]">Offer Title</label>
                                <input
                                    name="title"
                                    required
                                    defaultValue={offer?.name}
                                    placeholder="Offer Title"
                                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[#777777]">Description</label>
                                <input
                                    placeholder="Description"
                                    name="description"
                                    required
                                    defaultValue={offer?.description}
                                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[#777777]">Discount Type</label>
                                <Radio.Group
                                    className="custom-radio-group"
                                    buttonStyle="outline"
                                    defaultValue={offer?.discount_type}
                                    name="discount_type"
                                    required
                                >
                                    <Radio value="percentage">Percentage</Radio>
                                    <Radio value="fixed">Fixed</Radio>
                                </Radio.Group>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[#777777]">Discount Value</label>
                                <input
                                    type="number"
                                    name="discount_value"
                                    required
                                    defaultValue={offer?.discount_value}
                                    placeholder="Discount Value"
                                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                                />
                            </div>

                            <div className="flex flex-col md:flex-row justify-between gap-5">
                                <div className="flex-1 flex flex-col gap-1">
                                    <label className="text-[#777777]">Start Date</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        required
                                        defaultValue={startDate}
                                        placeholder="Start Date"
                                        className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col gap-1">
                                    <label className="text-[#777777]">End Date</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        required
                                        defaultValue={endDate}
                                        placeholder="End Date"
                                        className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] px-[15px] h-[50px] text-[15px]"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-5 mt-5 flex-col sm:flex-row items-center sm:items-start">
                                <button
                                    disabled={isPending}
                                    type="submit"
                                    className="h-[50px] flex items-center justify-center justify-self-start rounded-[8px] bg-[#FE4242] text-white font-[500] w-[200px] mt-10 disabled:bg-zinc-400 disabled:text-zinc-200 disabled:border-none"
                                >
                                    {isPending ? <LuLoader2 /> : "Update Offer"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditOffer;