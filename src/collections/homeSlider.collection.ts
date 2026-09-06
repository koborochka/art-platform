// collections/HomeSlider.ts
import type { CollectionConfig } from 'payload';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { isAdmin } from '@/shared/utils/payload';

export const HomeSliderCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.HOME_SLIDER,
    labels: { singular: 'Слайд', plural: 'Слайды' },

    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'image'],
    },

    fields: [
        {
            name: 'title',
            type: 'text',
            label: 'Заголовок',
            required: true,
            admin: {
                description: 'Не отображается на сайте. Только в админке',
            },
        },
        {
            name: 'image',
            type: 'upload',
            label: 'Изображение',
            relationTo: COLLECTION_SLUGS.MEDIA,
            required: true,
        },
    ],

    access: {
        read: () => true,
        create: ({ req: { user } }) => !!user && isAdmin(user),
        update: ({ req: { user } }) => !!user && isAdmin(user),
        delete: ({ req: { user } }) => !!user && isAdmin(user),
    },
};
