import { NextResponse } from 'next/server';

import { authServerService } from '@/services/api/server/auth-server.service';
import { authorServerService } from '@/services/api/server/author-server.service';
import { UserType } from '@/shared/types/auth.interface';

export async function PATCH(req: Request) {
    // Получаем текущего пользователя
    const user = await authServerService.getCurrentUser();

    if (!user?.id) {
        return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    if (user.role !== UserType.AUTHOR) {
        return NextResponse.json({ error: 'Доступ только для авторов' }, { status: 401 });
    }

    const body = await req.json();
    try {
        // Проверка, что обновляем своего автора
        const author = await authorServerService.getAuthorByUserId(user.id);
        if (!author) return NextResponse.json({ error: 'Автор не найден' }, { status: 404 });

        // Обновляем профиль
        await authorServerService.updateAuthorProfile(author.id, body);

        return NextResponse.json({
            success: true,
            message: 'Профиль успешно обновлен',
        });
    } catch (error) {
        let errorMessage = '';
        if (error instanceof Error) errorMessage = error.message;

        if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
            return NextResponse.json({ success: false, message: errorMessage }, { status: 400 });
        }

        console.error('Profile update error:', error);
        return NextResponse.json({ success: false, message: 'Ошибка при обновлении профиля' }, { status: 500 });
    }
}
