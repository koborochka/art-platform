'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Timer } from '@/components/shared/Timer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PAGES } from '@/config/public-pages.config';
import { orderClientService } from '@/services/api/client/order-client.service';
import { DELIVERY_TYPES, getOrderStatusText, ORDER_STATUS, PICKUP_ADDRESS } from '@/shared/constants/order.constants';
import { PAYMENT_STATUS } from '@/shared/constants/payment.constants';
import { isImageData } from '@/shared/guards/image.guard';
import { useProductsByIds, useProductSlugs } from '@/shared/hooks/useFetchData';
import type { Order } from '@/shared/types/payload-types';
import { canOrderBeCancelled } from '@/shared/utils/orders.utils';
import { cn } from '@/shared/utils/tailwind';

function getStatusBadgeClass(status: string): string {
    switch (status) {
        case ORDER_STATUS.COMPLETED:
            return 'bg-green-50 text-green-700';
        case ORDER_STATUS.CANCELLED:
            return 'bg-gray-100 text-my-tertriary';
        default:
            return 'bg-gray-100 text-my-secondary';
    }
}

interface OrderHistoryProps {
    customerId: number;
}

export default function OrderHistory({ customerId }: OrderHistoryProps) {
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [expiredOrders, setExpiredOrders] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState(true);

    // Собираем все уникальные productId из всех заказов
    // TODO: возможно лишнее, они же и так сгруппированые
    const allProductIds = useMemo(() => {
        return orders
            .flatMap((order) => order.items.map((item) => item.productSnapshot.productId))
            .filter((id, index, self) => self.indexOf(id) === index); // Уникальные ID
    }, [orders]);

    const { data: products } = useProductsByIds(allProductIds);
    // Загружаем slug для всех productId
    const { slugMap } = useProductSlugs(allProductIds);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                const customerOrders = await orderClientService.getOrdersByCustomer(customerId);
                setOrders(customerOrders);
            } catch (error) {
                console.error('Failed to load orders', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [customerId]);

    const handleCancelOrder = async (orderId: number) => {
        await orderClientService.cancelOrder(orderId);
        // Обновляем список заказов в UI
        setOrders((prev) =>
            prev.map((order) => (order.id === orderId ? { ...order, status: ORDER_STATUS.CANCELLED } : order)),
        );
    };

    const handleExpire = useCallback((orderId: number) => {
        setExpiredOrders((prev) => ({ ...prev, [orderId]: true }));
    }, []);

    if (loading) {
        return (
            <div className="rounded-xl bg-gray-50 py-10 px-6 text-center">
                <p className="text-base text-my-secondary">Загрузка заказов...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-base text-my-secondary">У вас пока нет заказов</p>
                <Button onClick={() => router.push(PAGES.PRODUCTS)} className="mt-4">
                    Перейти к покупкам
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 md:gap-6">
            {orders.map((order) => {
                const status = order.status as (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
                const paymentStatus = order.paymentStatus;
                const paymentLink = order.paymentLink;

                const showPayLink =
                    status === ORDER_STATUS.PREPARED && paymentStatus === PAYMENT_STATUS.PENDING && !!paymentLink;

                const isCancellable = canOrderBeCancelled(order);
                const isExpired = expiredOrders[order.id];

                return (
                    <article
                        key={order.id}
                        className="rounded-xl shadow-[0px_5px_30px_0px_#11182714] p-3 md:p-5 flex flex-col gap-3"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-base md:text-xl font-semibold text-my-primary tabular-nums">
                                {order.orderNumber}
                            </h3>

                            {isCancellable && (
                                <button
                                    type="button"
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="px-3 py-1 rounded-lg text-sm font-[450] bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                                >
                                    Отменить
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
                            <div>
                                <p className="text-sm md:text-base font-medium text-my-tertriary mb-2">Дата заказа</p>
                                <p className="text-sm md:text-base font-semibold text-my-primary">
                                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                </p>
                            </div>
                            <div className="md:col-span-4">
                                <p className="text-sm md:text-base font-medium text-my-tertriary mb-2">
                                    {order.deliveryType === DELIVERY_TYPES.PICKUP
                                        ? 'Самовывоз'
                                        : 'Доставка СДЭК, курьер'}
                                </p>
                                <p className="text-sm md:text-base font-semibold text-my-primary leading-tight">
                                    {order.deliveryType === DELIVERY_TYPES.PICKUP
                                        ? PICKUP_ADDRESS
                                        : order.cdekData?.address || 'Адрес не указан'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 md:mb-2">
                            {order.items.map((item, idx) => {
                                const currentProduct = products.find((p) => p.id === item.productSnapshot.productId);
                                const mainImage =
                                    currentProduct?.gallery?.[0]?.image && isImageData(currentProduct.gallery[0].image)
                                        ? currentProduct.gallery[0].image
                                        : '/placeholder.png';

                                return (
                                    <Link
                                        href={PAGES.PRODUCT(slugMap[item.productSnapshot.productId] || '')}
                                        key={idx}
                                        className="relative w-20 h-20 rounded-xl overflow-hidden cursor-pointer shrink-0"
                                    >
                                        <Image
                                            src={
                                                isImageData(mainImage) && mainImage.url
                                                    ? mainImage.url
                                                    : (mainImage as string)
                                            }
                                            alt={item.productSnapshot.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <Badge className="absolute bottom-1 left-1" variant="secondary">
                                            {item.quantity} шт
                                        </Badge>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-3 md:pt-5 border-t border-gray-100">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-base md:text-xl font-semibold text-my-primary tabular-nums">
                                    {order.total.toLocaleString('ru-RU')} ₽
                                </span>

                                {showPayLink && !isExpired && (
                                    <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                                        <Button size="sm" className="rounded-lg">
                                            Оплатить
                                        </Button>
                                    </a>
                                )}
                            </div>

                            <div
                                className={cn(
                                    'px-3 py-1.5 rounded-xl text-sm md:text-base shrink-0',
                                    showPayLink && !isExpired
                                        ? 'text-xs md:text-base text-gray-600 md:text-my-tertriary max-md:bg-gray-100 max-md:rounded-full'
                                        : getStatusBadgeClass(status),
                                )}
                            >
                                {showPayLink && !isExpired ? (
                                    <>
                                        Ожидает оплаты{' '}
                                        <Timer
                                            startTime={order.createdAt}
                                            durationMinutes={10}
                                            expiredText=""
                                            onExpire={() => handleExpire(order.id)}
                                            className="inline"
                                        />
                                    </>
                                ) : (
                                    getOrderStatusText(status)
                                )}
                            </div>
                        </div>

                        {/* TODO: уничтожить после окончательного теста */}
                        {/*
                                                
                            {process.env.NODE_ENV === 'development' && (
                                <div className="mt-4 p-2 border border-dashed border-gray-400 rounded bg-gray-50">
                                    <p className="text-xs font-mono mb-2">DEV: Webhook Simulation</p>
                                    <div className="flex gap-2 flex-wrap">
                                        <Button
                                            variant="outline"
                                            onClick={() => triggerWebhook(order, 'waiting_for_capture')}
                                        >
                                            Simulate: waiting_for_capture
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="text-green-600 border-green-200"
                                            onClick={() => triggerWebhook(order, 'succeeded')}
                                        >
                                            Simulate: succeeded
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="text-red-600 border-red-200"
                                            onClick={() => triggerWebhook(order, 'canceled')}
                                        >
                                            Simulate: canceled
                                        </Button>
                                    </div>
                                </div>
                            )}
                            */}
                    </article>
                );
            })}
        </div>
    );
}
