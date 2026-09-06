import { ORGANIZATION_LOGO, SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL_LINKS } from '@/config/seo.config';
import { isAuthorData } from '@/shared/guards/author.guard';
import { isImageData } from '@/shared/guards/image.guard';
import type { Author, Product } from '@/shared/types/payload-types';

import { absoluteUrl } from './seo';

export function organizationJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl(ORGANIZATION_LOGO),
        description: SITE_DESCRIPTION,
        sameAs: [SOCIAL_LINKS.vk, SOCIAL_LINKS.telegram].filter(Boolean),
    };
}

// Подсказываем роботам поиск по сайту
export function webSiteJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: 'ru-RU',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: it.name,
            item: absoluteUrl(it.path),
        })),
    };
}

export function productJsonLd(product: Product) {
    const images = (product.gallery ?? [])
        .map((g) => (isImageData(g.image) ? g.image.url : null))
        .filter((u): u is string => Boolean(u))
        .map((u) => absoluteUrl(u));

    const authorName = isAuthorData(product.author) ? (product.author.name ?? undefined) : undefined;
    const inStock = (product.quantity ?? 0) > 0 && (product.price ?? 0) > 0;

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        ...(product.description ? { description: product.description } : {}),
        ...(images.length ? { image: images } : {}),
        ...(product.article1C ? { sku: product.article1C } : {}),
        ...(authorName ? { brand: { '@type': 'Brand', name: authorName } } : {}),
        offers: {
            '@type': 'Offer',
            url: absoluteUrl(`/products/${product.slug}`),
            priceCurrency: 'RUB',
            price: product.price ?? 0,
            availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
    };
}

export function authorJsonLd(author: Author) {
    const avatar = isImageData(author.avatar) && author.avatar.url ? absoluteUrl(author.avatar.url) : undefined;

    return {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
            '@type': 'Person',
            name: author.name ?? author.fullName ?? 'Автор',
            ...(author.bio ? { description: author.bio } : {}),
            ...(avatar ? { image: avatar } : {}),
            url: absoluteUrl(`/authors/${author.slug}`),
            ...(author.externalLink ? { sameAs: [author.externalLink] } : {}),
        },
    };
}
