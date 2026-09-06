import type { CollectionConfig } from 'payload';
import slugify from 'slugify';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { isAdmin } from '@/shared/utils/payload';

export const CategoriesCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.CATEGORIES,

    labels: {
        singular: 'Категория',
        plural: 'Категории',
    },

    admin: {
        useAsTitle: 'label',
        defaultColumns: ['label', 'value', 'createdAt'],
    },

    access: {
        read: () => true,
        create: ({ req }) => isAdmin(req.user),
        update: ({ req }) => isAdmin(req.user),
        delete: ({ req }) => isAdmin(req.user),
    },

    fields: [
        {
            name: 'label',
            type: 'text',
            label: 'Название категории',
            required: true,
            unique: true,
        },
        {
            name: 'value',
            type: 'text',
            label: 'Системное значение (латиница)',
            required: true,
            unique: true,

            admin: {
                hidden: true,
            },
        },
    ],

    hooks: {
        beforeChange: [
            async ({ data, originalDoc, req }) => {
                const { payload } = req;

                // Генерируем value если:
                // 1) его нет
                // 2) label изменился
                if (!data.value || data.label !== originalDoc?.label) {
                    const baseValue = slugify(data.label, {
                        lower: true,
                        strict: true,
                        locale: 'ru',
                    });

                    let value = baseValue;
                    let counter = 1;

                    // гарантируем уникальность
                    while (
                        await payload
                            .count({
                                collection: COLLECTION_SLUGS.CATEGORIES,
                                where: { value: { equals: value } },
                            })
                            .then((res) => res.totalDocs > 0)
                    ) {
                        value = `${baseValue}-${counter++}`;
                    }

                    data.value = value;
                }

                return data;
            },
        ],
    },

    timestamps: true,
};
