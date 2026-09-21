'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/PasswordInput';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await register(form.name, form.email, form.password);
    setSubmitting(false);
    if (ok) router.push('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-xl font-bold mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Join coop shop for a better shopping experience</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Full Name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="email" required placeholder="Email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <PasswordInput required placeholder="Password (min 6 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Creating account...' : 'Sign Up'}</button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account? <Link href="/login" className="text-primary font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
