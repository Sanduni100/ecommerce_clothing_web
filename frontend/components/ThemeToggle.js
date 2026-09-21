'use client';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="p-2 rounded-full hover:bg-blush dark:hover:bg-gray-800 transition-colors"
    >
      {theme === 'dark' ? <Sun size={20} className="text-secondary-light" /> : <Moon size={20} className="text-primary" />}
    </button>
  );
}
