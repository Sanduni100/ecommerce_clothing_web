'use client';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Facebook, Instagram, Youtube, Music2 } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter your email address');
    toast.success('Thanks for subscribing!');
    setEmail('');
  };

  const columns = [
    {
      title: 'Shop',
      links: [
        { label: 'New Arrivals', href: '/shop' },
        { label: 'Women', href: '/shop?category=women' },
        { label: 'Men', href: '/shop?category=men' },
        { label: 'Accessories', href: '/shop?category=accessories' },
        { label: 'Sale', href: '/shop' },
      ],
    },
    {
      title: 'Information',
      links: [
        { label: 'Shipping Policy', href: '/faq' },
        { label: 'Returns & Exchanges', href: '/faq' },
        { label: 'Terms & Conditions', href: '/faq' },
        { label: 'Privacy Policy', href: '/faq' },
        { label: 'FAQs', href: '/faq' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/' },
        { label: 'Contact Us', href: '/faq' },
        { label: 'My Orders', href: '/account/orders' },
        { label: 'Favourites', href: '/account/wishlist' },
      ],
    },
  ];

  return (
    <footer className="bg-[#0d1b4c] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        {columns.map((col) => (
          <div key={col.title}>
            <p className="font-bold text-sm tracking-wide mb-4">{col.title.toUpperCase()}</p>
            <ul className="space-y-2.5 text-sm text-blue-100/70">
              {col.links.map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="font-bold text-sm tracking-wide mb-4">NEWSLETTER SIGN UP</p>
          <p className="text-sm text-blue-100/70 mb-3">Sign up for exclusive updates, new arrivals & insider only discounts</p>
          <form onSubmit={handleSubscribe} className="flex">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="enter your email address"
              className="flex-1 min-w-0 px-3 py-2.5 text-sm text-gray-900 bg-transparent border border-white/40 rounded-l-md focus:outline-none placeholder:text-white/60"
              style={{ backgroundColor: 'transparent', color: 'white' }}
            />
            <button className="bg-white text-[#0d1b4c] font-bold text-xs px-4 rounded-r-md hover:bg-blush transition-colors">SUBMIT</button>
          </form>
          <div className="flex gap-2 mt-5">
            {[Facebook, Instagram, Music2, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-white text-[#0d1b4c] flex items-center justify-center hover:bg-blush transition-colors">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-blue-100/50 py-4 border-t border-white/10">
        © {new Date().getFullYear()} coop shop. All rights reserved.
      </div>
    </footer>
  );
}
