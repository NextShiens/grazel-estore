import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Rating from "../../../components/Rating";
import { FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Manage = ({ allProducts, setSelectedTab, setProduct, searchTerm, onDeleteProduct }) => {
  const [favorites, setFavorites] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [allProducts.length]);

  const toggleFavorite = (id) => {
    setFavorites((prevFavorites) => ({
      ...prevFavorites,
      [id]: !prevFavorites[id],
    }));
  };

  const filteredProducts = allProducts.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await onDeleteProduct(productId);
        toast.success("Product deleted successfully");
      } catch (error) {
        console.error("Failed to delete product", error);
        toast.error("Failed to delete product");
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full text-center py-10 text-gray-500 flex justify-center items-center h-screen">
        <div className="loader">
          <div className="dot dot1"></div>
          <div className="dot dot2"></div>
          <div className="dot dot3"></div>
        </div>
        <style jsx>{`
          .loader {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .dot {
            width: 16px;
            height: 16px;
            margin: 0 5px;
            background-color: red;
            border-radius: 50%;
            animation: bounce 1.5s infinite;
          }
          .dot1 {
            animation-delay: 0s;
          }
          .dot2 {
            animation-delay: 0.3s;
          }
          .dot3 {
            animation-delay: 0.6s;
          }
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex gap-5 flex-wrap pb-[30px]">
      {filteredProducts.map(item => (
        <div
          key={item.id}
          className="w-[340px] bg-white rounded-[8px] shadow-sm pb-[20px] transition-transform transform hover:scale-105"
        >
          <div className="rounded-[8px] flex justify-center pt-[20px] pb-[15px] relative">
            <Image
              alt={item.title}
              width={290}
              height={290}
              src={item?.featured_image || 'https://via.placeholder.com/290x290?text=No+Image+Available'}
              onError={(e) => {
                console.error('Image failed to load:', e);
                e.target.src = 'https://via.placeholder.com/290x290?text=No+Image+Available';
              }}
              className="h-[290px] rounded-[8px] object-contain"
            />
          </div>
          <div className="px-[20px] flex flex-col">
            <p className="font-[600] text-[17px] mb-1">
              {item.title.toUpperCase()}
            </p>
            <p className={`${item.discount ? "line-through" : ""} text-[var(--price-color)] text-[15px] font-[600]`}>
              ₹ {item.price}
            </p>
            {item.discount && (
              <p className="text-[var(--price-color)] text-[15px] font-[600]">
                ₹ {item.discounted_price} ({item.discount}% off)
              </p>
            )}
            <div className="flex gap-0.5 mt-1 items-center">
              <Rating value={item.rating || 0} size="small" readOnly />
              <span className="text-sm text-gray-600">({item.reviews || 0})</span>
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {item.description}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setSelectedTab("edit");
                  setProduct(item);
                }}
                className="flex items-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition-colors shadow-md"
              >
                <FaEdit />
                <span>Edit Product</span>
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="flex items-center gap-2 bg-red-500 text-white py-2 px-4 rounded-full hover:bg-red-600 transition-colors shadow-md"
              >
                <FaTrash />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      ))}
      {filteredProducts.length === 0 && (
        <div className="w-full text-center py-10 text-gray-500">
          No products found matching your search.
        </div>
      )}
    </div>
  );
};

export default Manage;
