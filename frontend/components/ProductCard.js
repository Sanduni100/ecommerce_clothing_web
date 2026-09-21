'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { getImageUrl } from '../lib/getImageUrl';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isFavourite, toggleFavourite } = useWishlist();
  const { format } = useCurrency();
  const image = getImageUrl(product.images?.[0]);
  const favourited = isFavourite(product.id);

  return (
    <div className="card overflow-hidden group relative">
      <button
        onClick={() => toggleFavourite(product)}
        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-sm hover:scale-110 transition-transform"
        aria-label="Toggle favourite"
      >
        <Heart size={16} className={favourited ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
      </button>

      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] bg-blush dark:bg-gray-800 overflow-hidden">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.compare_price && (
          <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
            Sale
          </span>
        )}
      </Link>
      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-medium text-sm truncate hover:text-primary">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
          <Star size={12} className="fill-secondary text-secondary" />
          {Number(product.rating || 0).toFixed(1)} ({product.num_reviews || 0})
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary dark:text-secondary-light">{format(product.price)}</span>
            {product.compare_price && (
              <span className="text-xs text-gray-400 line-through">{format(product.compare_price)}</span>
            )}
          </div>
          <button
            onClick={() => addToCart(product.id)}
            className="p-2 rounded-full bg-blush dark:bg-gray-800 text-primary hover:bg-primary hover:text-white transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
