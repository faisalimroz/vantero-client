import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
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
      url: `${baseUrl}/look/wear-your-identity-aw26`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${apiUrl}/products?limit=100`, { next: { revalidate: 3600 } }),
      fetch(`${apiUrl}/categories`, { next: { revalidate: 3600 } }),
    ]);

    const productUrls: MetadataRoute.Sitemap = [];
    const categoryUrls: MetadataRoute.Sitemap = [];

    if (productsRes.ok) {
      const pData = await productsRes.json();
      pData.products?.forEach((p: any) => {
        productUrls.push({
          url: `${baseUrl}/product/${p.slug}`,
          lastModified: new Date(p.updatedAt || p.createdAt),
          changeFrequency: 'daily',
          priority: 0.8,
        });
      });
    }

    if (categoriesRes.ok) {
      const cData = await categoriesRes.json();
      cData.categories?.forEach((c: any) => {
        categoryUrls.push({
          url: `${baseUrl}/shop?category=${c.slug}`,
          lastModified: new Date(c.updatedAt || c.createdAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    }

    return [...staticRoutes, ...categoryUrls, ...productUrls];
  } catch (e) {
    return staticRoutes;
  }
}
