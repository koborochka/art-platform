import { NextRequest, NextResponse } from 'next/server';

import { cdekTokenService } from '@/services/api/server/cdek.service';

const CDEK_API_URL = process.env.CDEK_API_URL || 'https://api.cdek.ru/v2';

type CdekAction = 'offices' | 'pvz' | 'calculate' | 'cities' | 'city';

type CdekPayload = Record<string, unknown>;

function createSearchParams(payload: CdekPayload): string {
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && typeof value !== 'object') {
            params.append(key, String(value));
        }
    });
    return params.toString();
}

/**
 * Обработчик запросов виджета, имитирующий service.php
 * @see https://github.com/cdek-it/widget/blob/main/dist/service.php?plain=1
 */
async function handleCdekRequest(req: NextRequest) {
    try {
        // Аналог $_REQUEST + body
        const url = new URL(req.url);
        const queryParams: CdekPayload = Object.fromEntries(url.searchParams.entries());

        let bodyParams: CdekPayload = {};

        if (req.method === 'POST') {
            try {
                const json = await req.json();
                if (typeof json === 'object' && json !== null) {
                    bodyParams = json as CdekPayload;
                }
            } catch {
                /* empty */
            }
        }

        const requestData: CdekPayload = { ...queryParams, ...bodyParams };

        const { action: rawAction, ...payload } = requestData;

        // Валидация action
        if (!rawAction || typeof rawAction !== 'string') {
            return NextResponse.json({ message: 'Action is required and must be a string' }, { status: 400 });
        }

        const action = rawAction as CdekAction;

        // Авторизация
        const token = await cdekTokenService.getAccessToken();

        // Логика маршрутизации
        let cdekEndpoint = '';
        let method = 'GET';
        let body: string | undefined;
        let searchParams = '';

        switch (action) {
            case 'offices':
            case 'pvz':
                // API v2 method: GET /deliverypoints
                cdekEndpoint = '/deliverypoints';
                method = 'GET';
                searchParams = createSearchParams(payload);
                break;

            case 'calculate':
                // API v2 method: POST /calculator/tarifflist
                cdekEndpoint = '/calculator/tarifflist';
                method = 'POST';
                body = JSON.stringify(payload);
                break;

            case 'cities':
            case 'city':
                // API v2 method: GET /location/cities
                cdekEndpoint = '/location/cities';
                method = 'GET';
                searchParams = createSearchParams(payload);
                break;

            default:
                return NextResponse.json({ message: `Unknown action: ${action}` }, { status: 400 });
        }

        // Выполнение запроса к СДЭК
        const fetchUrl = `${CDEK_API_URL}${cdekEndpoint}${searchParams ? `?${searchParams}` : ''}`;

        const response = await fetch(fetchUrl, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-App-Name': 'widget_pvz',
            },
            body,
            cache: 'no-store',
        });

        // Формирование ответа
        const data: unknown = await response.json();

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'X-Service-Version': '3.11.1',
            },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('CDEK Proxy Error:', errorMessage);

        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return handleCdekRequest(req);
}

export async function POST(req: NextRequest) {
    return handleCdekRequest(req);
}
