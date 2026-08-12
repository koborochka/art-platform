import type { CollectionConfig } from 'payload';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { UserType } from '@/shared/types/auth.interface';
import { generateForgotPasswordEmailHTML, generateVerificationEmailHTML } from '@/shared/utils/email-templates';
import { isAdmin, isCreateOperation } from '@/shared/utils/payload';

// TODO: удалить после подключения HTTPS
// Определяем, используется ли HTTPS
const isHttps = process.env.NEXT_PUBLIC_BASE_URL?.startsWith('https:');
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // TODO apiurl

// Коллекция пользователей панели администратора, управляемая через PayloadCMS
export const UsersCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.USERS,
    auth: {
        cookies: {
            // Включаем secure только если сайт работает по HTTPS
            secure: isHttps,
            // Lax достаточно, так как фронт и бэк на одном домене
            sameSite: 'Lax',
        },
        // Оставляем API ключи для серверных запросов
        tokenExpiration: 7200, // 2 часа

        // Включаем встроенную верификацию email
        verify: {
            generateEmailHTML: ({ token }) => generateVerificationEmailHTML(token, baseUrl),
            generateEmailSubject: () => 'Подтверждение регистрации на Минто',
        },

        // Сброс пароля
        forgotPassword: {
            generateEmailHTML: ({ token } = {}) => generateForgotPasswordEmailHTML(token, baseUrl),
            generateEmailSubject: () => 'Сброс пароля на Минто',
        },
    },
    labels: { singular: 'Учётная запись', plural: 'Учётные записи' },
    admin: {
        useAsTitle: 'email',
        defaultColumns: ['email', 'role', 'createdAt'],

        hidden: (args) => {
            // Безопасная проверка на наличие user (воизбежание ошибок с созданием первого юзера)
            if (!args || !args.user) return false;
            // Показываем только админов и авторов в админ-панели
            return args.user.role === UserType.CUSTOMER;
        },
    },

    fields: [
        {
            name: 'email',
            type: 'email',
            label: 'Адрес электронной почты',
            required: true,
            unique: true,
        },
        {
            name: 'role',
            type: 'select',
            options: [
                { label: 'Администратор', value: UserType.ADMIN },
                { label: 'Автор', value: UserType.AUTHOR },
                { label: 'Покупатель', value: UserType.CUSTOMER }, // TODO: Оставить только создание автора без выбора через админку
            ],
            label: 'Тип пользователя',
            required: true,
            defaultValue: UserType.CUSTOMER,
            admin: {
                position: 'sidebar',

                condition: (args) => {
                    // Если нет аргументов или req, показываем поле (для создания первого пользователя)
                    if (!args || !args.req) return true;

                    // Если нет пользователя в req, показываем поле
                    if (!args.req.user) return true;

                    // Иначе показываем только админам
                    return isAdmin(args.req.user);
                },
            },
        },
        {
            name: 'createdAt',
            type: 'date',
            label: 'Дата создания учётной записи',
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
            label: 'Дата последнего обновления данных учётной записи',
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
        read: ({ req: { user } }) => {
            if (!user) return false;
            if (isAdmin(user)) return true;
            return { id: { equals: user.id } };
        },

        create: ({ req: { user } }) => {
            // Регистрация покупателей разрешена всем
            if (!user) {
                return {
                    role: { equals: UserType.CUSTOMER },
                };
            }

            // Авторы/админы создаются только админами
            if (isAdmin(user)) return true;

            // Остальные могут создавать только покупателей
            return {
                role: { equals: UserType.CUSTOMER },
            };
        },

        update: ({ req: { user } }) => {
            if (!user) return false;
            if (isAdmin(user)) return true;
            return { id: { equals: user.id } };
        },

        delete: ({ req: { user } }) => isAdmin(user),
    },

    hooks: {
        beforeChange: [
            // Если создаём первого юзера, делаем его админом
            async ({ data, req, operation }) => {
                if (isCreateOperation(operation)) {
                    const { payload } = req;

                    const existingUsers = await payload.find({
                        collection: COLLECTION_SLUGS.USERS,
                        limit: 1,
                    });

                    if (existingUsers.totalDocs === 0) {
                        data.role = UserType.ADMIN;
                    }
                }

                return data;
            },
        ],

        afterChange: [
            async ({ doc, req, operation }) => {
                // При создании автора создаем запись в authors
                if (isCreateOperation(operation) && doc.role === UserType.AUTHOR) {
                    try {
                        await req.payload.create({
                            collection: COLLECTION_SLUGS.AUTHORS,
                            data: {
                                user: doc.id,
                            },
                            req,
                        });
                    } catch (error) {
                        console.error('Error creating author record:', error);
                    }
                }

                // При создании покупателя создаем запись в customers
                if (isCreateOperation(operation) && doc.role === UserType.CUSTOMER) {
                    try {
                        await req.payload.create({
                            collection: COLLECTION_SLUGS.CUSTOMERS,
                            data: {
                                email: doc.email,
                                user: doc.id,
                            },
                            req,
                        });
                    } catch (error) {
                        console.error('Error creating customer record:', error);
                    }
                }

                return doc;
            },
        ],
    },
};
