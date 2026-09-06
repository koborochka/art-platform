import { NextResponse } from 'next/server';

import { orderServerService } from '@/services/api/server/order-server.service';
import type { IYookassaWebhookEvent } from '@/shared/types/yookassa.interface';

// URL для уведомлений
// https://polki-minto.ru/api/webhooks/yookassa

export async function POST(req: Request) {
    try {
        // Проверка прав на уровне nginx по спискам разрешенных ip ЮКассы

        const body = (await req.json()) as IYookassaWebhookEvent;
        const { object } = body;

        const orderId = object.metadata?.order_id;
        if (!orderId) return NextResponse.json({ status: 'ignored' });

        // Обновляем статус платежа в БД
        await orderServerService.processWebhookUpdate(orderId, object.status);

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Yookassa Webhook Error:', error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}
