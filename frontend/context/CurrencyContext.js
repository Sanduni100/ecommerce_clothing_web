'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const CurrencyContext = createContext();

// Approximate, static conversion rate. All prices in the database are stored in USD;
// for a production site, swap this for a live FX rate feed instead of a fixed constant.
export const USD_TO_LKR = 300;

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const saved = localStorage.getItem('currency');
    if (saved) setCurrency(saved);
  }, []);

  const changeCurrency = (c) => {
    setCurrency(c);
    localStorage.setItem('currency', c);
  };

  // Formats a USD amount (as stored in the DB) in whichever currency is selected.
  const format = (usdAmount) => {
    const amount = Number(usdAmount) || 0;
    if (currency === 'LKR') {
      return `Rs. ${(amount * USD_TO_LKR).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
    }
    return `$${amount.toFixed(2)}`;
  };

  // Formats a USD amount in an EXPLICIT currency, regardless of the globally selected one.
  // Used by the admin product form so admins can preview "Rs. X" while the site-wide switcher is set to USD.
  const formatIn = (usdAmount, explicitCurrency) => {
    const amount = Number(usdAmount) || 0;
    if (explicitCurrency === 'LKR') {
      return `Rs. ${(amount * USD_TO_LKR).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
    }
    return `$${amount.toFixed(2)}`;
  };

  // Converts an amount ENTERED in `fromCurrency` back to USD for storage in the database.
  // All product prices are persisted in USD; this is what lets an admin type a price in Rs.
  const toUSD = (amount, fromCurrency) => {
    const n = Number(amount) || 0;
    return fromCurrency === 'LKR' ? n / USD_TO_LKR : n;
  };

  // Converts a USD amount to the given currency's raw number (no symbol) - used to pre-fill
  // the admin price input when editing a product and switching the currency dropdown.
  const fromUSD = (usdAmount, toCurrency) => {
    const n = Number(usdAmount) || 0;
    return toCurrency === 'LKR' ? Math.round(n * USD_TO_LKR) : n;
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, format, formatIn, toUSD, fromUSD }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
