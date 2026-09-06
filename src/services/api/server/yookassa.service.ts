import { v4 as uuidv4 } from 'uuid';

import type {
    IYookassaCreatePaymentRequest,
    IYookassaPaymentCreateInput,
    IYookassaPaymentResponse,
    IYookassaReceipt,
} from '@/shared/types/yookassa.interface';

import { apiUrl } from '../api-url-builder';

const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

class YookassaService {
    private getAuthHeader(): string {
        const authString = `${SHOP_ID}:${SECRET_KEY}`;
        return `Basic ${Buffer.from(authString).toString('base64')}`;
    }

    async createPayment(paymentCreateData: IYookassaPaymentCreateInput): Promise<IYookassaPaymentResponse> {
        console.log('createPayment', paymentCreateData);

        const { amount, description, returnUrl, metadata, customerEmail, items } = paymentCreateData;
        const stringAmount = amount.toFixed(2);

        // Формируем объект чека, если есть обязательные данные
        let receipt: IYookassaReceipt | undefined;
        if (customerEmail && items) {
            receipt = {
                customer: { email: customerEmail },
                items: items.map((item) => ({
                    description: item.title.substring(0, 128), // Ограничение длины по доке
                    amount: {
                        value: item.price.toFixed(2),
                        currency: 'RUB',
                    },
                    vat_code: 1, // Упрощенная система налогообложения
                    quantity: Number(item.quantity.toFixed(3)), // До 3 знаков, по доке
                    payment_subject: 'commodity',
                    payment_mode: 'full_prepayment',
                })),
            };
        }

        const payload: IYookassaCreatePaymentRequest = {
            amount: {
                value: stringAmount,
                currency: 'RUB',
            },
            capture: false, // Двухстадийная оплата (сначала холдируем)
            confirmation: {
                type: 'redirect',
                return_url: returnUrl,
            },
            description: description,
            metadata: metadata,
            receipt: receipt,
        };

        const url = apiUrl.yookassa.createPayment();

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.getAuthHeader(),
                'Idempotence-Key': uuidv4(),
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Yookassa Create Error: ${JSON.stringify(error)}`);
        }

        return await response.json();
    }

    // Подтверждение платежа (списание денег)
    async capturePayment(paymentId: string, amount: string): Promise<IYookassaPaymentResponse> {
        console.log('capturePayment', paymentId, amount);

        const url = apiUrl.yookassa.capturePayment(paymentId);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.getAuthHeader(),
                'Idempotence-Key': uuidv4(),
            },
            body: JSON.stringify({
                amount: {
                    value: amount,
                    currency: 'RUB',
                },
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Yookassa Capture Error: ${JSON.stringify(error)}`);
        }

        return await response.json();
    }

    // Отмена платежа (если заказ отменен)
    async cancelPayment(paymentId: string): Promise<IYookassaPaymentResponse> {
        console.log('cancelPayment', paymentId);

        const url = apiUrl.yookassa.cancelPayment(paymentId);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.getAuthHeader(),
                'Idempotence-Key': uuidv4(),
            },
        });
        if (!response.ok) {
            throw new Error('Failed to cancel payment');
        }

        return await response.json();
    }
}

export const yookassaService = new YookassaService();
