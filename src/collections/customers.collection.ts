import type { CollectionConfig } from 'payload';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { isAdmin, isCustomer } from '@/shared/utils/payload';

// Коллекция покупателей без данных для авторизации
export const CustomersCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.CUSTOMERS,
    labels: { singular: 'Покупатель', plural: 'Покупатели' },
    admin: {
        useAsTitle: 'email',
        defaultColumns: ['fullName', 'email', 'user', 'phone', 'createdAt'],
    },

    fields: [
        {
            name: 'email',
            type: 'email',
            label: 'Адрес электронной почты',
            required: true,
            unique: true,
            admin: { readOnly: true },
        },
        {
            name: 'user',
            type: 'relationship',
            label: 'Связанная учётная запись',
            relationTo: COLLECTION_SLUGS.USERS,
            required: true,
            unique: true,
            admin: { readOnly: true },
        },
        {
            name: 'fullName',
            type: 'text',
            label: 'Полное имя',
            admin: { readOnly: true },
        },
        {
            name: 'phone',
            type: 'text',
            label: 'Номер телефона',
            admin: { readOnly: true },
        },
        {
            name: 'addresses',
            type: 'array',
            label: 'Адреса покупателя',
            fields: [
                {
                    name: 'label',
                    type: 'text',
                    label: 'Название адреса',
                    admin: { readOnly: true },
                },
                {
                    name: 'addressLine',
                    type: 'text',
                    label: 'Улица, дом, квартира',
                    required: true,
                    admin: { readOnly: true },
                },
                {
                    name: 'city',
                    type: 'text',
                    label: 'Город',
                    required: true,
                    admin: { readOnly: true },
                },
                {
                    name: 'postalCode',
                    type: 'text',
                    label: 'Почтовый индекс',
                    required: true,
                    admin: { readOnly: true },
                },
            ],
            admin: { readOnly: true },
        },
        {
            name: 'cart',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.CARTS,
            admin: {
                hidden: true,
            },
        },
        {
            name: 'createdAt',
            type: 'date',
            label: 'Дата создания профиля покупателя',
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
            label: 'Дата последнего обновления данных профиля покупателя',
            admin: {
                readOnly: true,
                date: {
                    displayFormat: 'dd/MM/yyyy HH:mm',
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
    ],

    access: {
        read: async ({ req: { user } }) => {
            // Публичный доступ для фронтенда закрыт
            if (!user) return false;

            // Админы видят всех покупателей
            if (isAdmin(user)) return true;

            // Покупатели видят только свою запись
            if (isCustomer(user)) {
                return {
                    user: { equals: user.id },
                };
            }

            // Все остальные не видят покупателей
            return false;
        },

        update: async ({ req: { user } }) => {
            // Публичный доступ для фронтенда закрыт (анонимные запросы)
            if (!user) return false;

            // Админы могут обновлять любых покупателей
            if (isAdmin(user)) return true;

            if (isCustomer(user)) {
                // Покупатель может обновлять только свою запись
                return {
                    user: { equals: user.id },
                };
            }

            return false;
        },

        // Создается автоматически через хук users
        create: ({ req: { user } }) => isAdmin(user),
        delete: ({ req: { user } }) => isAdmin(user),
    },
};

// Users - только для авторизации
// Customers - дополнительные данные покупателей
// Authors - дополнительные данные авторов

// TODO: конвертировать все комментарии в коде в JSDoc
