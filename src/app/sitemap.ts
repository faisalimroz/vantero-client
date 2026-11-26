import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vanterobd.com';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/look/wear-your-identity-aw26`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const [productsRes, categoriesRes, blogsRes] = await Promise.all([
      fetch(`${apiUrl}/products?limit=100`, { next: { revalidate: 3600 } }).catch(() => null),
      fetch(`${apiUrl}/categories`, { next: { revalidate: 3600 } }).catch(() => null),
      fetch(`${apiUrl}/blogs`, { next: { revalidate: 3600 } }).catch(() => null),
    ]);

    const dynamicUrls: MetadataRoute.Sitemap = [];

    if (productsRes && productsRes.ok) {
      const pData = await productsRes.json();
      pData.products?.forEach((p: any) => {
        if (p.slug) {
          dynamicUrls.push({
            url: `${baseUrl}/product/${p.slug}`,
            lastModified: new Date(p.updatedAt || p.createdAt || Date.now()),
            changeFrequency: 'daily',
            priority: 0.8,
          });
        }
      });
    }

    if (categoriesRes && categoriesRes.ok) {
      const cData = await categoriesRes.json();
      cData.categories?.forEach((c: any) => {
        if (c.slug) {
          dynamicUrls.push({
            url: `${baseUrl}/shop?category=${c.slug}`,
            lastModified: new Date(c.updatedAt || c.createdAt || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });
    }

    if (blogsRes && blogsRes.ok) {
      const bData = await blogsRes.json();
      bData.blogs?.forEach((b: any) => {
        if (b.slug) {
          dynamicUrls.push({
            url: `${baseUrl}/blogs/${b.slug}`,
            lastModified: new Date(b.updatedAt || b.publishedAt || b.createdAt || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.75,
          });
        }
      });
    }

    return [...staticRoutes, ...dynamicUrls];
  } catch (e) {
    return staticRoutes;
  }
}
