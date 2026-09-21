'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import api from '../../../lib/api';
import { getImageUrl } from '../../../lib/getImageUrl';
import { useCurrency } from '../../../context/CurrencyContext';

const emptyForm = {
  name: '', slug: '', description: '', price: '', compare_price: '', category_id: '',
  stock: '', sku: '', is_featured: false, sizes: '', colors: '', imageFiles: [], existingImages: [],
  priceCurrency: 'USD',
};

export default function AdminProductsPage() {
  const { format, toUSD, fromUSD } = useCurrency();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const loadProducts = () => api.get('/products?limit=200').then((res) => setProducts(res.data.products));
  useEffect(() => {
    loadProducts();
    api.get('/categories').then((res) => setCategories(res.data.categories));
  }, []);

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name, slug: p.slug, description: p.description || '', price: p.price,
      compare_price: p.compare_price || '', category_id: p.category_id || '', stock: p.stock,
      sku: p.sku || '', is_featured: !!p.is_featured, sizes: (p.sizes || []).join(','), colors: (p.colors || []).join(','),
      imageFiles: [], existingImages: p.images || [], priceCurrency: 'USD',
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const removeExistingImage = (idx) => {
    setForm((f) => ({ ...f, existingImages: f.existingImages.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error('Name and price are required');
    setSaving(true);
    try {
      let images = form.existingImages || [];
      if (form.imageFiles.length > 0) {
        const fd = new FormData();
        form.imageFiles.forEach((file) => fd.append('images', file));
        const { data } = await api.post('/upload/multiple', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        images = [...images, ...data.urls];
      }
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: form.description,
        price: toUSD(form.price, form.priceCurrency),
        compare_price: form.compare_price ? toUSD(form.compare_price, form.priceCurrency) : null,
        category_id: form.category_id || null,
        stock: Number(form.stock) || 0,
        sku: form.sku,
        images,
        sizes: form.sizes ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
        colors: form.colors ? form.colors.split(',').map((s) => s.trim()).filter(Boolean) : [],
        is_featured: form.is_featured,
      };
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created successfully');
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete product');
    }
  };

  const statusFor = (p) => {
    if (p.stock === 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' };
    if (p.stock <= 5) return { label: 'Low Stock', cls: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Active', cls: 'bg-green-100 text-green-700' };
  };

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const pageItems = products.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Add Product</button>
      </div>

      {showForm && (
        <div className="card p-5 mb-6 relative">
          <button onClick={() => setShowForm(false)} className="absolute top-4 right-4"><X size={18} /></button>
          <h2 className="font-semibold mb-4">{editingId ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-3">
            <input className="input" placeholder="Product Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder="Slug (auto if blank)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <div className="flex gap-2">
              <input className="input flex-1" type="number" step="0.01" placeholder="Price *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <select
                className="input w-24 flex-shrink-0"
                value={form.priceCurrency}
                onChange={(e) => setForm({ ...form, priceCurrency: e.target.value })}
              >
                <option value="USD">USD</option>
                <option value="LKR">LKR</option>
              </select>
            </div>
            {form.priceCurrency === 'LKR' && form.price && (
              <p className="text-xs text-gray-500 sm:col-span-2 -mt-2">
                Will be stored as ${toUSD(form.price, 'LKR').toFixed(2)} USD
              </p>
            )}
            <div className="flex gap-2">
              <input className="input flex-1" type="number" step="0.01" placeholder="Compare-at Price" value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} />
              <span className="w-24 flex-shrink-0 flex items-center justify-center text-xs text-gray-400">{form.priceCurrency}</span>
            </div>
            <select className="input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="input" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            <input className="input" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <input className="input" placeholder="Sizes (comma-separated: S,M,L)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
            <input className="input" placeholder="Colors (comma-separated)" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-2">Product Images (you can select multiple)</label>
              <input
                className="input"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setForm({ ...form, imageFiles: Array.from(e.target.files) })}
              />
              {(form.existingImages.length > 0 || form.imageFiles.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.existingImages.map((img, i) => (
                    <div key={`existing-${i}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <Image src={getImageUrl(img)} alt="" fill className="object-cover" />
                      <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {form.imageFiles.map((file, i) => (
                    <div key={`new-${i}`} className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-primary">
                      <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <textarea className="input sm:col-span-2" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
              Feature on homepage
            </label>
            <button disabled={saving} className="btn-primary sm:col-span-2">{saving ? 'Saving...' : 'Save Product'}</button>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-100 dark:border-gray-800 text-gray-500">
              <th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((p) => {
              const status = statusFor(p);
              return (
                <tr key={p.id} className="border-b border-gray-50 dark:border-gray-900">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-blush dark:bg-gray-800 flex-shrink-0">
                        <Image src={getImageUrl(p.images?.[0])} alt={p.name} fill className="object-cover" />
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-500">{p.category_name || '—'}</td>
                  <td className="p-3">{format(p.price)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.cls}`}>{status.label}</span></td>
                  <td className="p-3 flex gap-2 justify-end">
                    <button onClick={() => openEdit(p)} className="p-1.5 hover:text-primary"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-4 text-sm text-gray-500">No products yet.</p>}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-gray-100 dark:border-gray-800 text-sm">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">Previous</button>
            <span className="text-gray-500">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
