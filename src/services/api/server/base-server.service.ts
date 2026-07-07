import { headers } from 'next/headers';

// Базовый класс для серверных сервисов для переиспользования заголовков
export abstract class BaseServerService {
    // Метод асинхронный, так как headers() в Next.js асинхронный
    protected async getAuthHeaders() {
        const headersList = await headers();
        const cookie = headersList.get('cookie') || '';

        // Извлекаем Origin или Referer, чтобы Payload мог проверить CSRF
        const origin = headersList.get('origin') || '';
        const referer = headersList.get('referer') || '';

        //console.log('headers', origin, referer);

        const authHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            // Передаем куки текущего запроса.
            // Payload автоматически распознает 'payload-token' внутри Cookie и определит пользователя
            Cookie: cookie,
        };

        // Пробрасываем Origin, если он есть.
        // Это поможет Payload CSRF-защите понять, что запрос легитимен
        if (origin) {
            authHeaders['Origin'] = origin;
        } else if (referer) {
            authHeaders['Referer'] = referer;
        }

        return authHeaders;
    }
}
