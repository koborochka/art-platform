import { getPayload } from 'payload';

import config from '@/payload.config';
import { COLLECTION_SLUGS } from '@/shared/constants/constants';

import type { ChangedParsedOffers } from './getChangedDetailed';

export async function syncProductsFromDiff(changes: ChangedParsedOffers[]) {
    console.log('=== SYNC PRODUCTS START ===');

    const payload = await getPayload({ config });

    // Батчевый поиск всех затронутых товаров за один запрос
    const ids = changes.map((c) => c.id);

    const found = await payload.find({
        collection: COLLECTION_SLUGS.PRODUCTS,
        where: {
            article1C: {
                in: ids,
            },
        },
        limit: ids.length,
    });

    const existingMap = new Map(found.docs.map((p) => [p.article1C!, p]));

    for (const change of changes) {
        const { id, type } = change;

        try {
            const existing = existingMap.get(id);

            if (type === 'new') {
                if (existing) {
                   // console.log(`⚠ already exists: ${id}`);
                    continue;
                }

                // TODO: создание товара в лк автора. Создается номенклатура в 1с,
                // код номенклатуры прокидывается на сайт и тут тоже создается экземпляр
                // по сути, ситуации ниже быть не должно вообще.
                // тк сразу создаем в артиклем продукт и потом просто обновляем цен и количество

                // await payload.create({
                //     collection: COLLECTION_SLUGS.PRODUCTS,
                //     data: {
                //         article1C: id,
                //         title: `Импорт ${id}`,
                //         price: 0,
                //         quantity: 0,
                //     },
                //     draft: false,
                // });

                console.log(`Новый товар: код:${id}. Это услуга`);
                continue;
            }

            if (type === 'deleted') {
                if (!existing) {
                    console.log(`⚠ not found for delete: ${id}`);
                    continue;
                }

                await payload.update({
                    collection: COLLECTION_SLUGS.PRODUCTS,
                    id: existing.id,
                    data: { quantity: 0 }
                });

                console.log(`- deleted ${id}`);
                continue;
            }

            if (!existing) {
                console.log(`⚠ not found for update: ${id}`);
                continue;
            }

            const updateData: { price?: number; quantity?: number } = {};

            if (type === 'price') updateData.price = change.newValue;
            if (type === 'stock') updateData.quantity = change.newValue;

            await payload.update({
                collection: COLLECTION_SLUGS.PRODUCTS,
                id: existing.id,
                data: updateData,
            });

            console.log(`~ updated ${id} (${type})`);
        } catch (err: unknown) {
            console.log(`✘ error ${id}: ${err instanceof Error ? err.message : 'unknown'}`);
        }
    }

    console.log('=== SYNC DONE ===');
}
