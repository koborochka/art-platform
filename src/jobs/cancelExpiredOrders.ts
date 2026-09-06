import type { TaskConfig } from 'payload';

import { orderServerService, STOCK_ADJUSTMENT } from '@/services/api/server/order-server.service'; // Импорт сервиса
import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { ORDER_STATUS } from '@/shared/constants/order.constants';
import { PAYMENT_STATUS } from '@/shared/constants/payment.constants';

export const cancelExpiredOrders: TaskConfig<'cancelExpiredOrders'> = {
    slug: 'cancelExpiredOrders',
    label: 'Автоматическая отмена неоплаченных заказов',
    schedule: [
        {
            cron: '* * * * *', // Каждую минуту
            queue: 'cleanup',
        },
    ],

    handler: async ({ req }) => {
        const { payload } = req;
        // 15 минут с запасом, чтобы ЮКасса успела отменить платёжную ссылку (9:55)
        const expiredTime = new Date(Date.now() - 15 * 60 * 1000);

        const expiredOrders = await payload.find({
            collection: COLLECTION_SLUGS.ORDERS,
            where: {
                and: [
                    { status: { equals: ORDER_STATUS.PREPARED } },
                    { paymentStatus: { equals: PAYMENT_STATUS.PENDING } },
                    { createdAt: { less_than: expiredTime.toISOString() } },
                ],
            },
            limit: 50,
            overrideAccess: true,
        });

        let cancelledCount = 0;

        for (const order of expiredOrders.docs) {
            try {
                // Обновляем локально статусы
                await payload.update({
                    collection: COLLECTION_SLUGS.ORDERS,
                    id: order.id,
                    data: {
                        status: ORDER_STATUS.CANCELLED,
                        paymentStatus: PAYMENT_STATUS.CANCELED,
                    },
                    overrideAccess: true,
                });

                // Возвращаем товар на полки
                await orderServerService.adjustStock(order.items, STOCK_ADJUSTMENT.INCREMENT);

                cancelledCount++;
            } catch (err) {
                payload.logger.error(`Ошибка при авто-отмене заказа ${order.id}: ${err}`);
            }
        }

        return { output: { cancelledCount } };
    },
};
