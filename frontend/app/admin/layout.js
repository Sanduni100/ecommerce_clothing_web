'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Tag, ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/chat', label: 'Live Chat', icon: MessageCircle },
];

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="max-w-lg mx-auto px-4 py-20 text-center text-sm text-gray-500">Checking admin access...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid md:grid-cols-5 gap-8">
      <aside className="md:col-span-1">
        <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
          <ArrowLeft size={14} /> Back to store
        </Link>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-primary text-white' : 'hover:bg-blush dark:hover:bg-gray-800'
                }`}>
                <item.icon size={16} /> {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="md:col-span-4">{children}</div>
    </div>
  );
}
