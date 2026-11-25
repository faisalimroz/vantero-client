import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthModal } from '@/components/storefront/AuthModal';
import { BagDrawer } from '@/components/storefront/BagDrawer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'VANTERO | Modern Luxury Menswear, Footwear & Niche Fragrances',
    template: '%s | VANTERO',
  },
  description:
    'Handcrafted Italian leather court sneakers, tailored wool overcoats, and artisanal niche extrait de parfum in Bangladesh. Cash on delivery nationwide with 7-day free exchanges.',
  keywords: [
    'Vantero',
    'Luxury Menswear Bangladesh',
    'Handmade Sneakers Dhaka',
    'Wool Overcoat',
    'Nocturne Extrait de Parfum',
    'Cash on Delivery Dhaka',
  ],
  authors: [{ name: 'Vantero Ltd.' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vantero.com',
    siteName: 'VANTERO',
    title: 'VANTERO | Wear Your Identity',
    description:
      'Authentic sneakers, shoes, clothing and fragrance for men and boys. Cash on delivery nationwide, 7-day exchanges.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200',
        width: 1200,
        height: 630,
        alt: 'Vantero AW26 Editorial',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    'mock_google_client_id.apps.googleusercontent.com';

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-paper text-ink-900 font-sans antialiased selection:bg-gold-500 selection:text-white">
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <CartProvider>
              {children}
              <AuthModal />
              <BagDrawer />
            </CartProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
