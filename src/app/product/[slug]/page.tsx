import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: { slug: string };
}

async function getProductData(slug: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getProductData(params.slug);
  if (!data?.product) {
    return { title: 'Product Not Found | VANTERO' };
  }

  const product = data.product;
  const price = product.priceCalculation?.finalPrice ?? product.basePrice;

  return {
    title: `${product.title} (৳${price.toLocaleString()})`,
    description: product.description || 'Authentic luxury menswear & footwear at Vantero Bangladesh.',
    openGraph: {
      title: `${product.title} | VANTERO`,
      description: product.description,
      images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const data = await getProductData(params.slug);
  if (!data?.product) {
    notFound();
  }

  const { product, relatedProducts } = data;

  // JSON-LD Product & Breadcrumb Schema for Technical SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images?.map((i: any) => i.url) || [],
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'VANTERO',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: product.priceCalculation?.finalPrice ?? product.basePrice,
      availability:
        product.priceCalculation?.inStock !== false
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Vantero',
      },
    },
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col mt-3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar transparentOnTop={false} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Interactive PDP Client View */}
        <ProductDetailClient product={product} />

        {/* Related Products Shelf */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-20 pt-16 border-t border-line text-left">
            <h3 className="text-xl font-bold tracking-tight text-ink-900 mb-8">
              Complete the Aesthetic
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel: any) => (
                <ProductCard key={rel._id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
