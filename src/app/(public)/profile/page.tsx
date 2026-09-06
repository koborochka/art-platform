import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PAGES } from '@/config/public-pages.config';
import { authServerService } from '@/services/api/server/auth-server.service';
import { authorServerService } from '@/services/api/server/author-server.service';
import { customerServerService } from '@/services/api/server/customer-server.service';
import { UserType } from '@/shared/types/auth.interface';
import { buildMetadata } from '@/shared/utils/seo';

import AuthorProfileUI from './AuthorProfileUI';
import CustomerProfileUI from './CustomerProfileUI';

export const metadata: Metadata = buildMetadata({ title: 'Личный кабинет', noindex: true });

export default async function ProfilePage() {
    // Получаем текущего пользователя через серверный метод
    const user = await authServerService.getCurrentUser();

    // Если пользователь не авторизован - редирект на логин
    if (!user?.id) {
        redirect(PAGES.LOGIN);
    }

    // Разделяем логику по типу пользователя
    // Для авторов
    if (user.role === UserType.AUTHOR) {
        try {
            const author = await authorServerService.getAuthorByUserId(user.id);
            if (!author) {
                console.error('Author profile not found');
                redirect(PAGES.LOGIN);
            }

            const products = await authorServerService.getAuthorProducts(author.id);
            const latestInvoice = await authorServerService.getAuthorLatestInvoice(author.id);

            return <AuthorProfileUI authorData={author} products={products || []} latestInvoice={latestInvoice} />;
        } catch (error) {
            console.error('Error loading author data:', error);
        }
    }

    // Для покупателей
    if (user.role === UserType.CUSTOMER) {
        try {
            const customer = await customerServerService.getCustomerByUserId(user.id);
            if (!customer) {
                console.error('Customer profile not found');
                redirect(PAGES.LOGIN);
            }

            return <CustomerProfileUI customerData={customer} />;
        } catch (error) {
            console.error('Error loading customer data:', error);
        }
    }

    // Если роль неизвестна или это админ
    redirect(PAGES.LOGIN);
}
