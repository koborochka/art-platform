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
    const payload = await getPayload({ config });

    const newIds = changes
        .filter((c) => c.type === 'new')
        .map((c) => c.id);

    if (!newIds.length) {
        return changes;
    }

    const products = await payload.find({
        collection: COLLECTION_SLUGS.PRODUCTS,
        where: {
            id: {
                in: newIds,
            },
        },
        limit: newIds.length,
    });

    const productMap = new Map(
        products.docs.map((p) => [p.article1C!, p]),
    );

    const offerMap = new Map(
        offers.map((o) => [o.id, o]),
    );

    const result: ChangedParsedOffers[] = [...changes];

    for (const id of newIds) {
        const product = productMap.get(id);
        const offer = offerMap.get(id);

        if (!product || !offer) {
            continue;
        }

        if ((product.price ?? 0) !== offer.price) {
            console.log(`new price: ${offer.price} for ${id}`);
            result.push({
                id,
                type: 'price',
                newValue: offer.price,
            });
        }

        if ((product.quantity ?? 0) !== offer.stock) {
            console.log(`new stock: ${offer.stock} for ${id}`);
            result.push({
                id,
                type: 'stock',
                newValue: offer.stock,
            });
        }
    }

    return result;
}