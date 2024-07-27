"use client";
import React, { useEffect, useState } from "react";
import Loading from "../../../../components/loading";
import Navbar from "../../../../components/navbar";
import Sidebar from "../../../../components/sidebar";
import SearchOnTop from "../../../../components/SearchOnTop";
import Link from "next/link";
import { axiosPrivate } from "../../../../axios";
import Image from "next/image";
import { toast } from "react-toastify";
import { FiLoader } from "react-icons/fi";

const ApplyOffer = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [allOffers, setAllOffers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      const { data } = await axiosPrivate.get("/vendor/products", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setAllProducts(data?.products);
    })();
  }, []);

  useEffect(() => {
    const getAllOffers = async () => {
      const { data } = await axiosPrivate.get("/vendor/offers", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      setAllOffers(data?.data); // to show data on web
    };
    getAllOffers();
  }, []);

  // Step 2: Handle checkbox changes
  const handleCheckboxChange = (event, productId) => {
    if (event.target.checked) {
      // Add the ID to the state if the checkbox is checked
      setSelectedIds([...selectedIds, productId]);
    } else {
      // Remove the ID from the state if the checkbox is unchecked
      setSelectedIds(selectedIds.filter((id) => id !== productId));
    }
  };

  const numberIds = selectedIds.map((id) => parseInt(id, 10));

  const idsInt = numberIds.join(",");

  const applyOffer = async () => {
    if (selectedIds.length < 1) {
      return toast.error("Select Product to apply offer");
    }
    if (!selectedOfferId) {
      return toast.error("Select offer to apply");
    }

    try {
      setLoading(true);
      const formdata = new FormData();

      formdata.set("product_ids", JSON.stringify(selectedIds));

      const { data } = await axiosPrivate.post(
        `/vendor/offers/${selectedOfferId}/multi-apply`,
        formdata,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      console.log(data);
      toast.success("Offer applied successfully");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <>
      <Loading />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[22px]">
            <div className="flex  items-center justify-between">
              <div className="w-[70%] mr-2">
                <SearchOnTop />
              </div>
              <Link href="/offers/add">
                <button className="h-[50px] rounded-[8px] bg-[#FE4242]  text-white font-[500] w-[150px]">
                  Add Offer
                </button>
              </Link>
            </div>
            <div className="mt-[20px] bg-white rounded-[8px] shadow-sm p-[30px] grid lg:grid-cols-1 gap-9 ">
              <div className="my-[30px] px-[25px] py-[20px] bg-white rounded-[8px] shadow-sm overflow-x-auto w-[94vw] md:w-[67vw] lg:w-[75vw] xl:w-auto">
                <div className="flex justify-between items-center  mt-2 mb-5 p-3 border-b  drop-shadow-lg">
                  <span> {selectedIds.length} Selected </span>
                  <select
                    onChange={(e) => setSelectedOfferId(e.target.value)}
                    className="focus:outline-none border-[2px] border-gray-200 rounded-[8px] p-2 text-[15px] text-[var(--text-color-body)]"
                    name=""
                    id=""
                  >
                    <option value="">-- select offer --</option>
                    {allOffers?.map((offer) => (
                      <option key={offer.id} value={offer.id}>
                        {offer.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={applyOffer}
                    className="rounded-[8px] bg-[#FE4242]  text-white font-[500] p-2"
                  >
                    {loading ? (
                      <FiLoader className="animate-spin h-5 w-5" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
                <h2 className="text-[20px] font-[600] mt-2 mb-5">
                  All Products
                </h2>
                <table className="w-[1000px] xl:w-[100%] table-fixed">
                  <thead>
                    <tr className="font-[500] text-[var(--text-color-body)] text-[15px]">
                      <td>Product ID</td>
                      <td>Image</td>
                      <td>Product Name</td>
                      <td>Price</td>
                      <td>Status</td>
                      <td>Select</td>
                    </tr>
                  </thead>

                  <tbody>
                    {allProducts?.map((product) => (
                      <tr className="h-[50px] text-[14px]" key={product.id}>
                        <td className="ml-2">{product.id}</td>
                        <td className="flex items-center gap-1.5 h-[50px] capitalize">
                          {product?.featured_image && (
                            <Image
                              alt=""
                              width={26}
                              height={26}
                              src={"/" + product?.featured_image}
                              className="h-[26px] w-[26px]"
                            />
                          )}
                        </td>
                        <td>{product?.title}</td>

                        <td>₹ {product?.price}</td>
                        <td className="w-[130px]">
                          {product?.active ? "Active" : "Inactive"}
                        </td>
                        <td>
                          <input
                            onChange={(event) =>
                              handleCheckboxChange(event, product.id)
                            }
                            className="cursor-pointer ml-2"
                            type="checkbox"
                            name=""
                            id=""
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplyOffer;
