import { NextResponse } from 'next/server';

import { authServerService } from '@/services/api/server/auth-server.service';
import { customerServerService } from '@/services/api/server/customer-server.service';
import { orderServerService } from '@/services/api/server/order-server.service';
import { UserType } from '@/shared/types/auth.interface';
import type { IOrderCreateRequest } from '@/shared/types/order.interface';

export async function POST(req: Request) {
    try {
        // Получаем текущего пользователя
        const user = await authServerService.getCurrentUser();

        if (!user?.id) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        if (user.role !== UserType.CUSTOMER) {
            return NextResponse.json(
                { error: 'Заказы могут оформлять только авторизованные покупатели' },
                { status: 403 },
            );
        }

        // Пересчитываем данные заказа для безопасности
        const body = (await req.json()) as IOrderCreateRequest;

        // Находим профиль покупателя (Customer) по ID пользователя (User)
        const customer = await customerServerService.getCustomerByUserId(user.id);

        // Создаем заказ и платеж
        const result = await orderServerService.createOrderWithPayment(customer.id, body, user.email);

        return NextResponse.json({
            success: true,
            orderId: result.order.id,
            paymentUrl: result.paymentUrl,
        });
    } catch (error) {
        let message = 'Ошибка при создании заказа';
        if (error instanceof Error) message = error.message;

        // Специфичные ошибки в prepareOrder - это ошибки клиента (данные устарели) - возвращаем 400
        if (
            message.includes('не найден') ||
            message.includes('снят с продажи') ||
            message.includes('quantity') ||
            message.includes('цена')
        ) {
            console.warn(`Order creation failed (bad request): ${message}`);
            return NextResponse.json({ success: false, message }, { status: 400 });
        }

        console.error('Order creation error:', error);
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}
