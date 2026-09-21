'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShoppingBag, User, Menu, X, Search, Heart } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { currency, changeCurrency } = useCurrency();
  const router = useRouter();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/shop?category=women', label: 'Women' },
    { href: '/shop?category=men', label: 'Men' },
    { href: '/shop?category=accessories', label: 'Accessories' },
    { href: '/faq', label: 'FAQ' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
      {/* Top utility bar */}
      <div className="hidden md:flex items-center justify-end gap-4 px-6 py-1.5 text-xs bg-blush/60 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        <span>Free shipping on orders over $100</span>
        <select
          value={currency}
          onChange={(e) => changeCurrency(e.target.value)}
          className="bg-transparent font-medium text-primary cursor-pointer focus:outline-none"
          aria-label="Currency"
        >
          <option value="USD">USD $</option>
          <option value="LKR">LKR Rs</option>
        </select>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4 justify-between">
        <Link href="/" className="text-xl font-bold text-primary dark:text-secondary-light whitespace-nowrap">
          coop<span className="text-accent">shop</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="text-sm font-medium hover:text-primary dark:hover:text-secondary-light transition-colors whitespace-nowrap">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-sm relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-full bg-blush dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </form>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            className="sm:hidden p-2 rounded-full hover:bg-blush dark:hover:bg-gray-800"
            aria-label="Search"
            onClick={() => router.push('/shop')}
          >
            <Search size={20} />
          </button>
          <ThemeToggle />

          <Link href="/account/wishlist" className="relative p-2 rounded-full hover:bg-blush dark:hover:bg-gray-800" aria-label="Wishlist">
            <Heart size={20} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          <button onClick={openDrawer} className="relative p-2 rounded-full hover:bg-blush dark:hover:bg-gray-800" aria-label="Cart">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="relative group hidden sm:block">
              <button className="p-2 rounded-full hover:bg-blush dark:hover:bg-gray-800" aria-label="Account">
                <User size={20} />
              </button>
              <div className="absolute right-0 mt-1 w-44 card p-2 hidden group-hover:block">
                <p className="px-2 py-1 text-xs text-gray-500 truncate">Hi, {user.name}</p>
                {user.role === 'admin' && (
                  <Link href="/admin" className="block px-2 py-1.5 text-sm rounded hover:bg-blush dark:hover:bg-gray-800">Admin Panel</Link>
                )}
                <Link href="/account/orders" className="block px-2 py-1.5 text-sm rounded hover:bg-blush dark:hover:bg-gray-800">My Orders</Link>
                <Link href="/account/wishlist" className="block px-2 py-1.5 text-sm rounded hover:bg-blush dark:hover:bg-gray-800">Favourites</Link>
                <button onClick={logout} className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-blush dark:hover:bg-gray-800">Logout</button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="hidden sm:block p-2 rounded-full hover:bg-blush dark:hover:bg-gray-800" aria-label="Login">
              <User size={20} />
            </Link>
          )}

          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-2">
          <form onSubmit={handleSearch} className="relative mb-2 sm:hidden">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-full bg-blush dark:bg-gray-800 focus:outline-none"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </form>
          {links.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block py-1.5 text-sm font-medium">
              {l.label}
            </Link>
          ))}
          {user ? (
            <button onClick={logout} className="block py-1.5 text-sm font-medium text-left w-full">Logout</button>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="block py-1.5 text-sm font-medium">Login</Link>
          )}
        </div>
      )}
    </header>
  );
}
