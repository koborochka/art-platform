'use client';

import { useCallback, useState } from 'react';

import { debounce } from 'lodash';
import type { ReactNode } from 'react';

import SearchBar from '../shared/SearchBar';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

interface FiltersBarShellProps {
    search?: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    children: ReactNode;
    sortBar?: ReactNode;
}

export function FiltersBarShell({
    search,
    onSearchChange,
    searchPlaceholder = 'Поиск',
    children,
    sortBar,
}: FiltersBarShellProps) {
    const [searchValue, setSearchValue] = useState(search || '');

    const debouncedSearch = useCallback(
        debounce((value: string) => onSearchChange(value), 500),
        [onSearchChange],
    );

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        debouncedSearch(value);
    };

    return (
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start">
            <div className="order-1 lg:order-2 w-full px-3 lg:px-0">
                <SearchBar value={searchValue} onChange={handleSearchChange} placeholder={searchPlaceholder} />
            </div>

            {/* Десктоп */}
            <div className="hidden lg:contents">
                <div className="lg:order-3">{sortBar}</div>
                <div className="flex gap-3 lg:order-1">{children}</div>
            </div>

            {/* Мобилки */}
            <ScrollArea className="order-3 w-full lg:hidden whitespace-nowrap">
                <div className="flex items-center gap-3 w-max p-3 pb-4">
                    <div className="order-3">{sortBar}</div>
                    <div className="flex gap-3 order-1">{children}</div>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
