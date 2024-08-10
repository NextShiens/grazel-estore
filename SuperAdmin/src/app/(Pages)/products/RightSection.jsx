import Image from "next/image";
import React from "react";
import product from "@/assets/document-image.png";

const RightSection = ({
  allProducts,
  allCategories,
  isLoading,
  renderPageNumbers,
  currentPage,
  totalPages,
  totalProducts,
  handlePageChange
}) => {
  return (
    <div className="bg-white rounded-[8px] shadow-sm p-[20px] flex-1">
      <p className="text-[24px] font-[600]">Recent Stock</p>
      <div className="w-[78vw] sm:w-[85vw] md:w-[63vw] lg:w-[48vw] xl:w-full overflow-x-auto">
        <table className="w-[610px] xl:w-[100%]">
          <thead>
            <tr className="text-[var(--text-color-body)] font-[500] text-[15px] leading-[45px]">
              <td>Product Name</td>
              <td>Seller Name</td>
              <td>Stock</td>
              <td>Price</td>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="text-center py-4">Loading products...</td>
              </tr>
            ) : allProducts?.length > 0 ? (
              allProducts?.map((item, i) => (
                <tr className="text-[14px] leading-[35px]" key={i}>
                  <td className="h-[100%] flex gap-1 items-center">
                    <Image
                      alt=""
                      width={30}
                      height={30}
                      src={item?.featured_image || product}
                      className="rounded-full max-h-7"
                      layout="fixed"
                    />
                    <label>{item.title}</label>
                  </td>
                  <td>{item?.user?.username}</td>
                  <td>
                    <p
                      className={`${
                        item.active ? "bg-green-200" : "bg-red-200"
                      } h-[28px] w-[75px] rounded-[5px] text-[10px] text-[var(--text-color-delivered)] font-[500] flex items-center justify-center`}
                    >
                      {item.active ? "In Stock" : "Out of Stock"}
                    </p>
                  </td>
                  <td>₹{item.price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-red-500">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {allProducts?.length > 0 && (
        <div className="flex flex-col items-center mt-4">
          <div className="flex justify-center items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="mx-1 px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages} | Total Products: {totalProducts}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSection;