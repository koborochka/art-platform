import { APIError, type CollectionConfig } from 'payload';

import { yookassaService } from '@/services/api/server/yookassa.service';
import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { DELIVERY_TYPES, ORDER_STATUS } from '@/shared/constants/order.constants';
import { PAYMENT_STATUS } from '@/shared/constants/payment.constants';
import { UserType } from '@/shared/types/auth.interface';
import type { PaymentStatusType } from '@/shared/types/yookassa.interface';
import { isAdmin, isCreateOperation, isCustomer } from '@/shared/utils/payload';

export const OrdersCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.ORDERS,
    labels: { singular: 'Заказ', plural: 'Заказы' },
    admin: {
        useAsTitle: 'orderNumber',
        defaultColumns: ['orderNumber', 'deliveryType', 'status', 'total', 'createdAt'],
    },

    fields: [
        {
            name: 'orderNumber',
            type: 'text',
            unique: true,
            label: 'Номер заказа',
            admin: {
                readOnly: true,
                position: 'sidebar',
            },
        },
        {
            name: 'customer',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.CUSTOMERS,
            label: 'Покупатель',
            admin: { readOnly: true },
            required: true,
        },
        {
            name: 'items',
            type: 'array',
            label: 'Данные товаров на момент оформления заказа',
            labels: {
                singular: 'Товар',
                plural: 'Товары',
            },
            fields: [
                {
                    // Если сохранять не снэп, а id товара, то если товар изменится - история заказов покажет неверные данные
                    name: 'productSnapshot',
                    type: 'group',
                    label: 'Товар',
                    admin: { readOnly: true },
                    fields: [
                        {
                            name: 'productId',
                            type: 'number',
                            required: true,
                            admin: { readOnly: true, hidden: true },
                        },
                        {
                            name: 'title',
                            type: 'text',
                            required: true,
                            label: 'Название',
                            admin: { readOnly: true },
                        },
                        {
                            name: 'price',
                            type: 'number',
                            required: true,
                            label: 'Цена за штуку',
                            admin: { readOnly: true },
                        },
                    ],
                },
                {
                    name: 'quantity',
                    type: 'number',
                    min: 1,
                    label: 'Количество',
                    admin: { readOnly: true },
                    required: true,
                },
            ],
            admin: { readOnly: true },
            required: true,
        },
        {
            name: 'deliveryType',
            type: 'select',
            options: [
                { value: DELIVERY_TYPES.PICKUP, label: 'Самовывоз' },
                { value: DELIVERY_TYPES.DELIVERY, label: 'Доставка СДЭК' },
            ],
            defaultValue: DELIVERY_TYPES.PICKUP,
            label: 'Выбранный способ доставки',
            admin: { readOnly: true },
            required: true,
        },
        {
            name: 'cdekData',
            type: 'group',
            label: 'Данные СДЭК',
            fields: [
                {
                    name: 'type',
                    type: 'select',
                    options: [
                        { value: 'pvz', label: 'ПВЗ' },
                        { value: 'courier', label: 'Курьер' },
                    ],
                    label: 'Тип доставки СДЭК',
                    admin: {
                        readOnly: true,
                    },
                },
                {
                    name: 'address',
                    type: 'text',
                    label: 'Адрес доставки',
                    required: true,
                    admin: {
                        readOnly: true,
                    },
                },
                {
                    name: 'code',
                    type: 'text',
                    label: 'Код ПВЗ',
                    admin: {
                        condition: (_, siblingData) => siblingData.type === 'pvz',
                        readOnly: true,
                    },
                },
            ],
            admin: {
                condition: (data) => data.deliveryType === DELIVERY_TYPES.DELIVERY,
            },
        },
        {
            name: 'customerDetails',
            type: 'text',
            label: 'Данные покупателя',
            virtual: true,
            admin: {
                readOnly: true,
            },
            hooks: {
                afterRead: [
                    async ({ data, req: { payload } }) => {
                        if (!data) return null;
                        const customer = await payload.findByID({
                            collection: COLLECTION_SLUGS.CUSTOMERS,
                            id: data.customer,
                            depth: 0,
                        });

                        return `${customer.fullName}, ${customer.phone}`;
                    },
                ],
            },
        },
        {
            name: 'trackingNumber',
            type: 'text',
            label: 'Трек-номер СДЭК',
            admin: {
                condition: (data) => data.deliveryType === DELIVERY_TYPES.DELIVERY,
                description: 'Заполняется после отправки заказа',
            },
        },
        {
            name: 'comment',
            type: 'text',
            label: 'Комментарий к заказу',
            admin: {
                readOnly: true,
            },
        },
        {
            // Единственное редактируемое поле
            name: 'status',
            type: 'select',
            index: true,
            label: 'Статус заказа',
            options: [
                { value: ORDER_STATUS.PREPARED, label: 'Ожидает оплаты' },
                { value: ORDER_STATUS.PROCESSING, label: 'В обработке (Платёж оплачен)' },
                { value: ORDER_STATUS.ASSEMBLED, label: 'Собран' },
                { value: ORDER_STATUS.SENT, label: 'Отправлен' },
                { value: ORDER_STATUS.DELIVERED, label: 'Доставлен' },
                { value: ORDER_STATUS.COMPLETED, label: 'Выполнен (Будет подтверждено зачисление средств)' },
                { value: ORDER_STATUS.CANCELLED, label: 'Отменён (Деньги будут возвращены)' },
            ],
            defaultValue: ORDER_STATUS.PREPARED,
            required: true,
        },
        {
            name: 'paymentStatus',
            type: 'select',
            label: 'Статус оплаты в ЮКассе',
            options: [
                { value: PAYMENT_STATUS.PENDING, label: 'Платеж создан, ожидает оплаты' },
                { value: PAYMENT_STATUS.WAITING_FOR_CAPTURE, label: 'Платеж оплачен, деньги ожидают списания' },
                { value: PAYMENT_STATUS.SUCCEEDED, label: 'Платёж успешно завершён' },
                { value: PAYMENT_STATUS.CANCELED, label: 'Платёж отменён' },
            ],
            defaultValue: PAYMENT_STATUS.PENDING,
            admin: {
                position: 'sidebar',
                description: 'Статус обновляется периодически. Актуальное значение можно узнать в ЮКассе',
                readOnly: true, // Только ЮКасса может менять это поле
                style: {
                    fontWeight: 'bold',
                },
            },
        },
        {
            name: 'paymentId',
            type: 'text',
            label: 'ID Платежа ЮКассы',
            admin: {
                readOnly: true,
                position: 'sidebar',
            },
        },
        {
            name: 'paymentLink',
            type: 'text',
            label: 'Ссылка на оплату',
            admin: {
                readOnly: true,
                position: 'sidebar',
            },
        },
        {
            name: 'total',
            type: 'number',
            required: true,
            admin: { readOnly: true },
            label: 'Общая сумма заказа',
            min: 0,
        },
        {
            name: 'createdAt',
            type: 'date',
            label: 'Дата создания заказа',
            admin: {
                readOnly: true,
                date: {
                    displayFormat: 'dd/MM/yyyy HH:mm',
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'updatedAt',
            type: 'date',
            label: 'Дата последнего обновления заказа',
            admin: {
                readOnly: true,
                date: {
                    displayFormat: 'dd/MM/yyyy HH:mm',
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'saleDocumentNumber',
            type: 'text',
            label: 'Номер продажи в 1С',
            admin: {
                readOnly: true,
                position: 'sidebar',
                description: 'Заполняется автоматически после успешного проведения продажи в 1С',
            },
        },
    ],

    access: {
        read: async ({ req: { user, payload } }) => {
            if (!user) return false;
            if (isAdmin(user)) return true;

            // Для покупателей находим их customer запись
            if (user.role === UserType.CUSTOMER) {
                try {
                    const customerRes = await payload.find({
                        collection: COLLECTION_SLUGS.CUSTOMERS,
                        where: { user: { equals: user.id } },
                        limit: 1,
                    });

                    const customer = customerRes.docs[0];
                    if (!customer) return false;

                    // Возвращаем условие фильтрации по customer
                    return {
                        customer: { equals: customer.id },
                    };
                } catch (error) {
                    console.error('Error fetching customer for order access:', error);
                    return false;
                }
            }

            // Авторы не видят заказы
            return false;
        },

        create: async ({ req: { user } }) => {
            if (!user) return false;

            // Разрешаем создавать заказы админам и авторизованным покупателям
            if (isAdmin(user) || isCustomer(user)) return true;

            return false;
        },

        update: async ({ req: { user, payload }, id }) => {
            if (!user) return false;
            if (isAdmin(user)) return true;
            if (!id) return false;
            if (isCustomer(user)) {
                // 1. Находим customer запись пользователя
                const customerRes = await payload.find({
                    collection: COLLECTION_SLUGS.CUSTOMERS,
                    where: { user: { equals: user.id } },
                    limit: 1,
                });
                const customer = customerRes.docs[0];
                if (!customer) return false;

                // 2. Получаем заказ
                const order = await payload.findByID({
                    collection: COLLECTION_SLUGS.ORDERS,
                    id: id,
                });
                if (!order) return false;

                // 3. Проверяем, что заказ принадлежит покупателю и не в финальном статусе
                const orderCustomerId = typeof order.customer === 'object' ? order.customer.id : order.customer;

                const isOwner = orderCustomerId === customer.id;
                const isEditableStatus =
                    order.status !== ORDER_STATUS.CANCELLED && order.status !== ORDER_STATUS.COMPLETED;

                return isOwner && isEditableStatus;
            }

            return false;
        },

        delete: ({ req }) => isAdmin(req.user),
    },

    hooks: {
        // Хук нужен только для обработки ручных изменений админом через админ-панель
        beforeChange: [
            async ({ data, originalDoc }) => {
                // Игнорируем операцию создания заказа
                if (!originalDoc) return data;

                const newStatus = data.status;
                const oldStatus = originalDoc.status;
                const newPaymentStatus = data.paymentStatus as PaymentStatusType;
                const oldPaymentStatus = originalDoc.paymentStatus as PaymentStatusType;
                const paymentId = originalDoc.paymentId;

                // Блокировка изменения статуса:
                // Если платеж уже финальный (успех или отмена), запрещаем менять статус заказа вручную
                // Исключение: обновление через вебхук (когда меняется paymentStatus)
                const isWebhookUpdate = newPaymentStatus !== oldPaymentStatus;
                if (!isWebhookUpdate) {
                    if (oldPaymentStatus === PAYMENT_STATUS.SUCCEEDED) {
                        throw new APIError('Заказ выполнен и оплачен. Редактирование статуса запрещено.', 400);
                    }
                    if (oldPaymentStatus === PAYMENT_STATUS.CANCELED) {
                        throw new APIError('Оплата отменена. Нельзя возобновить этот заказ.', 400);
                    }
                }

                // Синхронизация: если пришел вебхук и поменял paymentStatus (PaymentStatus -> Status)
                if (newPaymentStatus && newPaymentStatus !== oldPaymentStatus) {
                    if (newPaymentStatus === PAYMENT_STATUS.WAITING_FOR_CAPTURE) {
                        if (oldStatus === ORDER_STATUS.PREPARED) {
                            data.status = ORDER_STATUS.PROCESSING;
                        }
                    } else if (newPaymentStatus === PAYMENT_STATUS.SUCCEEDED) {
                        data.status = ORDER_STATUS.COMPLETED;
                    } else if (newPaymentStatus === PAYMENT_STATUS.CANCELED) {
                        data.status = ORDER_STATUS.CANCELLED;
                    }

                    return data;
                }

                // Синхронизация: если админ меняет статус заказа вручную (Status -> API Yookassa)
                if (newStatus !== oldStatus && paymentId) {
                    // Админ ставит "Выполнен" -> Подтверждаем списание (Capture)
                    if (newStatus === ORDER_STATUS.COMPLETED) {
                        if (oldPaymentStatus !== PAYMENT_STATUS.WAITING_FOR_CAPTURE) {
                            throw new APIError('Нельзя завершить заказ, пока платёж не оплачен', 400);
                        }
                        try {
                            const amount = originalDoc.total.toFixed(2);
                            await yookassaService.capturePayment(paymentId, amount);
                            data.paymentStatus = PAYMENT_STATUS.SUCCEEDED; // для UX лучше обновить сразу, вебхук потом подтвердит
                        } catch (e) {
                            const msg = e instanceof Error ? e.message : 'Unknown error';
                            throw new APIError(`Ошибка подтверждения оплаты: ${msg}`, 400);
                        }
                    }

                    // Админ ставит "Отменён" -> Отменяем платёж
                    if (newStatus === ORDER_STATUS.CANCELLED) {
                        if (oldPaymentStatus === PAYMENT_STATUS.WAITING_FOR_CAPTURE) {
                            try {
                                await yookassaService.cancelPayment(paymentId);
                                data.paymentStatus = PAYMENT_STATUS.CANCELED;
                            } catch (e) {
                                const msg = e instanceof Error ? e.message : 'Unknown error';
                                throw new APIError(`Ошибка отмены оплаты в ЮКассе: ${msg}`, 400);
                            }
                        } else if (oldPaymentStatus === PAYMENT_STATUS.PENDING) {
                            data.paymentStatus = PAYMENT_STATUS.CANCELED;
                        } else if (oldPaymentStatus === PAYMENT_STATUS.SUCCEEDED) {
                            throw new APIError(
                                'Оплата уже проведена. Для возврата средств обратитесь в службу поддержки.',
                                400,
                            );
                        }
                    }
                }

                return data;
            },

            async ({ data, req, operation }) => {
                const { user, payload } = req;

                if (isCreateOperation(operation)) {
                    if (user && isCustomer(user)) {
                        // Находим customer запись для текущего пользователя
                        const customerRes = await payload.find({
                            collection: COLLECTION_SLUGS.CUSTOMERS,
                            where: { user: { equals: user.id } },
                            limit: 1,
                        });
                        const customer = customerRes.docs[0];
                        if (customer) {
                            data!.customer = customer.id;
                        }
                    }

                    // Генерируем номер заказа

                    if (data?.customer && !data?.orderNumber) {
                        // data.customer может быть ID (number) или объектом
                        const customerId = typeof data.customer === 'object' ? data.customer.id : data.customer;

                        const lastOrder = await payload.find({
                            collection: COLLECTION_SLUGS.ORDERS,
                            where: { customer: { equals: customerId } },
                            limit: 1,
                        });

                        let orderSequence = 1;
                        if (lastOrder.docs.length > 0) {
                            const lastOrderNumber = lastOrder.docs[0]?.orderNumber;
                            // Парсим "ORD-ID-0001"
                            const lastNumber = lastOrderNumber?.match(/-(\d+)$/);
                            if (lastNumber && lastNumber[1]) {
                                orderSequence = parseInt(lastNumber[1], 10) + 1;
                            }
                        }

                        data!.orderNumber = `ORD-${customerId}-${orderSequence.toString().padStart(4, '0')}`;
                    }
                }

                return data;
            },
        ],
    },
};
