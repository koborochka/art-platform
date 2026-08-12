import { getPayload } from 'payload';

import config from '@/payload.config';
import { COLLECTION_SLUGS } from '@/shared/constants/constants';

import type { ChangedParsedOffers } from './getChangedDetailed';

const FALLBACK_USER_EMAIL = process.env.FALLBACK_USER_EMAIL;

async function getFallbackAuthorId(
    payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<number> {
    if (!FALLBACK_USER_EMAIL) {
        throw new Error('FALLBACK_USER_EMAIL не задан в .env');
    }

    const userResult = await payload.find({
        collection: COLLECTION_SLUGS.USERS,
        where: { email: { equals: FALLBACK_USER_EMAIL } },
        limit: 1,
    });

    const user = userResult.docs[0];
    if (!user) {
        throw new Error(`Fallback user не найден по email: ${FALLBACK_USER_EMAIL}`);
    }

    const authorResult = await payload.find({
        collection: COLLECTION_SLUGS.AUTHORS,
        where: { user: { equals: user.id } },
        limit: 1,
    });

    const author = authorResult.docs[0];
    if (!author) {
        throw new Error(`Author не найден для fallback user id: ${user.id}`);
    }

    return author.id;
}

function buildTitle(id: string, title?: string): string {
    const clean = title?.trim();
    return clean ? `${clean} (${id})` : `Импорт ${id}`;
}

export async function syncProductsFromDiff(changes: ChangedParsedOffers[]) {
    console.log('=== SYNC PRODUCTS START ===');

    const payload = await getPayload({ config });

    const ids = Array.from(new Set(changes.map((c) => c.id)));

    const found = await payload.find({
        collection: COLLECTION_SLUGS.PRODUCTS,
        where: { article1C: { in: ids } },
        limit: ids.length,
    });

    // мутируется по ходу обработки — иначе дубликат id в одном
    // батче создаст товар дважды
    const existingMap = new Map(found.docs.map((p) => [p.article1C!, p]));

    let fallbackAuthorId: number | null = null;
    const resolveFallbackAuthorId = async () => {
        if (fallbackAuthorId === null) {
            fallbackAuthorId = await getFallbackAuthorId(payload);
        }
        return fallbackAuthorId;
    };

    for (const change of changes) {
        const { id, type, title } = change;

        try {
            const existing = existingMap.get(id);

            if (type === 'new') {
                if (existing) {
                    console.log(`= уже существует, пропуск создания: ${id}`);
                    continue;
                }

                const authorId = await resolveFallbackAuthorId();
                const finalTitle = buildTitle(id, title);

                const created = await payload.create({
                    collection: COLLECTION_SLUGS.PRODUCTS,
                    data: {
                        article1C: id,
                        title: finalTitle,
                        slug: `import-${id}`,
                        price: 0,
                        quantity: 0,
                        author: authorId,
                    },
                    draft: false,
                });

                // критично против дублей: сразу фиксируем как существующий
                existingMap.set(id, created);

                console.log(`+ новый товар: код=${id}, title="${finalTitle}"`);
                continue;
            }

            if (type === 'deleted') {
                if (!existing) {
                    console.log(`⚠ not found for delete: ${id}`);
                    continue;
                }
                if (existing.quantity === 0) {
                    console.log(`= skip (already 0) ${id}`);
                    continue;
                }
                await payload.update({
                    collection: COLLECTION_SLUGS.PRODUCTS,
                    id: existing.id,
                    data: { quantity: 0 },
                });
                existing.quantity = 0;
                console.log(`- deleted (qty→0) ${id}`);
                continue;
            }

            if (!existing) {
                console.log(`⚠ not found for update: ${id}`);
                continue;
            }

            const updateData: { price?: number; quantity?: number } = {};

            if (type === 'price' && typeof change.newValue === 'number' && change.newValue !== existing.price) {
                updateData.price = change.newValue;
            }

            if (type === 'stock' && typeof change.newValue === 'number' && change.newValue !== existing.quantity) {
                updateData.quantity = change.newValue;
            }

            if (Object.keys(updateData).length === 0) {
                console.log(`= no changes ${id} (${type})`);
                continue;
            }

            await payload.update({
                collection: COLLECTION_SLUGS.PRODUCTS,
                id: existing.id,
                data: updateData,
            });

            Object.assign(existing, updateData);
            console.log(`~ updated ${id} (${type}) ->`, updateData);
        } catch (err: unknown) {
            console.log(`✘ error ${id}: ${err instanceof Error ? err.message : 'unknown'}`);
        }
    }

    console.log('=== SYNC DONE ===');
}