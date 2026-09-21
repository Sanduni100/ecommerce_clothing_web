'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const refreshCart = useCallback(async () => {
    if (!user) { setItems([]); setSubtotal(0); return; }
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setItems(data.items);
      setSubtotal(data.subtotal);
    } catch (err) {
      // silent - cart just stays empty if it fails
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const addToCart = async (product_id, quantity = 1, size = null, color = null) => {
    if (!user) {
      toast.error('Please log in to add items to your cart');
      return false;
    }
    try {
      const { data } = await api.post('/cart', { product_id, quantity, size, color });
      toast.success(data.message || 'Added to cart');
      refreshCart();
      openDrawer();
      return true;
    } catch (err) {
      console.error('addToCart failed:', err);
      toast.error(err.response?.data?.message || err.message || 'Could not add to cart');
      return false;
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      await api.put(`/cart/${id}`, { quantity });
      refreshCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update cart');
    }
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/cart/${id}`);
      toast.success('Item removed');
      refreshCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove item');
    }
  };

  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, subtotal, itemCount, loading, addToCart, updateQuantity, removeItem, refreshCart, drawerOpen, openDrawer, closeDrawer }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
