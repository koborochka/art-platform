import { type CollectionConfig } from 'payload';

import { createConsignmentReceipt1C } from '@/server-actions/createConsignmentReceipt';
import { createRevaluation1C } from '@/server-actions/createRevaluation';
import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { isProductData } from '@/shared/guards/product.guard';
import { INVOICE_ITEM_CONDITION } from '@/shared/types/invoice.interface';
import { isAdmin, isAuthor, isUpdateOperation } from '@/shared/utils/payload';

export const InvoicesCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.INVOICES,
    labels: { singular: 'Накладная', plural: 'Накладные' },
    admin: {
        useAsTitle: 'id',
        defaultColumns: ['id', 'author', 'createdAt'],
    },

    access: {
        read: async ({ req: { user, payload } }) => {
            if (!user) return false;
            if (isAdmin(user)) return true;
            // TODO: вынести метод и переиспользовать - является ли автором и владельцем - isAuthorOwner(user, payload)
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
        create: ({ req: { user } }) => isAdmin(user) || isAuthor(user),
        update: ({ req: { user } }) => isAdmin(user) || isAuthor(user),
        delete: ({ req: { user } }) => isAdmin(user),
    },

    fields: [
        {
            name: 'isConfirmed',
            type: 'checkbox',
            label: 'Подтвердить получение товаров',
            defaultValue: false,
            access: {
                update: ({ req: { user } }) => isAdmin(user),
            },
            admin: {
                position: 'sidebar',
                description: 'При установке галочки цена и количество товаров будут отображены на сайте',
            },
        },
        {
            name: 'author',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.AUTHORS,
            required: true,
            label: 'Автор',
        },
        {
            name: 'items',
            type: 'array',
            label: 'Товары',
            labels: {
                singular: 'Товар',
                plural: 'Товары',
            },
            required: true,
            fields: [
                {
                    name: 'orderNumber',
                    type: 'number',
                    label: '№ п.п.',
                    required: true,
                    admin: {
                        readOnly: true,
                    },
                },
                {
                    name: 'product',
                    type: 'relationship',
                    relationTo: COLLECTION_SLUGS.PRODUCTS,
                    required: true,
                    label: 'Товар',
                    admin: {
                        readOnly: true,
                    },
                },
                {
                    name: 'quantity',
                    type: 'number',
                    label: 'Количество',
                    required: true,
                    min: 1,
                },
                {
                    name: 'price',
                    type: 'number',
                    label: 'Цена',
                    required: true,
                },
                {
                    name: 'condition',
                    type: 'select',
                    label: 'Состояние',
                    required: true,
                    defaultValue: INVOICE_ITEM_CONDITION.NEW,
                    options: [
                        { label: 'Новый', value: INVOICE_ITEM_CONDITION.NEW },
                        { label: 'Старый', value: INVOICE_ITEM_CONDITION.OLD },
                        { label: 'Переоценка', value: INVOICE_ITEM_CONDITION.REVALUATION },
                    ],
                },
            ],
        },
    ],

    hooks: {
        afterChange: [
            async ({ doc, previousDoc, req, operation }) => {
                // Обработка после подтверждения накладной
                // количество обновляется со следующей выгрузкой
                if (isUpdateOperation(operation) && doc.isConfirmed && !previousDoc.isConfirmed) {
                    const authorId = typeof doc.author === 'object' ? doc.author.id : doc.author;

                    const resolveProduct = async (item: (typeof doc.items)[number]) => {
                        const productId = isProductData(item.product) ? item.product.id : item.product;

                        return req.payload.findByID({
                            collection: COLLECTION_SLUGS.PRODUCTS,
                            id: productId,
                            req,
                        });
                    };

                    const newItems = doc.items.filter(
                        (item: (typeof doc.items)[number]) => item.condition === INVOICE_ITEM_CONDITION.NEW,
                    );

                    const revaluationItems = doc.items.filter(
                        (item: (typeof doc.items)[number]) =>
                            item.condition === INVOICE_ITEM_CONDITION.REVALUATION,
                    );

                    if (newItems.length) {
                        const receiptItems = await Promise.all(
                            newItems.map(async (item: (typeof doc.items)[number]) => {
                                const product = await resolveProduct(item);

                                return {
                                    article1C: product.article1C,
                                    quantity: item.quantity,
                                    price: item.price,
                                };
                            }),
                        );

                        const result = await createConsignmentReceipt1C({
                            authorId,
                            items: receiptItems,
                        });

                        if (!result.success) {
                            throw new Error(result.error ?? 'Не удалось создать поступление в 1С');
                        }
                    }

                    if (revaluationItems.length) {
                        const revaluationPayload = await Promise.all(
                            revaluationItems.map(async (item: (typeof doc.items)[number]) => {
                                const product = await resolveProduct(item);

                                return {
                                    article1C: product.article1C,
                                    newPrice: item.price,
                                };
                            }),
                        );

                        const result = await createRevaluation1C({
                            items: revaluationPayload,
                        });

                        if (!result.success) {
                            throw new Error(result.error ?? 'Не удалось создать переоценку в 1С');
                        }
                    }
                }
                return doc;
            },
        ],
    },
};