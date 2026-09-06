import { NextResponse } from 'next/server';

import { authServerService } from '@/services/api/server/auth-server.service';
import { customerServerService } from '@/services/api/server/customer-server.service';
import { orderServerService } from '@/services/api/server/order-server.service';
import { UserType } from '@/shared/types/auth.interface';

// Динамический роут, получаем ID заказа из параметров
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Получаем текущего пользователя
        const user = await authServerService.getCurrentUser();

        if (!user?.id) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        if (user.role !== UserType.CUSTOMER) {
            return NextResponse.json({ error: 'Доступ только для авторизованных покупателей' }, { status: 403 });
        }

        const { id } = await params;
        const orderId = Number(id);
        const order = await orderServerService.getOrderById(orderId);
        if (!order) return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });

        // Проверяем принадлежность заказа текущему покупателю
        const currentCustomer = await customerServerService.getCustomerByUserId(user.id);

        // order.customer может быть объектом (если depth > 0) или ID (если depth = 0)
        const orderCustomerId = typeof order.customer === 'object' ? order.customer.id : order.customer;

        if (!currentCustomer || orderCustomerId !== currentCustomer.id) {
            return NextResponse.json({ error: 'Этот заказ вам не принадлежит' }, { status: 403 });
        }

        // Отменяем заказ (ЮКасса + БД)
        // Флаг true означает, что действие инициировал пользователь (для доп проверок)
        await orderServerService.cancelOrder(orderId, true);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Order cancellation error:', error);
        return NextResponse.json({ success: false, message: 'Ошибка при отмене заказа' }, { status: 500 });
    }
}
