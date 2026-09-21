'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { List, LayoutGrid, Rows3, Grid3x3, ChevronDown, ChevronRight } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import api from '../../lib/api';

const staticGroups = [
  { label: 'New Arrivals', slug: '' },
  {
    label: 'Women', slug: 'women',
    children: ['Dresses', 'Tops', 'Outerwear'],
  },
  { label: 'Men', slug: 'men', children: ['Shirts', 'Trousers', 'Jackets'] },
  { label: 'Accessories', slug: 'accessories', children: ['Bags', 'Jewellery', 'Hats'] },
];

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
};

function ShopContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [cols, setCols] = useState(3);
  const [perPage, setPerPage] = useState(20);
  const [expanded, setExpanded] = useState({ women: true });

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    params.set('sort', sort);
    params.set('limit', perPage);
    api.get(`/products?${params.toString()}`)
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }, [category, search, sort, perPage]);

  const toggleExpand = (slug) => setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-xs text-gray-500 mb-4">
        Home {category && <> &gt; <span className="capitalize text-gray-800 dark:text-gray-200">{category}</span></>}
        {search && <> &gt; Search: "{search}"</>}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <p className="font-bold text-sm tracking-wide mb-3 border-b border-gray-200 dark:border-gray-800 pb-2">CATEGORIES</p>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="/shop" className={`block py-1.5 hover:text-primary ${!category ? 'text-primary font-semibold' : ''}`}>New Arrivals</a>
            </li>
            {staticGroups.filter((g) => g.slug).map((g) => (
              <li key={g.slug}>
                <div className="flex items-center justify-between py-1.5">
                  <a href={`/shop?category=${g.slug}`} className={`hover:text-primary uppercase font-medium ${category === g.slug ? 'text-primary' : ''}`}>
                    {g.label}
                  </a>
                  {g.children && (
                    <button onClick={() => toggleExpand(g.slug)} aria-label="Expand">
                      {expanded[g.slug] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  )}
                </div>
                {g.children && expanded[g.slug] && (
                  <ul className="pl-3 space-y-1 border-l border-gray-200 dark:border-gray-800 ml-1">
                    {g.children.map((c) => (
                      <li key={c}>
                        <a href={`/shop?category=${g.slug}&search=${encodeURIComponent(c)}`} className="block py-1 text-gray-500 hover:text-primary text-xs">
                          {c}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </aside>

        <div className="lg:col-span-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h1 className="text-2xl font-bold capitalize">{search ? `Results for "${search}"` : category || 'All Products'}</h1>
              <p className="text-sm text-gray-500 mt-1">{products.length} products found</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-800 rounded-lg p-1">
                {[
                  { n: 1, Icon: List },
                  { n: 2, Icon: Rows3 },
                  { n: 3, Icon: LayoutGrid },
                  { n: 4, Icon: Grid3x3 },
                ].map(({ n, Icon }) => (
                  <button
                    key={n}
                    onClick={() => setCols(n)}
                    className={`p-1.5 rounded ${cols === n ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary'}`}
                    aria-label={`${n} column view`}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Per page</span>
                <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="input py-1.5 px-2 w-20">
                  <option value={12}>12</option>
                  <option value={20}>20</option>
                  <option value={40}>40</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Sort by</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="input py-1.5 px-2 w-40">
                  <option value="newest">Date, new to old</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-gray-500">No products found — try a different category or search term.</p>
          ) : (
            <div className={`grid ${gridCols[cols]} gap-5`}>
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
