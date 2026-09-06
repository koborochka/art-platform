import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ProductUI from '@/components/product/ProductUI';
import JsonLd from '@/components/seo/JsonLd';
import { payloadLocalService } from '@/services/api/server/payload-local.service';
import { isAuthorData } from '@/shared/guards/author.guard';
import type { ProductQueryParams } from '@/shared/types/query-params.type';
import { getQueryClient } from '@/shared/utils/get-query-client';
import { getProductQueryOptions } from '@/shared/utils/getDataQueryOptions';
import { breadcrumbJsonLd, productJsonLd } from '@/shared/utils/jsonld';
import { buildMetadata, mediaToOgImages } from '@/shared/utils/seo';

export async function generateMetadata({ params }: { params: Promise<ProductQueryParams> }): Promise<Metadata> {
    const { product } = await params;

    const productData = await payloadLocalService.getProductBySlug(product);

    if (!productData) {
        return buildMetadata({ title: 'Товар не найден', noindex: true });
    }

    const author = isAuthorData(productData.author) ? productData.author.name : undefined;
    const cover = productData.gallery?.[0]?.image;

    return buildMetadata({
        title: productData.title,
        description:
            productData.description?.slice(0, 160) ??
            `${productData.title}${author ? ` от ${author}` : ''} — авторская работа в магазине Минто.`,
        path: `/products/${productData.slug}`,
        images: mediaToOgImages(cover, productData.title),
        type: 'article',
    });
}

export default async function ProductPage({ params }: { params: Promise<ProductQueryParams> }) {
    const productQueryParams = await params;
    const product = await payloadLocalService.getProductBySlug(productQueryParams.product);

    if (!product) notFound();

    const queryClient = getQueryClient();
    await queryClient.prefetchQuery(getProductQueryOptions({ slug: productQueryParams.product }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <JsonLd
                data={[
                    productJsonLd(product),
                    breadcrumbJsonLd([
                        { name: 'Главная', path: '/' },
                        { name: 'Каталог', path: '/products' },
                        { name: product.title, path: `/products/${product.slug}` },
                    ]),
                ]}
            />
            <ProductUI initialParams={productQueryParams} />
        </HydrationBoundary>
    );
}
