import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PAGES } from '@/config/public-pages.config';
import { authServerService } from '@/services/api/server/auth-server.service';
import { customerServerService } from '@/services/api/server/customer-server.service';
import { UserType } from '@/shared/types/auth.interface';
import { buildMetadata } from '@/shared/utils/seo';

import OrderUI from './OrderUI';

export const metadata: Metadata = buildMetadata({ title: 'Оформление заказа', noindex: true });

export default async function OrderPage() {
    const user = await authServerService.getCurrentUser();

    // Защита роута - страница доступна только авторизованным пользователям
    // TODO: вынести guard для защит роутов
    if (!user?.id || user.role !== UserType.CUSTOMER) {
        redirect(PAGES.LOGIN);
    }

    // Получаем данные покупателя
    const customer = await customerServerService.getCustomerByUserId(user.id);

    return <OrderUI customer={customer} />;
}
