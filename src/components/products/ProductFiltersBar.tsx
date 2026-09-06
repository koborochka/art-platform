'use client';

import { PRODUCTS_SORT_OPTIONS } from '@/shared/constants/products.constants';
import type { ProductsFilters, ProductsSortOptions } from '@/shared/types/query-params.type';

import CategoryFilter from '../shared/CategoryFilter';
import { FiltersBarShell } from '../shared/FiltersBarShell';
import SortBar from '../shared/SortBar';

import AuthorFilter from './AuthorFilter';
import PriceFilter from './PriceFilter';

interface IProductFiltersBarProps {
    filters: ProductsFilters;
    sort: ProductsSortOptions;
    onFilterChange: (filters: ProductsFilters) => void;
    onSortChange: (value: ProductsSortOptions) => void;
    showAuthorFilter?: boolean;
}

export default function ProductFiltersBar({
    filters,
    sort,
    onFilterChange,
    onSortChange,
    showAuthorFilter = true,
}: IProductFiltersBarProps) {
    return (
        <FiltersBarShell
            search={filters.search}
            onSearchChange={(search) => onFilterChange({ ...filters, search })}
            sortBar={<SortBar sort={sort} onSortChange={onSortChange} options={PRODUCTS_SORT_OPTIONS} />}
        >
            <PriceFilter
                priceFrom={filters.priceFrom}
                priceTo={filters.priceTo}
                onPriceChange={(priceFrom, priceTo) =>
                    onFilterChange({ ...filters, priceFrom: priceFrom, priceTo: priceTo })
                }
            />
            {showAuthorFilter && (
                <AuthorFilter
                    initialAuthor={filters.authors}
                    onAuthorChange={(author) => onFilterChange({ ...filters, authors: author })}
                />
            )}
            <CategoryFilter
                category={filters?.category}
                onCategoryChange={(category) => onFilterChange({ ...filters, category })}
            />
        </FiltersBarShell>
    );
}
