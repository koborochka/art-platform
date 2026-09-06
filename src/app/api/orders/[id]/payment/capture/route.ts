import { NextResponse } from 'next/server';

import { authServerService } from '@/services/api/server/auth-server.service';
import { orderServerService } from '@/services/api/server/order-server.service';
import { UserType } from '@/shared/types/auth.interface';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Получаем текущего пользователя
        const user = await authServerService.getCurrentUser();

        if (!user?.id) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        if (user.role !== UserType.ADMIN) {
            return NextResponse.json({ error: 'Доступ только для администраторов' }, { status: 403 });
        }

        const { id } = await params;
        const orderId = Number(id);

        const result = await orderServerService.captureOrderPayment(orderId);

        return NextResponse.json({ success: true, status: result.status });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Ошибка подтверждения платежа' },
            { status: 500 },
        );
    }
}
