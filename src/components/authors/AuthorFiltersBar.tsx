'use client';

import { AUTHORS_SORT_OPTIONS } from '@/shared/constants/authors.constants';
import type { AuthorsFilters, AuthorsSortOptions } from '@/shared/types/query-params.type';

import CategoryFilter from '../shared/CategoryFilter';
import { FiltersBarShell } from '../shared/FiltersBarShell';
import SortBar from '../shared/SortBar';

interface IAuthorFiltersBarProps {
    filters: AuthorsFilters;
    sort: AuthorsSortOptions;
    onFilterChange: (filters: AuthorsFilters) => void;
    onSortChange: (value: AuthorsSortOptions) => void;
}

export default function AuthorsFiltersBar({ filters, sort, onFilterChange, onSortChange }: IAuthorFiltersBarProps) {
    return (
        <FiltersBarShell
            search={filters.search}
            onSearchChange={(search) => onFilterChange({ ...filters, search })}
            sortBar={<SortBar sort={sort} onSortChange={onSortChange} options={AUTHORS_SORT_OPTIONS} />}
        >
            {/* Категории */}
            <CategoryFilter
                category={filters?.category}
                onCategoryChange={(category) => onFilterChange({ ...filters, category })}
            />
        </FiltersBarShell>
    );
}
