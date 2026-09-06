import type { PAYMENT_STATUS } from '../constants/payment.constants';

export interface IYookassaAmount {
    value: string;
    currency: string;
}

export interface IYookassaConfirmation {
    type: string;
    return_url: string;
    confirmation_url?: string;
}

/**
 * @see https://yookassa.ru/developers/api#capture_payment_receipt
 */
export interface IYookassaReceipt {
    customer: {
        email?: string;
        phone?: string;
        full_name?: string;
        inn?: string;
    };
    items: IYookassaReceiptItem[];
}

export interface IYookassaReceiptItem {
    description: string;
    amount: {
        value: string;
        currency: string;
    };
    vat_code: number;
    quantity: number;
    payment_mode: string;
    payment_subject: string;
}

export interface IYookassaPaymentMethod {
    type: string;
    id: string;
    saved: boolean;
    status: 'pending' | 'active' | 'inactive';
    title?: string;
    card?: {
        first6?: string;
        last4: string;
        expiry_year: string;
        expiry_month: string;
        card_type: string;
    };
}

/**
 * @see https://yookassa.ru/developers/using-api/webhooks#notification-object
 */
export interface IYookassaWebhookEvent {
    type: string;
    event: 'payment.waiting_for_capture' | 'payment.succeeded' | 'payment.canceled';
    object: IYookassaPaymentResponse;
}

/**
 * @see https://yookassa.ru/developers/api#create_payment
 */
export interface IYookassaCreatePaymentRequest {
    amount: IYookassaAmount;
    description?: string;
    receipt?: IYookassaReceipt;
    confirmation: IYookassaConfirmation;
    capture: boolean;
    metadata?: Record<string, string>;
}

/**
 * @see https://yookassa.ru/developers/api#payment_object
 */
export interface IYookassaPaymentResponse {
    id: string;
    status: PaymentStatusType;
    amount: IYookassaAmount;
    description?: string;
    payment_method?: IYookassaPaymentMethod;
    created_at: string;
    confirmation?: IYookassaConfirmation;
    test: boolean;
    paid: boolean;
    refundable: boolean;
    metadata?: Record<string, string>;
}

export interface IYookassaPaymentCreateInput {
    amount: number;
    description: string;
    returnUrl: string;
    metadata?: Record<string, string>;
    customerEmail?: string; // для чека
    items?: { title: string; price: number; quantity: number }[]; // для чека
}

export type PaymentStatusType = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
