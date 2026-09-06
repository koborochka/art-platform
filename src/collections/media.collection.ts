// collections/Media.ts
import type { CollectionConfig } from 'payload';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { isAdmin, isAuthor } from '@/shared/utils/payload';

export const MediaCollection: CollectionConfig = {
    slug: COLLECTION_SLUGS.MEDIA,
    labels: { singular: 'Изображение', plural: 'Изображения' },

    upload: {
        mimeTypes: ['image/*'],
        imageSizes: [
            { name: 'thumbnail', width: 300, height: 300, position: 'centre' },
            { name: 'medium', width: 800 },
            { name: 'og', width: 1200, height: 1200, position: 'centre' },
        ],
        adminThumbnail: 'thumbnail',
    },

    admin: {
        useAsTitle: 'filename',
    },
    fields: [
        {
            name: 'filename',
            type: 'text',
            label: 'Название файла',
        },
        {
            name: 'url',
            type: 'text',
            label: 'URL-адрес',
        },
        {
            name: 'createdAt',
            type: 'date',
            label: 'Дата создания файла',
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
            label: 'Дата последнего обновления файла',
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
        read: () => true,

        // Загружать, обновлять и удалять медиа-файлы могут только админы и авторы
        create: async ({ req: { user } }) => {
            if (!user) return false;

            if (isAdmin(user) || isAuthor(user)) return true;

            return false;
        },

        update: async ({ req: { user } }) => {
            if (!user) return false;

            if (isAdmin(user) || isAuthor(user)) return true;

            return false;
        },

        delete: async ({ req: { user } }) => {
            if (!user) return false;

            if (isAdmin(user) || isAuthor(user)) return true;

            return false;
        },
    },

    hooks: {
        beforeOperation: [
            ({ req, operation }) => {
                if (operation !== 'create') return;

                const file = req.file;
                if (!file?.name) return;

                file.name = sanitizeFilename(file.name);
            },
        ],
    },
};

function sanitizeFilename(name: string): string {
    const lastDot = name.lastIndexOf('.');
    const ext = lastDot >= 0 ? name.slice(lastDot) : '';
    const base = lastDot >= 0 ? name.slice(0, lastDot) : name;

    const cleanBase = base
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();

    return `${cleanBase || 'file'}${ext.toLowerCase()}`;
}
