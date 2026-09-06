import { NextResponse } from 'next/server';

import { authServerService } from '@/services/api/server/auth-server.service';
import { authorServerService } from '@/services/api/server/author-server.service';
import { UserType } from '@/shared/types/auth.interface';
import type { IProductCreateInput } from '@/shared/types/product.type';

export async function POST(req: Request) {
    // Получаем текущего пользователя
    const user = await authServerService.getCurrentUser();

    if (!user?.id) {
        return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    if (user.role !== UserType.AUTHOR) {
        return NextResponse.json({ error: 'Доступ только для авторов' }, { status: 403 });
    }

    const body = await req.json();

    try {
        // Ищем автора по Id пользователя
        const author = await authorServerService.getAuthorByUserId(user.id);

        if (!author) {
            return NextResponse.json({ error: 'Профиль автора не найден' }, { status: 404 });
        }

        const productData: IProductCreateInput = {
            ...body,
            author: author.id,
        };

        const newProduct = await authorServerService.createAuthorProduct(productData);
        return NextResponse.json({ product: newProduct });
    } catch (error) {
        let errorMessage = '';
        if (error instanceof Error) errorMessage = error.message;

        // Проверка на уникальность на всякий случай (если вдруг slug совпал, хотя мы его генерируем)
        if (errorMessage.includes('unique')) {
            return NextResponse.json(
                { error: 'Товар с таким названием или slug уже существует, попробуйте снова' },
                { status: 400 },
            );
        }

        // Ошибки валидации (например, пропущена цена)
        if (
            errorMessage.includes('validation') ||
            errorMessage.includes('invalid') ||
            errorMessage.includes('required')
        ) {
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        console.error('Create product error:', error);
        return NextResponse.json({ error: 'Ошибка создания товара' }, { status: 500 });
    }
}
