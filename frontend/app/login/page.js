'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/PasswordInput';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await login(form.email, form.password);
    setSubmitting(false);
    if (ok) router.push('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-xl font-bold mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Log in to continue shopping</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required placeholder="Email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <PasswordInput required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Logging in...' : 'Log In'}</button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Don't have an account? <Link href="/register" className="text-primary font-medium">Sign up</Link>
        </p>
        <p className="text-xs text-gray-400 mt-6 text-center">Admin demo login: admin@coopshop.com / Admin@123</p>
      </div>
    </div>
  );
}
