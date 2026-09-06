'use client';

import React from 'react';

import ProductsList from '@/components/products/ProductsList';
import { isAuthorData } from '@/shared/guards/author.guard';
import type { Product } from '@/shared/types/payload-types';
import type { ProductsQueryParams } from '@/shared/types/query-params.type';

type Props = {
    product: Product;
    updateQueryParams: (params: Partial<ProductsQueryParams>, options?: { resetPage?: boolean }) => void;
};

export default function AuthorProductsSection({ product, updateQueryParams }: Props) {
    if (!isAuthorData(product.author)) return null;

    const authorId = product.author.id;

    const initialParams: ProductsQueryParams = {
        page: 1,
        authorId: authorId,
        excludeId: product.id,
    };

    return (
        <div className="">
            <h2 className="lg:text-[28px] text-xl font-semibold mb-8">Другие товары автора</h2>

            <ProductsList initialParams={initialParams} updateQueryParams={updateQueryParams} />
        </div>
    );
}
