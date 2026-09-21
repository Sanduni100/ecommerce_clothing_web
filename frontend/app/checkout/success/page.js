'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Truck } from 'lucide-react';
import api from '../../../lib/api';
import { useCart } from '../../../context/CartContext';
import { useCurrency } from '../../../context/CurrencyContext';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState(null);
  const { refreshCart } = useCart();
  const { format } = useCurrency();

  useEffect(() => {
    if (!orderId) return;
    refreshCart();
    api.get(`/payment/session/${orderId}`).then((res) => setOrder(res.data.order)).catch(() => {});
    // eslint-disable-next-line
  }, [orderId]);

  const isCod = order?.payment_method === 'cod';

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      {isCod ? <Truck size={64} className="mx-auto text-primary mb-4" /> : <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />}
      <h1 className="text-2xl font-bold">
        {isCod ? 'Order placed!' : 'Thank you for your order!'}
      </h1>
      <p className="text-gray-500 mt-2">
        {order ? `Order ${order.order_number} — ${format(order.total)}` : 'Confirming your order...'}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        {isCod
          ? "You'll pay in cash when your order is delivered."
          : <>Payment status: <span className="font-medium text-primary">{order?.payment_status || 'processing'}</span></>}
      </p>
      <Link href="/account/orders" className="btn-primary inline-block mt-6">View My Orders</Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-24 text-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
