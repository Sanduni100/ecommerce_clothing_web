'use client';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { CurrencyProvider } from '../context/CurrencyContext';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: { background: '#7B68B0', color: '#fff', borderRadius: '10px' },
                  success: { iconTheme: { primary: '#fff', secondary: '#7B68B0' } },
                  error: { style: { background: '#E05B5B' } },
                }}
              />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
