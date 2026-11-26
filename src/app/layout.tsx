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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vanterobd.com'),
  title: {
    default: 'VANTERO | Modern Luxury Menswear, Footwear & Niche Fragrances',
    template: '%s | VANTERO',
  },
  description:
    'Handcrafted Italian leather sneakers, tailored menswear & niche extrait de parfum in Bangladesh. 100% Cash on delivery nationwide with 7-day doorstep exchanges.',
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: 'https://vanterobd.com',
  },
  authors: [{ name: 'Vantero Bangladesh Ltd.' }],
  openGraph: {
    type: 'website',
    locale: 'en_BD',
    url: 'https://vanterobd.com',
    siteName: 'VANTERO',
    title: 'VANTERO | Wear Your Identity',
    description:
      'Handcrafted Italian leather sneakers, tailored menswear & niche extrait de parfum in Bangladesh. 100% Cash on delivery nationwide with 7-day doorstep exchanges.',
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
