'use client';
import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Package, Users } from 'lucide-react';
import api from '../../lib/api';
import { useCurrency } from '../../context/CurrencyContext';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const { format } = useCurrency();

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return <p className="text-sm text-gray-500">Loading dashboard...</p>;

  const cards = [
    { label: 'Total Revenue', value: format(data.stats.totalRevenue), icon: DollarSign },
    { label: 'Total Orders', value: data.stats.totalOrders, icon: ShoppingBag },
    { label: 'Products', value: data.stats.totalProducts, icon: Package },
    { label: 'Customers', value: data.stats.totalCustomers, icon: Users },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="p-2 rounded-full bg-blush dark:bg-gray-800 text-primary w-fit mb-3"><c.icon size={18} /></div>
            <p className="text-xl font-bold">{c.value}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Recent Orders</h2>
          {data.recentOrders.length === 0 ? <p className="text-sm text-gray-500">No orders yet.</p> : (
            <div className="space-y-3">
              {data.recentOrders.map((o) => (
                <div key={o.id} className="flex justify-between text-sm">
                  <span>{o.order_number} — {o.customer_name}</span>
                  <span className="font-medium">{format(o.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Low Stock Alerts</h2>
          {data.lowStock.length === 0 ? <p className="text-sm text-gray-500">All products well stocked.</p> : (
            <div className="space-y-3">
              {data.lowStock.map((p) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="font-medium text-red-500">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
