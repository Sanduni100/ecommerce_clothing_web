'use client';
import Link from 'next/link';
import { useWishlist } from '../../../context/WishlistContext';
import { useAuth } from '../../../context/AuthContext';
import ProductCard from '../../../components/ProductCard';

export default function WishlistPage() {
  const { user } = useAuth();
  const { items } = useWishlist();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="mb-4">Please log in to view your favourites.</p>
        <Link href="/login" className="btn-primary">Log In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-6">My Favourites</h1>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">You haven't saved any favourites yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
