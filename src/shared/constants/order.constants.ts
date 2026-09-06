import type { IOrderStatus } from '../types/order.interface';

export const ORDER_STATUS = {
    PREPARED: 'prepared',
    PROCESSING: 'processing',
    ASSEMBLED: 'assembled',
    SENT: 'sent',
    DELIVERED: 'delivered',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const;

export const DELIVERY_TYPES = {
    PICKUP: 'pickup',
    DELIVERY: 'delivery',
} as const;

export const getOrderStatusText = (status: IOrderStatus): string => {
    switch (status) {
        case ORDER_STATUS.PREPARED:
            return 'Ожидает оплаты';
        case ORDER_STATUS.PROCESSING:
            return 'В обработке';
        case ORDER_STATUS.ASSEMBLED:
            return 'Собран';
        case ORDER_STATUS.SENT:
            return 'Отправлен';
        case ORDER_STATUS.DELIVERED:
            return 'Доставлен';
        case ORDER_STATUS.COMPLETED:
            return 'Выполнен';
        case ORDER_STATUS.CANCELLED:
            return 'Отменён';
        default:
            return status;
    }
};

export const PICKUP_ADDRESS = 'улица Горького, 33, Екатеринбург';
