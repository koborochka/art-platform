import { NextResponse } from 'next/server';

import { customerServerService } from '@/services/api/server/customer-server.service';

// Нам нужен этот эндпоинт, потому что в Payload имеет доступ к пользовательской сессии только на сервере
// => в эндпоинте Payload работает с правильными правами доступа. Аналогично с profile/update
export async function POST(req: Request) {
    const body = await req.json();
    const { email, password, fullName, phone } = body;

    if (!email || !password) {
        return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 });
    }

    try {
        // Создаём нового покупателя. Если email занят, Payload сам выбросит ошибку
        await customerServerService.createCustomer({
            email,
            password,
            fullName,
            phone,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        let errorMessage = '';
        if (error instanceof Error) {
            errorMessage = error.message.toLowerCase();
        }

        // Ловим дубликаты (unique) и ошибки валидации (invalid format, required, etc)
        if (
            errorMessage.includes('unique') ||
            errorMessage.includes('email') ||
            errorMessage.includes('invalid') ||
            errorMessage.includes('already exists')
        ) {
            // Если ошибка про email, возвращаем понятный текст
            if (errorMessage.includes('email') && errorMessage.includes('unique')) {
                return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 400 });
            }
            if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
                return NextResponse.json({ error: 'Некорректный формат email' }, { status: 400 });
            }

            // Для остальных ошибок валидации возвращаем текст как есть
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        console.error('Unexpected Registration error:', error);
        return NextResponse.json({ error: 'Ошибка при создании пользователя' }, { status: 500 });
    }
}
