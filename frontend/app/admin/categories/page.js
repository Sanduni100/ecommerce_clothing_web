'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../../lib/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '' });

  const load = () => api.get('/categories').then((res) => setCategories(res.data.categories));
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Category name is required');
    try {
      await api.post('/admin/categories', {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
      toast.success('Category added');
      setForm({ name: '', slug: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add category');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete category');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      <form onSubmit={handleAdd} className="card p-4 flex gap-3 mb-6">
        <input className="input" placeholder="Category name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <button className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"><Plus size={16} /> Add</button>
      </form>
      <div className="card divide-y divide-gray-100 dark:divide-gray-800">
        {categories.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between">
            <span className="text-sm">{c.name}</span>
            <button onClick={() => handleDelete(c.id)} className="text-red-500"><Trash2 size={16} /></button>
          </div>
        ))}
        {categories.length === 0 && <p className="p-4 text-sm text-gray-500">No categories yet.</p>}
      </div>
    </div>
  );
}
