'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); return; }
    try {
      const { data } = await api.get('/wishlist');
      setItems(data.items);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const isFavourite = (productId) => items.some((i) => i.id === productId);

  const toggleFavourite = async (product) => {
    if (!user) { toast.error('Please log in to save favourites'); return; }
    try {
      if (isFavourite(product.id)) {
        await api.delete(`/wishlist/${product.id}`);
        setItems((prev) => prev.filter((i) => i.id !== product.id));
        toast.success('Removed from favourites');
      } else {
        await api.post('/wishlist', { product_id: product.id });
        setItems((prev) => [...prev, product]);
        toast.success('Added to favourites');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update favourites');
    }
  };

  return (
    <WishlistContext.Provider value={{ items, isFavourite, toggleFavourite, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
