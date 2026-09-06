import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/shared/utils/tailwind';

interface ProductsLoaderProps {
    showHeader?: boolean;
    productsCount?: number;
    columnsCount?: number;
}

export function HomeLoader() {
    return (
        <div className="wrap">
            <Skeleton className="h-screen w-full mb-4" />
            <ProductsLoader showHeader={false} />
        </div>
    );
}

export function LoginLoader() {
    return (
        <Skeleton className="max-w-lg w-full mx-auto h-128" />
    );
}

export function ProductsLoader({ showHeader = true, productsCount = 12, columnsCount = 4 }: ProductsLoaderProps) {
    return (
        <div className="wrap">
            {showHeader && <ProductsHeaderLoader />}
            <ProductsGridLoader productsCount={productsCount} columnsCount={columnsCount} />
        </div>
    );
}

// Лоадер для хедера с фильтрами
function ProductsHeaderLoader() {
    return (
        <div className="mb-8">
            <Skeleton className="h-8 w-32 mb-8" />

            <div className="flex gap-3 flex-row">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />

                <Skeleton className="h-10 w-full" />

                <Skeleton className="h-10 w-36" />
            </div>
        </div>
    );
}

export function ProductsGridLoader({
    productsCount = 16,
    columnsCount,
}: {
    productsCount: number;
    columnsCount: number;
}) {
    const gridColsClass =
        {
            2: 'grid-cols-1 sm:grid-cols-2',
            3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
            6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
        }[columnsCount] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

    return (
        <div className="flex flex-col">
            <div className={cn('grid gap-6 auto-rows-fr', gridColsClass)}>
                {Array.from({ length: productsCount }).map((_, index) => (
                    <ProductCardLoader key={index} />
                ))}
            </div>

            <PaginationLoader />
        </div>
    );
}

// Лоадер для карточки товара
function ProductCardLoader() {
    return (
        <div className="col-span-1">
            <div className="p-0 h-fit overflow-hidden rounded-lg bg-card">
                <div className="relative w-full aspect-square overflow-hidden">
                    <Skeleton className="w-full h-full" />
                </div>
            </div>
        </div>
    );
}

// Лоадер для пагинации
function PaginationLoader() {
    return (
        <div className="flex gap-2 justify-center items-center mt-8">
            <Skeleton className="h-10 w-10 rounded" />

            {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} className="h-10 w-10 rounded" />
            ))}

            <Skeleton className="h-10 w-10 rounded" />
        </div>
    );
}

// Альтернативный вариант - компактный лоадер (без фильтров)
export function CompactProductsLoader({ productsCount = 8, columnsCount = 4 }: ProductsLoaderProps) {
    const gridColsClass =
        {
            2: 'grid-cols-1 sm:grid-cols-2',
            3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
        }[columnsCount] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

    return (
        <div className="wrap flex flex-col">
            <div className={cn('grid gap-6 auto-rows-fr', gridColsClass)}>
                {Array.from({ length: productsCount }).map((_, index) => (
                    <ProductCardLoader key={index} />
                ))}
            </div>
            <PaginationLoader />
        </div>
    );
}

// Skeleton для отдельных элементов (для более гибкого использования)
export const ProductsSkeleton = {
    Card: ProductCardLoader,

    FiltersBar: () => (
        <div className="flex flex-wrap gap-3 items-center">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
        </div>
    ),

    SearchAndSort: () => (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Skeleton className="h-10 w-full sm:w-80" />
            <Skeleton className="h-10 w-40" />
        </div>
    ),
};

interface CartLoaderProps {
    itemsCount?: number;
    orderItemsCount?: number;
}

export function CartLoader({ itemsCount = 4 }: CartLoaderProps) {
    return (
        <div className="wrap mt-6 md:mt-8 mb-10 grid gap-6 grid-cols-1 md:grid-cols-12 px-3 lg:px-0">
            <div className="flex flex-col md:col-span-8">
                <Skeleton className="h-10 w-48 mb-6" />

                <div className="flex flex-col md:flex-row md:items-center md:justify-between items-start gap-3 md:gap-0 mb-6">
                    <Skeleton className="h-9 w-44" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-9 w-28" />
                        <Skeleton className="h-9 w-44" />
                    </div>
                </div>

                <div className="space-y-4">
                    {Array.from({ length: itemsCount }).map((_, index) => (
                        <Skeleton key={index} className="h-30 w-full" />
                    ))}
                </div>

            </div>

            <div className="md:col-span-4 flex flex-col gap-4">
                <Skeleton className="h-30 w-full rounded-md" />
                <Skeleton className="h-50 w-full rounded-md" />
            </div>
        </div>
    );
}

