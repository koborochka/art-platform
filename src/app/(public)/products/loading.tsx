import { ProductsLoader } from '@/components/shared/Skeleton';

export default function Loading() {
    return <ProductsLoader showHeader={true} productsCount={12} columnsCount={4} />;
}
