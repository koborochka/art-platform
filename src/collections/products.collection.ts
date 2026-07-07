import { nanoid } from 'nanoid';
import { revalidatePath, revalidateTag } from 'next/cache';
import { type CollectionConfig } from 'payload';
import slugify from 'slugify';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { isAuthorData } from '@/shared/guards/author.guard';
import { isAdmin, isAuthor, isCreateOperation, isCustomer } from '@/shared/utils/payload';

export const ProductsCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.PRODUCTS,
    labels: { singular: 'Товар', plural: 'Товары' },
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'price', 'category', 'author', 'createdAt'],
    },

    access: {
        read: async ({ req: { user, payload } }) => {
            // Публичный доступ для фронтенда (анонимные запросы)
            if (!user) return true;

            // Админы видят все товары
            if (isAdmin(user)) return true;

            // Покупатели видят все товары
            if (isCustomer(user)) return true;

            // Авторы видят только свои товары
            if (isAuthor(user)) {
                const authorRes = await payload.find({
                    collection: COLLECTION_SLUGS.AUTHORS,
                    where: { user: { equals: user.id } },
                    limit: 1,
                });
                const author = authorRes.docs[0];
                if (!author) return false;

                return { author: { equals: author.id } };
            }

            return false;
        },

        update: async ({ req: { user, payload }, id }) => {
            // Публичный доступ для фронтенда закрыт (анонимные запросы)
            if (!user) return false;

            // Админы могут обновлять любые товары
            if (isAdmin(user)) return true;

            // Авторы могут обновлять только свои товары
            if (isAuthor(user)) {
                const authorRes = await payload.find({
                    collection: COLLECTION_SLUGS.AUTHORS,
                    where: { user: { equals: user.id } },
                    limit: 1,
                });
                const author = authorRes.docs[0];
                if (!author) return false;

                if (!id) return false;

                try {
                    // Получаем товар
                    const product = await payload.findByID({
                        collection: COLLECTION_SLUGS.PRODUCTS,
                        id: id,
                    });

                    if (!product) return false; // На всякий случай

                    // Сравниваем ID автора товара с ID автора
                    // product.author может быть объектом или ID
                    // ^ TODO: странно это, пофиксить мб

                    const productAuthorId = isAuthorData(product.author) ? product.author.id : product.author;
                    const hasAccess = productAuthorId === author.id;

                    return hasAccess;
                } catch (error) {
                    // Если товар не найден (findByID выбросил ошибку),
                    // значит и обновлять нечего => запрещаем доступ
                    console.error('Error: product not found', error);
                    return false;
                }
            }

            return false;
        },

        // create и delete аналогичны update
        create: async ({ req: { user, payload } }) => {
            if (!user) return false;

            if (isAdmin(user)) return true;

            if (isAuthor(user)) {
                // Проверяем, что у автора есть профиль
                const authorRes = await payload.find({
                    collection: COLLECTION_SLUGS.AUTHORS,
                    where: { user: { equals: user.id } },
                    limit: 1,
                });
                return authorRes.docs.length > 0;
            }

            return false;
        },

        delete: async ({ req: { user, payload }, id }) => {
            if (!user) return false;

            if (isAdmin(user)) return true;

            if (isAuthor(user)) {
                const authorRes = await payload.find({
                    collection: COLLECTION_SLUGS.AUTHORS,
                    where: { user: { equals: user.id } },
                    limit: 1,
                });
                const author = authorRes.docs[0];
                if (!author) return false;

                if (!id) return false;

                try {
                    const product = await payload.findByID({
                        collection: COLLECTION_SLUGS.PRODUCTS,
                        id: id,
                    });

                    if (!product) return false;

                    const productAuthorId = isAuthorData(product.author) ? product.author.id : product.author;
                    return productAuthorId === author.id;
                } catch (error) {
                    console.error('Error: product not found', error);
                    return false;
                }
            }

            return false;
        },
    },

    fields: [
        {
            name: 'article1C',
            type: 'text',
            label: 'Артикул 1С',
            admin: {
                readOnly: true,
            },
        },
        {
            name: 'title',
            type: 'text',
            label: 'Название',
            required: true,
        },
        {
            name: 'slug',
            type: 'text',
            label: 'Уникальная часть URL',
            required: true,
            unique: true,
            admin: {
                position: 'sidebar',
                readOnly: true,
            },
        },
        {
            name: 'price',
            type: 'number',
            label: 'Цена',
        },
        {
            name: 'description',
            type: 'textarea',
            label: 'Описание',
        },
        {
            name: 'gallery',
            type: 'array',
            label: 'Изображения',
            fields: [
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: COLLECTION_SLUGS.MEDIA,
                },
            ],
        },
        {
            name: 'quantity',
            type: 'number',
            label: 'Количество на складе',
            defaultValue: 0,
        },
        {
            name: 'category',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.CATEGORIES,
            label: 'Категория',
            required: false,
        },
        {
            name: 'author',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.AUTHORS,
            required: true,
            label: 'Продавец (Автор)',
            // Текущий автор не может добавить товар другому автору
            access: {
                create: ({ req }) => isAdmin(req.user),
                update: ({ req }) => isAdmin(req.user),
            },
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'createdAt',
            type: 'date',
            label: 'Дата создания товара',
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
            label: 'Дата последнего обновления данных товара',
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
                    revalidateTag(COLLECTION_SLUGS.PRODUCTS);
                    if (doc?.slug) {
                        revalidateTag(`product:${doc.slug}`);
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
                    revalidateTag(COLLECTION_SLUGS.PRODUCTS);
                    if (doc?.slug) {
                        revalidateTag(`product:${doc.slug}`);
                    }
                    revalidatePath('/sitemap.xml');
                } catch {
                    /* empty */
                }
                return doc;
            },
        ],

        beforeChange: [
            async ({ data, req, operation }) => {
                const { user, payload } = req;
                if (isCreateOperation(operation) && isAuthor(user)) {
                    const authorRes = await payload.find({
                        collection: COLLECTION_SLUGS.AUTHORS,
                        where: { user: { equals: user!.id } },
                        limit: 1,
                    });

                    const author = authorRes.docs[0];
                    if (author) {
                        data.author = author.id; // автор автоматически устанавливается
                    }
                }

                return data;
            },

            // Генерируем уникальный slug
            async ({ data, originalDoc, req }) => {
                const { payload } = req;

                // Генерируем slug только если slug отсутствует или title изменился
                if (!data.slug || (data.title && data.title !== originalDoc?.title)) {
                    const baseSlug = slugify(data.title, {
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
                                collection: COLLECTION_SLUGS.PRODUCTS,
                                where: { slug: { equals: slug } },
                            })
                            .then((res) => res.totalDocs > 0)
                    ) {
                        slug = `${baseSlug}-${nanoid(6)}-${counter++}`;
                    }

                    data.slug = slug;
                }
                return data;
            },
        ],

        beforeDelete: [
            // Каскадная очистка накладных перед удалением товара
            async ({ req, id }) => {
                const { payload } = req;

                const invoices = await payload.find({
                    collection: COLLECTION_SLUGS.INVOICES,
                    where: { 'items.product': { equals: id } },
                    limit: 10000,
                    depth: 0,
                    overrideAccess: true,
                });
                if (invoices.totalDocs === 0) return;

                await Promise.all(
                    invoices.docs.map((invoice) => {
                        const filteredItems = invoice.items.filter((item) => {
                            const productId = typeof item.product === 'object' ? item.product?.id : item.product;
                            return productId !== Number(id);
                        });

                        if (filteredItems.length === 0) {
                            // Удаляем накладную, если все товары были удалены
                            return payload.delete({
                                collection: COLLECTION_SLUGS.INVOICES,
                                id: invoice.id,
                                req,
                                overrideAccess: true,
                            });
                        }

                        return payload.update({
                            collection: COLLECTION_SLUGS.INVOICES,
                            id: invoice.id,
                            data: { items: filteredItems },
                            req,
                            overrideAccess: true,
                        });
                    }),
                );
            },
        ],
    },
};
