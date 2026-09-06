import { ProductsLoader } from '@/components/shared/Skeleton';

export default function Loading() {
    return <ProductsLoader showHeader={true} productsCount={24} columnsCount={6} />;
}
