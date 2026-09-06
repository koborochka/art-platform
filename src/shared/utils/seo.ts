import type { Metadata } from 'next';

import { OG_DEFAULT_IMAGE, SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_TITLE, SITE_URL } from '@/config/seo.config';
import type { Media } from '@/shared/types/payload-types';

type BuildMetadataInput = {
    title?: string; // только уникальная часть
    titleAbsolute?: string; // без шаблона
    description?: string;
    path?: string; // канонический путь
    images?: NonNullable<Metadata['openGraph']>['images'];
    noindex?: boolean;
    type?: 'website' | 'article' | 'profile';
};

/** Относительный путь в абсолютный URL */
export function absoluteUrl(path = '/'): string {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    return `${SITE_URL}/${path.replace(/^\/+/, '')}`;
}

/** Абсолютный URL картинки из Payload Media (размер medium) */
export function mediaToOgImages(
    media?: Media | number | null,
    alt = SITE_TITLE,
): NonNullable<Metadata['openGraph']>['images'] | undefined {
    if (!media || typeof media === 'number') return undefined;

    const variant = media.sizes?.og ?? media.sizes?.medium ?? null;
    const src = variant?.url ?? media.url;
    if (!src) return undefined;

    const encodedSrc = src.replace(/\/([^/]+)$/, (_, filename) => `/${encodeURIComponent(filename)}`);
    return [
        {
            url: absoluteUrl(encodedSrc),
            width: variant?.width ?? media.width ?? 1200,
            height: variant?.height ?? media.height ?? 1200,
            alt,
        },
    ];
}

/** Фабрика метаданных страницы */
export function buildMetadata({
    title,
    titleAbsolute,
    description = SITE_DESCRIPTION,
    path = '/',
    images,
    noindex = false,
    type = 'website',
}: BuildMetadataInput = {}): Metadata {
    const cleanDescription = description.replace(/\s+/g, ' ').trim();
    const canonical = absoluteUrl(path);
    const ogImages = images ?? [OG_DEFAULT_IMAGE];

    const metadata: Metadata = {
        description: cleanDescription,
        alternates: { canonical },
        robots: {
            index: !noindex,
            follow: true,
        },
        openGraph: {
            type,
            siteName: SITE_NAME,
            locale: SITE_LOCALE,
            url: canonical,
            title: titleAbsolute ?? (title ? `${title} — ${SITE_NAME}` : SITE_TITLE),
            description: cleanDescription,
            images: ogImages,
        },
    };

    if (titleAbsolute) {
        metadata.title = { absolute: titleAbsolute };
    } else if (title) {
        metadata.title = title;
    }

    return metadata;
}
