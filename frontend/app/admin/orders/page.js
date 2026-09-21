'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { useCurrency } from '../../../context/CurrencyContext';

const statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const { format } = useCurrency();

  const load = () => api.get('/admin/orders').then((res) => setOrders(res.data.orders));
  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      toast.success(`Order marked as ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update order');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-100 dark:border-gray-800 text-gray-500">
              <th className="p-3">Order #</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Payment</th><th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-50 dark:border-gray-900">
                <td className="p-3">{o.order_number}</td>
                <td className="p-3">{o.customer_name}<br /><span className="text-xs text-gray-500">{o.customer_email}</span></td>
                <td className="p-3">{format(o.total)}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {o.payment_status}
                  </span>
                  <p className="text-[11px] text-gray-400 mt-1 uppercase">{o.payment_method === 'cod' ? 'Cash on Delivery' : 'Card (Stripe)'}</p>
                </td>
                <td className="p-3">
                  <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)} className="input py-1 px-2 text-xs w-32">
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-4 text-sm text-gray-500">No orders yet.</p>}
      </div>
    </div>
  );
}
