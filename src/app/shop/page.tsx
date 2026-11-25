'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProducts, getCategories } from '@/lib/api';
import { TopBar } from '@/components/storefront/TopBar';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { formatBDT } from '@/lib/utils';
import { Filter, X, ChevronDown, Check, SlidersHorizontal, RotateCcw } from 'lucide-react';

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Query Parameters State
  const categoryParam = searchParams.get('category') || '';
  const subCategoryParam = searchParams.get('subCategory') || '';
  const sortParam = searchParams.get('sort') || 'featured';
  const sizeParam = searchParams.get('size') || '';
  const colorParam = searchParams.get('color') || '';
  const discountOnlyParam = searchParams.get('discountOnly') === 'true';
  const inStockParam = searchParams.get('inStock') === 'true';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const qParam = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [facets, setFacets] = useState<{ sizes: string[]; colors: string[] }>({ sizes: [], colors: [] });
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Price input local states
  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam);

  // Load Categories on mount
  useEffect(() => {
    getCategories()
      .then((data) => {
        if (data?.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  // Fetch products whenever searchParams change
  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = {
      page: pageParam,
      limit: 12,
    };
    if (categoryParam) params.category = categoryParam;
    if (subCategoryParam) params.subCategory = subCategoryParam;
    if (sortParam) params.sort = sortParam;
    if (sizeParam) params.size = sizeParam;
    if (colorParam) params.color = colorParam;
    if (discountOnlyParam) params.discountOnly = true;
    if (inStockParam) params.inStock = true;
    if (minPriceParam) params.minPrice = minPriceParam;
    if (maxPriceParam) params.maxPrice = maxPriceParam;
    if (qParam) params.q = qParam;

    getProducts(params)
      .then((res) => {
        if (res?.success) {
          setProducts(res.products || []);
          if (res.pagination) setPagination(res.pagination);
          if (res.facets) setFacets(res.facets);
        }
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    categoryParam,
    subCategoryParam,
    sortParam,
    sizeParam,
    colorParam,
    discountOnlyParam,
    inStockParam,
    minPriceParam,
    maxPriceParam,
    qParam,
    pageParam,
  ]);

  // Update URL Search Parameters without full page reloads
  const updateQuery = (updates: Record<string, any>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || value === false) {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }
    });

    // Reset to page 1 on filter changes if page is not explicitly modified
    if (!updates.page && updates.page !== 1) {
      current.set('page', '1');
    }

    const query = current.toString();
    router.push(`/shop${query ? `?${query}` : ''}`, { scroll: false });
  };

  const clearAllFilters = () => {
    router.push('/shop', { scroll: false });
  };

  // Find active category label
  const activeCategoryObj = categories.find((c) => c.slug === categoryParam);

  // Active filter count
  const activeFiltersCount = [
    categoryParam,
    subCategoryParam,
    sizeParam,
    colorParam,
    discountOnlyParam,
    inStockParam,
    minPriceParam,
    maxPriceParam,
    qParam,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-paper flex flex-col mt-4">
      <TopBar />
      <Navbar transparentOnTop={false} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-line pb-6 mb-8 text-left gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-gold-500 mb-1">
              <span>Collection</span>
              <span>/</span>
              <span>{activeCategoryObj?.name || (qParam ? `Search: "${qParam}"` : 'All Products')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink-900">
              {activeCategoryObj?.name || (qParam ? `Results for "${qParam}"` : 'Storefront Collection')}
            </h1>
            <p className="text-xs text-ink-500 mt-1">
              {pagination.total} handcrafted piece{pagination.total === 1 ? '' : 's'} available
            </p>
          </div>

          {/* Controls: Sort and Filter Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-2 px-3.5 py-2 bg-cream border border-line rounded-sm text-xs font-semibold text-ink-900"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            {/* Sort Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-ink-500 hidden sm:inline">Sort:</span>
              <select
                value={sortParam}
                onChange={(e) => updateQuery({ sort: e.target.value })}
                className="px-3 py-2 bg-white border border-line rounded-sm text-xs font-medium text-ink-900 focus:outline-none focus:border-ink-900 font-sans"
              >
                <option value="featured">Featured & Curated</option>
                <option value="newest">Newest Arrivals</option>
                <option value="bestselling">Best Sellers</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-cream/70 border border-line rounded-sm text-xs text-left">
            <span className="text-[11px] font-semibold text-ink-600 uppercase tracking-wider">
              Active Filters:
            </span>

            {categoryParam && (
              <span className="inline-flex items-center bg-white px-2.5 py-1 rounded-sm border border-line text-ink-900">
                Category: {activeCategoryObj?.name || categoryParam}
                <button onClick={() => updateQuery({ category: '' })} className="ml-1.5 hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {sizeParam && (
              <span className="inline-flex items-center bg-white px-2.5 py-1 rounded-sm border border-line text-ink-900">
                Size: {sizeParam}
                <button onClick={() => updateQuery({ size: '' })} className="ml-1.5 hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {discountOnlyParam && (
              <span className="inline-flex items-center bg-white px-2.5 py-1 rounded-sm border border-line text-ink-900">
                Discounted Only
                <button onClick={() => updateQuery({ discountOnly: false })} className="ml-1.5 hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {inStockParam && (
              <span className="inline-flex items-center bg-white px-2.5 py-1 rounded-sm border border-line text-ink-900">
                In Stock Only
                <button onClick={() => updateQuery({ inStock: false })} className="ml-1.5 hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(minPriceParam || maxPriceParam) && (
              <span className="inline-flex items-center bg-white px-2.5 py-1 rounded-sm border border-line text-ink-900">
                Price: {minPriceParam ? formatBDT(minPriceParam) : '৳0'} - {maxPriceParam ? formatBDT(maxPriceParam) : 'Max'}
                <button onClick={() => updateQuery({ minPrice: '', maxPrice: '' })} className="ml-1.5 hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {qParam && (
              <span className="inline-flex items-center bg-white px-2.5 py-1 rounded-sm border border-line text-ink-900">
                Query: "{qParam}"
                <button onClick={() => updateQuery({ q: '' })} className="ml-1.5 hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-[11px] font-semibold text-rose-600 hover:underline ml-2 inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset All
            </button>
          </div>
        )}

        {/* Main Grid: Sidebar Filters + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6 text-left p-5 bg-white border border-line rounded-sm">
            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900 mb-3">
                Categories
              </h3>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => updateQuery({ category: '', subCategory: '' })}
                  className={`w-full text-left py-1.5 px-2 rounded-xs transition-colors flex justify-between ${
                    !categoryParam ? 'bg-ink-900 text-white font-semibold' : 'text-ink-700 hover:bg-cream'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((c) => (
                  <div key={c._id}>
                    <button
                      onClick={() => updateQuery({ category: c.slug, subCategory: '' })}
                      className={`w-full text-left py-1.5 px-2 rounded-xs transition-colors flex justify-between ${
                        categoryParam === c.slug
                          ? 'bg-ink-900 text-white font-semibold'
                          : 'text-ink-700 hover:bg-cream'
                      }`}
                    >
                      <span>{c.name}</span>
                    </button>
                    {/* Subcategories if category selected */}
                    {categoryParam === c.slug && c.subCategories && c.subCategories.length > 0 && (
                      <div className="pl-3 mt-1 space-y-1 border-l border-line ml-2">
                        {c.subCategories.map((sub: any) => (
                          <button
                            key={sub._id}
                            onClick={() => updateQuery({ subCategory: sub.slug })}
                            className={`w-full text-left py-1 px-2 text-[11px] rounded-xs ${
                              subCategoryParam === sub.slug
                                ? 'text-gold-500 font-bold'
                                : 'text-ink-500 hover:text-ink-900'
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Toggles */}
            <div className="pt-4 border-t border-line space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900 mb-2">
                Special Offers
              </h3>
              

              <label className="flex items-center space-x-2 text-xs text-ink-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockParam}
                  onChange={(e) => updateQuery({ inStock: e.target.checked })}
                  className="rounded-xs border-line text-ink-900 focus:ring-ink-900"
                />
                <span>In Stock Only</span>
              </label>
              <label className="flex items-center space-x-2 text-xs text-ink-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={discountOnlyParam}
                  onChange={(e) => updateQuery({ discountOnly: e.target.checked })}
                  className="rounded-xs border-line text-ink-900 focus:ring-ink-900"
                />
                <span>Discounted Pieces Only</span>
              </label>
            </div>

            {/* Sizes Filter */}
            {facets.sizes && facets.sizes.length > 0 && (
              <div className="pt-4 border-t border-line">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900 mb-2.5">
                  Sizes
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {facets.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateQuery({ size: sizeParam === s ? '' : s })}
                      className={`px-2.5 py-1 text-xs font-mono rounded-sm border transition-colors ${
                        sizeParam === s
                          ? 'bg-ink-900 text-white border-ink-900 font-bold'
                          : 'bg-white border-line text-ink-800 hover:border-ink-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter */}
            <div className="pt-4 border-t border-line">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900 mb-2.5">
                Price Range (৳)
              </h3>
              <div className="flex items-center space-x-2 text-xs">
                <input
                  type="number"
                  placeholder="Min"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs font-mono"
                />
                <span className="text-ink-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-line rounded-sm text-xs font-mono"
                />
              </div>
              <button
                onClick={() => updateQuery({ minPrice: localMinPrice, maxPrice: localMaxPrice })}
                className="mt-2.5 w-full py-1.5 bg-stone hover:bg-line text-xs font-semibold rounded-sm text-ink-900 transition-colors"
              >
                Apply Range
              </button>
            </div>
          </aside>

          {/* Products Grid Area */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center bg-white border border-line rounded-sm space-y-3">
                <p className="text-base font-semibold text-ink-900">No products match your filters</p>
                <p className="text-xs text-ink-500">Try adjusting your price range, clearing tags, or browsing another category.</p>
                <Button variant="outline" size="md" onClick={clearAllFilters} className="mt-2">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="mt-12 flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => updateQuery({ page: pagination.page - 1 })}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1 px-3 text-xs font-mono text-ink-600">
                  <span>Page {pagination.page} of {pagination.pages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => updateQuery({ page: pagination.page + 1 })}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center">
          <Skeleton className="h-10 w-48" />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
