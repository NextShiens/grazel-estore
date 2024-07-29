import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Rating } from '@mui/material';
import { FaShoppingCart } from 'react-icons/fa';
import { calculateFinalPrice } from '@/utils/priceCalculation';
import { updateCart } from '@/features/features';
import { toast } from 'react-toastify';
import LikeButton from './LikeButton';

interface ProductCardProps {
  product: any;
  width?: string;
  offerId?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, width, offerId }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isPending, setPending] = useState(false);

  const { basePrice, price, discountInfo } = calculateFinalPrice(product, null);

  const goToDetail = () => {
    const id = product.id;
    if (typeof window !== 'undefined') {
      const ids = localStorage.getItem('productIds')
        ? JSON.parse(localStorage.getItem('productIds')!)
        : [];

      if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem('productIds', JSON.stringify(ids));
      }
    }
    router.push('/detailProduct/' + id);
  };

  const onAddingCart = (product:any) => {
    const updateProduct = {
      ...product,
      qty: 1,
      discountPrice: price,
      originalPrice: basePrice,
      discountInfo: discountInfo,
    };
    dispatch(updateCart({ type: null, product: updateProduct }));
    toast.success('Item has been added to cart!');
  };

  if (offerId && offerId !== product?.offer_id) return null;

  return (
    <div 
      className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden "
    >
      <div className="relative aspect-square">
        <Image
          src={'/' + product.featured_image}
          // alt={product.title}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg" alt={''}        />
        <div className="flex items-center mb-2 absolute top-2 left-2 right-2 justify-between">
            <span className="text-sm text-white ml-2 bg-yellow-600 font-semibold px-2 py-1 rounded-full">
              {product.rating} ({product.reviews > 0 ? product.reviews : 0})
            </span>
            <LikeButton productId={product.id} />
          </div>
          <div className="absolute top-2 left-2 right-2 flex justify-between">
        </div>
      </div>

      <div className="p-4">
        <Link href={`/detailProduct/${product.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{product.title}</h3>
          {/* <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
            {discountInfo?.toUpperCase() || '0% OFF'}
          </span> */}
          <div className="flex items-baseline mb-2">
            <span className="text-2xl font-bold text-red-600">₹{price}</span>
            <span className="text-sm text-gray-500 line-through ml-2">₹{basePrice}</span>
            <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full ml-2">
            {discountInfo?.toUpperCase() || '0% OFF'}
          </span>
          </div>
        </Link>
      </div>
      
      <button
          onClick={() => onAddingCart(product)}
          className="w-full bg-white text-red-600 border border-red-600 font-semibold py-2 px-4 rounded-full hover:bg-red-600 hover:text-white transition-colors duration-300 flex items-center justify-center"
        >
          <FaShoppingCart className="mr-2" />
          Add to Cart
        </button>
    </div>
  );
};

export default ProductCard;