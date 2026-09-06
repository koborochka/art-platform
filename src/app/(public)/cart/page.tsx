import type { Metadata } from 'next';

import CartUI from '@/components/cart/CartUI';
import { authServerService } from '@/services/api/server/auth-server.service';
import { buildMetadata } from '@/shared/utils/seo';

export const metadata: Metadata = buildMetadata({ title: 'Корзина', noindex: true });

export default async function CartPage() {
    // Получаем текущего пользователя через серверный метод
    const user = await authServerService.getCurrentUser();
    const isUserAuthorized = !!user;

    return <CartUI isUserAuthorized={isUserAuthorized} />;
}
