'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CreditCard, Truck, ShieldCheck, Lock } from 'lucide-react';
import api from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const { user } = useAuth();
  const { format } = useCurrency();
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', line1: '', city: '', state: '', postal_code: '', country: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' | 'cod'
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="mb-4">Please log in to checkout.</p>
        <button onClick={() => router.push('/login')} className="btn-primary">Log In</button>
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateAddress = () => {
    if (!form.full_name || !form.line1 || !form.city || !form.postal_code || !form.country) {
      toast.error('Please fill in all required shipping fields');
      return false;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return false;
    }
    return true;
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!validateAddress()) return;

    setSubmitting(true);
    try {
      if (paymentMethod === 'cod') {
        const { data } = await api.post('/orders/cod', { shippingAddress: form });
        toast.success(data.message || 'Order placed successfully');
        router.push(`/checkout/success?order=${data.orderId}`);
        return;
      }
      // Stripe card payment
      const { data } = await api.post('/payment/create-checkout-session', { shippingAddress: form });
      if (data.url) window.location.href = data.url; // redirect to Stripe Checkout
    } catch (err) {
      console.error('Checkout failed:', err);
      toast.error(err.response?.data?.message || err.message || 'Could not complete checkout');
    } finally {
      setSubmitting(false);
    }
  };

  const shippingFee = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shippingFee;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-2">Checkout</h1>
      <p className="text-sm text-gray-500 mb-6 flex items-center gap-1.5"><Lock size={13} /> Your information is encrypted and secure</p>

      <div className="grid md:grid-cols-3 gap-8">
        <form onSubmit={handlePay} className="md:col-span-2 space-y-6">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold">1. Shipping Address</h2>
            <input name="full_name" placeholder="Full Name *" className="input" value={form.full_name} onChange={handleChange} />
            <input name="line1" placeholder="Address Line *" className="input" value={form.line1} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-3">
              <input name="city" placeholder="City *" className="input" value={form.city} onChange={handleChange} />
              <input name="state" placeholder="State / Province" className="input" value={form.state} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input name="postal_code" placeholder="Postal Code *" className="input" value={form.postal_code} onChange={handleChange} />
              <input name="country" placeholder="Country *" className="input" value={form.country} onChange={handleChange} />
            </div>
            <input name="phone" placeholder="Phone Number" className="input" value={form.phone} onChange={handleChange} />
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="font-semibold mb-1">2. Payment Method</h2>

            <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
              paymentMethod === 'stripe' ? 'border-primary bg-blush/50 dark:bg-primary/10' : 'border-gray-200 dark:border-gray-700'
            }`}>
              <input type="radio" name="paymentMethod" className="mt-1" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <CreditCard size={16} className="text-primary" /> Pay with Card
                </div>
                <p className="text-xs text-gray-500 mt-1">Visa, Mastercard, Amex — securely processed by Stripe. You'll be redirected to complete payment.</p>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
              paymentMethod === 'cod' ? 'border-primary bg-blush/50 dark:bg-primary/10' : 'border-gray-200 dark:border-gray-700'
            }`}>
              <input type="radio" name="paymentMethod" className="mt-1" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <Truck size={16} className="text-primary" /> Cash on Delivery
                </div>
                <p className="text-xs text-gray-500 mt-1">Pay in cash when your order arrives. No card required.</p>
              </div>
            </label>

            <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
              {submitting
                ? 'Processing...'
                : paymentMethod === 'cod'
                ? `Place Order — ${format(total)}`
                : `Pay ${format(total)} with Card`}
            </button>
            <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} /> {paymentMethod === 'stripe' ? "You'll be redirected to Stripe's secure checkout." : 'Your order is confirmed instantly.'}
            </p>
          </div>
        </form>

        <div className="card p-5 h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm mb-2">
              <span className="truncate pr-2">{item.name} × {item.quantity}</span>
              <span>{format(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 dark:border-gray-800 mt-3 pt-3 space-y-1">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{format(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span>Shipping</span><span>{shippingFee === 0 ? 'Free' : format(shippingFee)}</span></div>
            <div className="flex justify-between font-bold pt-1"><span>Total</span><span>{format(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
