import { ORDER_STATUS } from '../constants/order.constants';
import type { Order } from '../types/payload-types';

export const isOrderFinished = (order: Order): boolean => {
    return order.status === ORDER_STATUS.COMPLETED || order.status === ORDER_STATUS.CANCELLED;
};

export const isOrderInDelivery = (order: Order): boolean => {
    return order.status === ORDER_STATUS.SENT || order.status === ORDER_STATUS.DELIVERED;
};

export const canOrderBeCancelled = (order: Order): boolean => {
    return order.status === ORDER_STATUS.PROCESSING || order.status === ORDER_STATUS.ASSEMBLED;
};
