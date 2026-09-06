import type { CollectionConfig } from 'payload';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { isAdmin, isCustomer } from '@/shared/utils/payload';

export const CartsCollection: CollectionConfig = {
    slug: 'carts',
    admin: {
        hidden: true,
    },

    fields: [
        {
            name: 'owner',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.CUSTOMERS,
            required: true,
        },
        {
            name: 'items',
            type: 'array',
            fields: [
                { name: 'product', type: 'relationship', relationTo: COLLECTION_SLUGS.PRODUCTS, required: true },
                { name: 'quantity', type: 'number', required: true, defaultValue: 1 },
                { name: 'checked', type: 'checkbox', defaultValue: true },
            ],
        },
    ],

    access: {
        read: ({ req: { user } }) => {
            if (!user) return false;
            if (isAdmin(user)) return true;

            // Покупатели видят только свою корзину
            if (isCustomer(user)) {
                return {
                    owner: { equals: user.id },
                };
            }

            return false;
        },

        // Только админы могут создавать корзины
        create: ({ req: { user } }) => isAdmin(user),

        update: ({ req: { user } }) => {
            if (!user) return false;
            if (isAdmin(user)) return true;

            // Покупатели могут обновлять только свою корзину
            if (isCustomer(user)) {
                return {
                    owner: { equals: user.id },
                };
            }

            return false;
        },

        delete: ({ req: { user } }) => isAdmin(user),
    },
};
