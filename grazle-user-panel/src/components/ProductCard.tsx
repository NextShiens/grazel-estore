import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Rating } from '@mui/material';
import { FaShoppingCart } from 'react-icons/fa';
import { calculateFinalPrice } from '@/utils/priceCalculation';
import LikeButton from './LikeButton';

interface ProductCardProps {
  product: any;
  onAddToCart: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { price, basePrice, discountInfo } = calculateFinalPrice(product, null);

  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative aspect-square">
        <Image
          src={'/' + product.featured_image}
          alt={product.title}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
          <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
            {discountInfo?.toUpperCase() || '0% OFF'}
          </span>
          <LikeButton productId={product.id} />
        </div>
      </div>
      
      <div className="p-4">
        <Link href={`/detailProduct/${product.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{product.title}</h3>
          <div className="flex items-center mb-2">
            <Rating value={Number(product.rating)} readOnly size="small" />
            <span className="text-sm text-yellow-600 ml-2">
              {product.rating} ({product.reviews > 0 ? product.reviews : 0})
            </span>
          </div>
          <div className="flex items-baseline mb-2">
            <span className="text-2xl font-bold text-red-600">₹{price}</span>
            <span className="text-sm text-gray-500 line-through ml-2">₹{basePrice}</span>
          </div>
        </Link>
        
        <button
          onClick={() => onAddToCart(product)}
          className="w-full bg-white text-red-600 border border-red-600 font-semibold py-2 px-4 rounded-full hover:bg-red-600 hover:text-white transition-colors duration-300 flex items-center justify-center"
        >
          <FaShoppingCart className="mr-2" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;