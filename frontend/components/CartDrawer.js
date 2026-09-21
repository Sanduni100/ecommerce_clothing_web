'use client';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { getImageUrl } from '../lib/getImageUrl';

export default function CartDrawer() {
  const { items, subtotal, drawerOpen, closeDrawer, updateQuantity, removeItem } = useCart();
  const { format } = useCurrency();

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-950 shadow-2xl flex flex-col animate-in slide-in-from-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-lg">Cart ({items.length})</h2>
          <button onClick={closeDrawer} aria-label="Close cart"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="mx-auto text-gray-300" size={40} />
              <p className="text-gray-500 mt-3">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => {
              const image = getImageUrl(item.images?.[0], 'https://placehold.co/160x160/EDE0F5/7B68B0?text=Item');
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-blush dark:bg-gray-800 flex-shrink-0">
                    <Image src={image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{[item.size, item.color].filter(Boolean).join(' / ')}</p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-1"><Minus size={12} /></button>
                        <span className="w-6 text-center text-xs">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1"><Plus size={12} /></button>
                      </div>
                      <span className="text-sm font-semibold text-primary">{format(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 self-start">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-5">
            <div className="flex justify-between font-semibold mb-4">
              <span>Subtotal</span>
              <span>{format(subtotal)}</span>
            </div>
            <Link href="/cart" onClick={closeDrawer} className="btn-outline w-full text-center block mb-2">View Cart</Link>
            <Link href="/checkout" onClick={closeDrawer} className="btn-primary w-full text-center block">Checkout</Link>
          </div>
        )}
      </div>
    </div>
  );
}
