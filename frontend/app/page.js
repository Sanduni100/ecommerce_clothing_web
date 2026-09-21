'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, CreditCard, Headphones } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import api from '../lib/api';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/products?featured=true&limit=8')
      .then((res) => setFeatured(res.data.products))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-blush dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center relative z-10">
          <div>
            <span className="inline-block bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              50% OFF Summer Sale
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
              Step into Style: Your <span className="text-primary">Ultimate</span> Fashion Destination
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md">
              Discover curated collections of clothing and accessories, crafted for comfort and made to turn heads.
            </p>
            <Link href="/shop" className="btn-primary inline-flex items-center gap-2 mt-6">
              Shop Now <ArrowRight size={18} />
            </Link>
          </div>
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-card">
            <Image src="/images/hero-store.jpg" alt="coop shop store" fill className="object-cover" priority />
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'Free shipping for orders above $100' },
            { icon: CreditCard, title: 'Flexible Payment', desc: 'Multiple secure payment options' },
            { icon: Headphones, title: '24/7 Support', desc: 'Live chat support every day' },
          ].map((p) => (
            <div key={p.title} className="card p-5 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blush dark:bg-gray-800 text-primary">
                <p.icon size={22} />
              </div>
              <div>
                <p className="font-semibold text-sm">{p.title}</p>
                <p className="text-xs text-gray-500">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category quick links with real photography */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'For Women', slug: 'women', count: '2500+ Items', img: '/images/category-women.jpg' },
          { name: 'For Men', slug: 'men', count: '1500+ Items', img: '/images/category-men.jpg' },
          { name: 'Accessories', slug: 'accessories', count: '800+ Items', img: '/images/category-accessories-model.jpg' },
        ].map((c) => (
          <Link key={c.slug} href={`/shop?category=${c.slug}`} className="group relative rounded-xl overflow-hidden aspect-[4/5] shadow-card">
            <Image src={c.img} alt={c.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 text-white">
              <p className="font-bold text-xl">{c.name}</p>
              <p className="text-sm text-white/80 mt-1">{c.count}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link href="/shop" className="text-sm text-primary font-medium hover:underline">View all →</Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-sm text-gray-500">No featured products yet — add some from the admin panel.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
