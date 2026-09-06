import { nanoid } from 'nanoid';
import { revalidatePath, revalidateTag } from 'next/cache';
import { type CollectionConfig } from 'payload';
import slugify from 'slugify';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { isAdmin, isAuthor } from '@/shared/utils/payload';

// TODO: вынести хуки коллекций в переменную / файл

export const AuthorsCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.AUTHORS,
    labels: { singular: 'Автор', plural: 'Авторы' },
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'avatar', 'user', 'createdAt'],
    },

    access: {
        read: async () => {
            return true;
        },

        update: async ({ req: { user } }) => {
            // Публичный доступ для фронтенда закрыт (анонимные запросы)
            if (!user) return false;

            // Админы могут обновлять любых авторов
            if (isAdmin(user)) return true;

            if (isAuthor(user)) {
                // Автор может обновлять только свою запись
                return {
                    user: { equals: user.id },
                };
            }

            return false;
        },

        create: ({ req: { user } }) => isAdmin(user),
        delete: ({ req: { user } }) => isAdmin(user),
    },

    fields: [
        {
            name: 'name',
            type: 'text',
            label: 'Псевдоним',
        },
        {
            name: 'fullName',
            type: 'text',
            label: 'ФИО',
        },
        {
            name: 'slug',
            type: 'text',
            label: 'Уникальная часть URL',
            unique: true,
            admin: {
                position: 'sidebar',
                readOnly: true,
            },
        },
        {
            name: 'bio',
            type: 'textarea',
            label: 'Описание профиля',
        },
        {
            name: 'avatar',
            type: 'upload',
            relationTo: COLLECTION_SLUGS.MEDIA,
        },
        {
            name: 'cover',
            type: 'upload',
            relationTo: COLLECTION_SLUGS.MEDIA,
        },
        {
            name: 'externalLink',
            type: 'text',
            label: 'Ссылка на социальную сеть',
            admin: {
                placeholder: 'https://t.me/username или https://instagram.com/...',
            },
        },
        {
            name: 'products_count',
            type: 'number',
            defaultValue: 0,
            label: 'Общее количество товаров',
            admin: { readOnly: true },
            access: {
                create: () => false,
                update: () => false,
            },
        },
        {
            name: 'product_categories',
            type: 'array',
            admin: { readOnly: true },
            label: 'Категории продаваемых товаров',
            access: {
                create: () => false,
                update: () => false,
            },
            fields: [{ name: 'category', type: 'text' }],
        },
        {
            name: 'user',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.USERS,
            required: false,
            unique: true,
            label: 'Связанная учётная запись',
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'createdAt',
            type: 'date',
            label: 'Дата создания профиля',
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
            label: 'Дата последнего обновления данных профиля',
            admin: {
                readOnly: true,
                date: {
                    displayFormat: 'dd/MM/yyyy HH:mm',
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
    ],

    hooks: {
        afterChange: [
            ({ doc }) => {
                try {
                    revalidateTag(COLLECTION_SLUGS.AUTHORS);
                    if (doc?.slug) {
                        revalidateTag(`author:${doc.slug}`);
                    }
                    revalidatePath('/sitemap.xml');
                } catch {
                    /* empty */
                }
                return doc;
            },
        ],

        afterDelete: [
            ({ doc }) => {
                try {
                    revalidateTag(COLLECTION_SLUGS.AUTHORS);
                    if (doc?.slug) {
                        revalidateTag(`author:${doc.slug}`);
                    }
                    revalidatePath('/sitemap.xml');
                } catch {
                    /* empty */
                }
                return doc;
            },
        ],

        beforeChange: [
            // Генерируем уникальный slug
            async ({ data, originalDoc, req }) => {
                const { payload } = req;

                // Генерируем slug только если у записи ещё нет slug или автор сменил псевдоним

                const existingSlug = originalDoc?.slug;
                const nameChanged = !!data.name && data.name !== originalDoc?.name;
                const shouldGenerateSlug = !existingSlug || nameChanged;

                if (shouldGenerateSlug) {
                    if (data.name) {
                        const baseSlug = slugify(data.name, {
                            lower: true,
                            strict: true,
                            locale: 'ru',
                        });
                        let slug = `${baseSlug}-${nanoid(6)}`;

                        // Проверяем уникальность slug (маловероятно, на всякий случай)
                        let counter = 1;
                        while (
                            await payload
                                .count({
                                    collection: COLLECTION_SLUGS.AUTHORS,
                                    where: {
                                        and: [
                                            { slug: { equals: slug } },
                                            ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
                                        ],
                                    },
                                })
                                .then((res) => res.totalDocs > 0)
                        ) {
                            slug = `${baseSlug}-${nanoid(6)}-${counter++}`;
                        }

                        data.slug = slug;
                    } else {
                        // Если name нет, генерируем slug на основе Id пользователя
                        data.slug = `author-${nanoid(6)}`;
                    }
                } else {
                    data.slug = existingSlug;
                }

                return data;
            },
        ],
    },
};
