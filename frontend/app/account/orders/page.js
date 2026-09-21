'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useCurrency } from '../../../context/CurrencyContext';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { format } = useCurrency();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) api.get('/orders').then((res) => setOrders(res.data.orders)).catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="mb-4">Please log in to view your orders.</p>
        <Link href="/login" className="btn-primary">Log In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{o.order_number}</p>
                <p className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString()}</p>
                <p className="text-[11px] text-gray-400 uppercase mt-0.5">{o.payment_method === 'cod' ? 'Cash on Delivery' : 'Card (Stripe)'}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[o.status] || 'bg-gray-100 text-gray-700'}`}>
                {o.status}
              </span>
              <p className="font-semibold text-primary">{format(o.total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
