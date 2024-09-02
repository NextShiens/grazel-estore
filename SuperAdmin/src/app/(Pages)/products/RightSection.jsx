import Image from "next/image";
import React from "react";
import product from "@/assets/document-image.png";
import { axiosPrivate } from "@/axios";
import { toast } from "react-toastify";

const RightSection = ({
  allProducts,
  allCategories,
  isLoading,
  renderPageNumbers,
  currentPage,
  totalPages,
  totalProducts,
  handlePageChange,
}) => {
  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axiosPrivate.delete(`/admin/products/${id}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        toast.success("Product has been deleted");
      } catch (error) {
        console.error("Failed to delete product", error);
        toast.error("Failed to delete product");
      }
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex-1">
      <h2 className="text-2xl font-semibold mb-4">Recent Stock</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[610px]">
          <thead>
            <tr className="text-gray-700 font-medium text-sm">
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Product Name</th>
              <th className="py-3 px-4 text-left">Seller Name</th>
              <th className="py-3 px-4 text-left">Stock</th>
              <th className="py-3 px-4 text-left">Price</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <>
                <tr>
                  <td colSpan="5" className="text-center py-8">
                    <div className="horror-loader flex justify-center items-center">
                      <div className="horror-head">
                        <div className="horror-eyes">
                          <div className="horror-eye"></div>
                          <div className="horror-eye"></div>
                        </div>
                        <div className="horror-mouth"></div>
                      </div>
                      <p className="ml-4 text-red-600">Loading products...</p>
                    </div>
                  </td>
                </tr>

                <style jsx>{`
                  .horror-loader {
                    display: flex;
                    align-items: center;
                    animation: shake 1.5s infinite;
                  }

                  .horror-head {
                    width: 50px;
                    height: 50px;
                    background-color: #2c3e50;
                    border-radius: 50%;
                    position: relative;
                    box-shadow: 0 0 15px 5px rgba(255, 0, 0, 0.5);
                  }

                  .horror-eyes {
                    display: flex;
                    justify-content: space-between;
                    position: absolute;
                    top: 15px;
                    left: 10px;
                    right: 10px;
                  }

                  .horror-eye {
                    width: 10px;
                    height: 10px;
                    background-color: #e74c3c;
                    border-radius: 50%;
                    box-shadow: 0 0 10px 2px rgba(255, 0, 0, 0.7);
                  }

                  .horror-mouth {
                    width: 20px;
                    height: 5px;
                    background-color: #e74c3c;
                    border-radius: 5px;
                    position: absolute;
                    bottom: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    box-shadow: 0 0 10px 2px rgba(255, 0, 0, 0.7);
                  }

                  @keyframes shake {
                    0%,
                    100% {
                      transform: translate(0, 0);
                    }
                    25% {
                      transform: translate(-2px, -2px);
                    }
                    50% {
                      transform: translate(2px, 2px);
                    }
                    75% {
                      transform: translate(-2px, 2px);
                    }
                  }
                `}</style>
              </>
            ) : allProducts?.length > 0 ? (
              allProducts?.map((item, i) => (
                <tr
                  key={i}
                  className="text-sm border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">{item.id}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <Image
                        alt={item.title}
                        width={40}
                        height={40}
                        src={item?.featured_image || product}
                        className="rounded-full mr-3"
                        layout="fixed"
                      />
                      <span className="font-medium">{item.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">{item?.user?.username}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.active ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium">₹{item?.price}</td>
                  <td>
                    <button
                      type="button"
                      onClick={()=>handleDeleteProduct(item.id)}
                      className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete Product
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-8 text-red-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {allProducts?.length > 0 && (
        <div className="mt-6 flex flex-col items-center">
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              Previous
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              Next
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Page {currentPage} of {totalPages} | Total Products: {totalProducts}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSection;
