'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import AuthorCard from '@/components/authors/AuthorCard';
import { Button } from '@/components/ui/button';
import { toAuthorsQueryParams } from '@/services/api/utils';
import { useFetchAuthors } from '@/shared/hooks/useFetchData';
import { useUpdateQueryParams } from '@/shared/hooks/useUpdateQueryParams';
import type { AuthorsQueryParams } from '@/shared/types/query-params.type';
import { getPageNumbers } from '@/shared/utils/getPageNumbers';

import AuthorsFiltersBar from './AuthorFiltersBar';

export default function AuthorsUI({ initialParams }: { initialParams: AuthorsQueryParams }) {
    const page = Number(initialParams.page) || 1;
    const params = toAuthorsQueryParams(initialParams);

    const { data, isError, error, isPlaceholderData, isFetching } = useFetchAuthors(params);
    const authors = data?.docs;

    const updateQueryParams = useUpdateQueryParams<AuthorsQueryParams>();

    if (isError) {
        return <div>Error: {error.message}</div>;
    }
    if (isFetching) {
        return <div>Loading...</div>;
    }
    if (!authors) {
        return <div>Products not found</div>;
    }

    const { hasNextPage = false, hasPrevPage = false, prevPage, nextPage, totalPages } = data;

    return (
        <>
            <div className="wrap">
                <h1 className="text-3xl font-semibold mb-8 px-3 lg:px-0">Авторы</h1>
                <AuthorsFiltersBar
                    filters={{
                        category: initialParams.category,
                        search: initialParams.search,
                    }}
                    sort={initialParams.sort}
                    onFilterChange={(value) =>
                        updateQueryParams({
                            category: value.category,
                            search: value.search,
                        })
                    }
                    onSortChange={(value) => updateQueryParams({ sort: value })}
                />

                <div
                    className={`grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-6 mb-8 px-3 lg:px-0${isPlaceholderData && 'opacity-50'}`}
                >
                    {authors.map((author) => (
                        <AuthorCard key={author.id} {...author} />
                    ))}
                </div>

                {authors.length === 0 ? (
                    <div className="text-xl md:text-2xl font-semibold text-center mt-8">Авторов не найдено.</div>
                ) : (
                    <div className="flex gap-2 justify-center items-center mt-8">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQueryParams({ page: prevPage || page - 1 }, { resetPage: false })}
                            disabled={!hasPrevPage}
                            className="h-10 w-10"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {getPageNumbers(totalPages, page).map((pageNum, idx) =>
                            typeof pageNum === 'number' ? (
                                <Button
                                    key={idx}
                                    variant={pageNum === page ? 'pagination' : 'ghost'}
                                    onClick={() => updateQueryParams({ page: pageNum }, { resetPage: false })}
                                    className="h-10 w-10"
                                >
                                    {pageNum}
                                </Button>
                            ) : (
                                <span key={idx} className="px-2 text-muted-foreground">
                                    {pageNum}
                                </span>
                            ),
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQueryParams({ page: nextPage || page + 1 }, { resetPage: false })}
                            disabled={!hasNextPage}
                            className="h-10 w-10"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}
