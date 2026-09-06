import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import AuthorUI from '@/components/author/AuthorUI';
import JsonLd from '@/components/seo/JsonLd';
import { payloadLocalService } from '@/services/api/server/payload-local.service';
import type { AuthorQueryParams, ProductsQueryParams } from '@/shared/types/query-params.type';
import { getQueryClient } from '@/shared/utils/get-query-client';
import { getAuthorQueryOptions } from '@/shared/utils/getDataQueryOptions';
import { authorJsonLd, breadcrumbJsonLd } from '@/shared/utils/jsonld';
import { buildMetadata, mediaToOgImages } from '@/shared/utils/seo';

export async function generateMetadata({ params }: { params: Promise<AuthorQueryParams> }): Promise<Metadata> {
    const { author } = await params;

    const data = await payloadLocalService.getAuthorBySlug(author);

    if (!data) {
        return buildMetadata({ title: 'Автор не найден', noindex: true });
    }

    return buildMetadata({
        title: data.name ?? data.fullName ?? 'Автор',
        description:
            data.bio?.slice(0, 160) ??
            `${data.name ?? 'Автор'} — мастер магазина Минто. Уникальные изделия ручной работы.`,
        path: `/authors/${data.slug}`,
        images: mediaToOgImages(data.avatar ?? data.cover, data.name ?? 'Автор'),
        type: 'profile',
    });
}

export default async function AuthorPage({
    params,
    searchParams,
}: {
    params: Promise<AuthorQueryParams>;
    searchParams: Promise<ProductsQueryParams>;
}) {
    const authorParams = await params;
    const authorQueryParams = await searchParams;

    const author = await payloadLocalService.getAuthorBySlug(authorParams.author);
    if (!author) notFound();

    const queryClient = getQueryClient();
    await queryClient.prefetchQuery(getAuthorQueryOptions({ slug: authorParams.author }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <JsonLd
                data={[
                    authorJsonLd(author),
                    breadcrumbJsonLd([
                        { name: 'Главная', path: '/' },
                        { name: 'Авторы', path: '/authors' },
                        { name: author.name ?? 'Автор', path: `/authors/${author.slug}` },
                    ]),
                ]}
            />
            <AuthorUI initialParams={authorParams} searchParams={authorQueryParams} />
        </HydrationBoundary>
    );
}
