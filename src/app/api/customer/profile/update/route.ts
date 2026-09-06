import { NextResponse } from 'next/server';

import { authServerService } from '@/services/api/server/auth-server.service';
import { customerServerService } from '@/services/api/server/customer-server.service';
import { type ICredentials, UserType } from '@/shared/types/auth.interface';

export async function PATCH(req: Request) {
    // Получаем текущего пользователя
    const user = await authServerService.getCurrentUser();

    if (!user?.id) {
        return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    if (user.role !== UserType.CUSTOMER) {
        return NextResponse.json({ error: 'Доступ только для авторизованных покупателей' }, { status: 401 });
    }

    const body = await req.json();
    try {
        // Обновляем профиль
        const { email, fullName, phone, password } = body;

        // Проверяем, действительно ли email изменился
        if (email && email !== user.email) {
            // Если пароль не передан, отклоняем запрос
            if (!password) {
                return NextResponse.json(
                    { error: 'Для изменения Email необходимо ввести текущий пароль' },
                    { status: 400 },
                );
            }

            // Пытаемся серверно залогиниться от лица этого юзера, если пароль неверный - loginUser вернет null
            const isPasswordValid = await authServerService.loginUser(user.email, password);
            if (!isPasswordValid) {
                return NextResponse.json({ error: 'Неверный текущий пароль' }, { status: 403 });
            }

            // Обновляем email в коллекции пользователей
            const userCredentialsUpdates: ICredentials = { email };
            await authServerService.updateUserCredentials(user.id, userCredentialsUpdates);
        }

        // Получаем профиль покупателя для обновления
        const customer = await customerServerService.getCustomerByUserId(user.id);

        // Обновляем данные покупателя в коллекции customers
        const customerUpdates = { fullName, phone, email };
        await customerServerService.updateCustomerProfile(customer.id, customerUpdates);

        return NextResponse.json({
            success: true,
            message: 'Профиль успешно обновлен',
        });
    } catch (error) {
        let errorMessage = '';
        if (error instanceof Error) {
            errorMessage = error.message.toLowerCase();
        }

        // Ловим попытку смены email на занятый
        if (errorMessage.includes('unique') || errorMessage.includes('email')) {
            console.log('email', errorMessage.includes('email'));
            return NextResponse.json({ error: 'Этот email уже занят другим пользователем' }, { status: 400 });
        }

        // Ловим ошибки валидации
        if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
            return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
        }

        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Ошибка при обновлении профиля' }, { status: 500 });
    }
}
