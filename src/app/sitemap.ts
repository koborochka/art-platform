import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/config/seo.config';
import { payloadLocalService } from '@/services/api/server/payload-local.service';

// sitemap всегда рендерится на сервере
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [products, authors] = await Promise.all([
        payloadLocalService.getAllProductSlugs(),
        payloadLocalService.getAllAuthorSlugs(),
    ]);

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${SITE_URL}/`,
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${SITE_URL}/products`,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/authors`,
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/about`,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    const authorRoutes: MetadataRoute.Sitemap = authors.map((a) => ({
        url: `${SITE_URL}/authors/${a.slug}`,
        lastModified: a.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes, ...authorRoutes];
}
