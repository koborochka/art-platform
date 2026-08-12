import { XMLParser } from 'fast-xml-parser';

export type ParsedOffer = {
    id: string;
    price: number;
    stock: number;
    title: string;
};

export type ChangedOfferType = 'price' | 'stock' | 'new' | 'deleted';

export type ChangedParsedOffers = {
    id: string;
    type: ChangedOfferType;
    newValue?: number;
    title?: string;
};

export function getChangedDetailed(prev: ParsedOffer[], next: ParsedOffer[]): ChangedParsedOffers[] {
    const prevMap = new Map<string, ParsedOffer>();
    const nextMap = new Map<string, ParsedOffer>();
 //   console.log("prevMap : "+ prevMap)
  //  console.log("nextMap : "+ nextMap)
    for (const item of prev) {
        prevMap.set(String(item.id), item);
    }

    for (const item of next) {
        nextMap.set(String(item.id), item);
    }

    const changes: ChangedParsedOffers[] = [];

    // 1. Новые + изменённые
    for (const [id, nextItem] of nextMap) {
        const prevItem = prevMap.get(id);

        // новый товар
        if (!prevItem) {
            changes.push({ id, type: 'new', title: nextItem.title });
            continue;
        }

        const priceChanged = prevItem.price !== nextItem.price;
        const stockChanged = prevItem.stock !== nextItem.stock;

        if (priceChanged) {
            changes.push({ id, type: 'price', newValue: nextItem.price });
        }

        if (stockChanged) {
            changes.push({ id, type: 'stock', newValue: nextItem.stock });
        }
    }

    // 2. Удалённые
    for (const id of prevMap.keys()) {
        if (!nextMap.has(id)) {
            changes.push({ id, type: 'deleted' });
        }
    }

    return changes;
}

type RawPrice = {
    ЦенаЗаЕдиницу?: string | number;
};

type RawOffer = {
    Артикул?: string | number;
    Наименование?: string;
    Количество?: string | number;
    Цены?: {
        Цена?: RawPrice | RawPrice[];
    };
};

type RawXml = {
    КоммерческаяИнформация?: {
        ПакетПредложений?: {
            Предложения?: {
                Предложение?: RawOffer | RawOffer[];
            };
        };
    };
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

export function parseOffersXml(xmlRaw: string): ParsedOffer[] {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        parseTagValue: false,
        trimValues: true,
    });

    const parsed: unknown = parser.parse(xmlRaw);

    if (!isRecord(parsed)) {
        throw new Error('XML не распарсился в объект');
    }

    const root = parsed as RawXml;
    const offers = root.КоммерческаяИнформация?.ПакетПредложений?.Предложения?.Предложение;

    if (!offers) {
        throw new Error('В XML не найдены предложения');
    }

    const offersArray: RawOffer[] = Array.isArray(offers) ? offers : [offers];

    return offersArray.map((offer): ParsedOffer => {
        const priceNode = offer.Цены?.Цена;
        const priceVal = Array.isArray(priceNode) ? priceNode[0]?.ЦенаЗаЕдиницу : priceNode?.ЦенаЗаЕдиницу;

        return {
            id: String(offer.Артикул ?? ''),
            title: String(offer.Наименование ?? ''),
            price: Number(priceVal ?? 0),
            stock: Number(offer.Количество ?? 0),
        };
    });
}
