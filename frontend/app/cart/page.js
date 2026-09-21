'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { getImageUrl } from '../../lib/getImageUrl';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, loading } = useCart();
  const { user } = useAuth();
  const { format } = useCurrency();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold mb-2">Please log in to view your cart</h1>
        <Link href="/login" className="btn-primary inline-block mt-4">Log In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {loading ? (
        <p className="text-sm text-gray-500">Loading cart...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Your cart is empty.</p>
          <Link href="/shop" className="btn-primary inline-block mt-4">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => {
              const image = getImageUrl(item.images?.[0], 'https://placehold.co/200x200/EDE0F5/7B68B0?text=Item');
              return (
                <div key={item.id} className="card p-4 flex gap-4 items-center">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-blush dark:bg-gray-800 flex-shrink-0">
                    <Image src={image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{[item.size, item.color].filter(Boolean).join(' / ')}</p>
                    <p className="text-primary font-semibold text-sm mt-1">{format(item.price)}</p>
                  </div>
                  <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-1.5"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-500 p-2"><Trash2 size={18} /></button>
                </div>
              );
            })}
          </div>

          <div className="card p-5 h-fit">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between text-sm mb-2">
              <span>Subtotal</span><span>{format(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2 text-gray-500">
              <span>Shipping</span><span>{subtotal > 100 ? 'Free' : format(9.99)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
              <span>Total</span><span>{format(subtotal + (subtotal > 100 ? 0 : 9.99))}</span>
            </div>
            <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 mt-5">
              Checkout <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
