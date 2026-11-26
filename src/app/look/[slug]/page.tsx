import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { ShopTheLookSection } from '@/components/storefront/ShopTheLookSection';

interface Props {
  params: { slug: string };
}

async function getLook(slug: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const res = await fetch(`${API_URL}/shop-the-look/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.look;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const look = await getLook(params.slug);
  if (!look) return { title: 'Lookbook | VANTERO' };

  return {
    title: `${look.title} | Shop the Look`,
    description: look.description || 'Curated luxury ensemble crafted for everyday elegance.',
  };
}

export default async function LookPage({ params }: Props) {
  const look = await getLook(params.slug);
  if (!look) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Navbar transparentOnTop={false} />

      <main className="flex-1 py-10 w-full">
        <ShopTheLookSection look={look} />
      </main>

      <Footer />
    </div>
  );
}
