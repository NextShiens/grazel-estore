import React from "react";
import Image from "next/image";
import electronicLED from "@/assets/document-image.png";

const AllProducts = ({ products }) => {
  return (
    <div className="flex flex-col gap-4">
      {products.map((product) => (
        <div key={product.id} className="border border-gray-200 rounded-[8px] p-2 flex flex-row gap-4">
          <Image
            src={product?.featured_image || electronicLED}
            alt={product?.title}
            width={48}
            height={48}
            className="w-16 h-16 object-cover rounded-[8px] mb-1"
          />
          <div className="flex flex-col gap-[1px]">
            <h4 className="text-[16px] font-[500]">{product?.title}</h4>
            <p className="text-[var(--text-color-body)]">{product?.price} in stock</p>
            <p className="text-green-500">Available</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllProducts;