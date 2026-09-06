import { APIError } from 'payload';

const CDEK_API_URL = process.env.CDEK_API_URL || 'https://api.cdek.ru/v2';
const CDEK_ACCOUNT = process.env.CDEK_ACCOUNT;
const CDEK_PASSWORD = process.env.CDEK_PASSWORD;

let cachedToken: string | null = null;
let tokenExpiration = 0;

export const cdekTokenService = {
    // Получает актуальный Access Token. Автоматически обновляет его, если срок действия истекает
    async getAccessToken(): Promise<string> {
        const now = Date.now();

        if (cachedToken && now < tokenExpiration - 5 * 60 * 1000) {
            return cachedToken;
        }

        if (!CDEK_ACCOUNT || !CDEK_PASSWORD) {
            throw new APIError('CDEK credentials are missing', 500);
        }

        try {
            const params = new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: CDEK_ACCOUNT,
                client_secret: CDEK_PASSWORD,
            });

            const response = await fetch(`${CDEK_API_URL}/oauth/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params,
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`Auth failed: ${response.status}`);
            }

            const data = await response.json();

            cachedToken = data.access_token;
            tokenExpiration = now + data.expires_in * 1000;

            return cachedToken!;
        } catch (error) {
            console.error('CDEK Auth Error:', error);
            throw new APIError('Failed to retrieve CDEK token', 500);
        }
    },
};
