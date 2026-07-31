import { getPayload } from 'payload';

import config from '@/payload.config';
import { COLLECTION_SLUGS } from '@/shared/constants/constants';

import type {
    ChangedParsedOffers,
    ParsedOffer,
} from './getChangedDetailed';

export async function enrichNewProductsDiff(
    changes: ChangedParsedOffers[],
    offers: ParsedOffer[],
): Promise<ChangedParsedOffers[]> {
    console.log(`[enrich] start, ${changes.length} changes, ${offers.length} offers`);

    const payload = await getPayload({ config });

    const newIds = changes
        .filter((c) => c.type === 'new')
        .map((c) => c.id);

    console.log(`[enrich] ${newIds.length} new offers to check against existing products`);

    if (!newIds.length) {
        console.log(`[enrich] nothing to enrich, returning changes as-is`);
        return changes;
    }

    const products = await payload.find({
        collection: COLLECTION_SLUGS.PRODUCTS,
        where: {
            article1C: {
                in: newIds,
            },
        },
        limit: newIds.length,
    });

    console.log(`[enrich] found ${products.docs.length} matching products in DB (of ${newIds.length} requested)`);

    const productMap = new Map(
        products.docs.map((p) => [p.article1C!, p]),
    );

    const offerMap = new Map(
        offers.map((o) => [o.id, o]),
    );

    const result: ChangedParsedOffers[] = [...changes];

    let priceChanges = 0;
    let stockChanges = 0;
    let skippedMissing = 0;

    for (const id of newIds) {
        const product = productMap.get(id);
        const offer = offerMap.get(id);

        if (!product || !offer) {
            skippedMissing++;
            console.warn(`[enrich] skipping ${id}: ${!product ? 'no product in DB' : ''}${!product && !offer ? ', ' : ''}${!offer ? 'no matching offer' : ''}`);
            continue;
        }

        if ((product.price ?? 0) !== offer.price) {
            console.log(`[enrich] price changed for ${id}: ${product.price ?? 0} -> ${offer.price}`);
            priceChanges++;
            result.push({
                id,
                type: 'price',
                newValue: offer.price,
            });
        }

        if ((product.quantity ?? 0) !== offer.stock) {
            console.log(`[enrich] stock changed for ${id}: ${product.quantity ?? 0} -> ${offer.stock}`);
            stockChanges++;
            result.push({
                id,
                type: 'stock',
                newValue: offer.stock,
            });
        }
    }

    console.log(`[enrich] done: ${priceChanges} price changes, ${stockChanges} stock changes, ${skippedMissing} skipped, result size=${result.length}`);

    return result;
}