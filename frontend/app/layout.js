import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LiveChatWidget from '../components/LiveChatWidget';
import CartDrawer from '../components/CartDrawer';
import Providers from './providers';

export const metadata = {
  title: 'coop shop | Fashion & Lifestyle',
  description: 'Your destination for fashion, accessories and everyday essentials.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <LiveChatWidget />
        </Providers>
      </body>
    </html>
  );
}
