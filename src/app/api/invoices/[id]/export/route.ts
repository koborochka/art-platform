import {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
    Header,
    HeightRule,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
} from 'docx';
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';

import config from '@/payload.config';
import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import type { IInvoiceItem } from '@/shared/types/invoice.interface';
import type { Product } from '@/shared/types/payload-types';

// Обертка для создания фрагментов текста
const t = (text: string | number, bold = false, size = 24, breakCount = 0) =>
    new TextRun({ text: String(text), size, bold, ...(breakCount ? { break: breakCount } : {}) });

// Универсальная ячейка
function createCell(content: string | number | TextRun[], align = AlignmentType.CENTER) {
    return new TableCell({
        children: [
            new Paragraph({
                children: Array.isArray(content) ? content : [t(content)],
                alignment: align,
            }),
        ],
        verticalAlign: 'center',
    });
}

function createDocumentTemplate(items: IInvoiceItem[]) {
    return new Document({
        creator: 'MINTO',
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 278,
                            left: 278,
                            bottom: 278,
                            right: 249,
                            header: 1134,
                            footer: 1134,
                        },
                    },
                },
                headers: {
                    default: new Header({ children: [] }),
                },
                footers: {
                    default: new Footer({ children: [] }),
                },
                children: [
                    // Первый абзац
                    new Paragraph({
                        children: [
                            t('Акт приема-передачи товара №', true),
                            t('____________'),
                            t(' от ', true),
                            t('_____________'),
                            t(' г.', true),
                        ],
                        spacing: { after: 200 },
                        alignment: AlignmentType.CENTER,
                    }),

                    // Второй абзац
                    new Paragraph({
                        children: [
                            t('Мы нижеподписавшиеся, со стороны ИП Кобелева А.А. и со стороны Клиента:'),
                            t('_______________________'),
                            t(' '),
                            t('_________________'),
                            t(' составили настоящий акт в том, что в соответствии с пунктом 1.1. договору комиссии №'),
                            t('____________'),
                            t(' от '),
                            t('__________'),
                            t('г.'),
                        ],
                        spacing: { before: 120, after: 400 },
                        alignment: AlignmentType.JUSTIFIED,
                    }),

                    // Таблица
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                            bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                            left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                            right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                        },
                        rows: [
                            // Заголовок таблицы
                            new TableRow({
                                children: [
                                    createCell('№ п.п'),
                                    createCell('Артикул'),
                                    createCell('Наименование товара'),
                                    createCell('Количество'),
                                    createCell([t('Новый /Старый/'), t('Переоценка (Н,С,П)', false, 24, 1)]),
                                    createCell('Цена комитента'),
                                    createCell('Цена продажи'),
                                ],
                            }),
                            // Строки с заполненными товарами
                            ...items.map((item) => {
                                const prod = item.product as Product;
                                return new TableRow({
                                    height: { value: 396, rule: HeightRule.EXACT },
                                    children: [
                                        createCell(item.orderNumber),
                                        createCell(prod.article1C || '000001'),
                                        createCell(prod.title),
                                        createCell(item.quantity),
                                        createCell(item.condition),
                                        createCell(item.price ?? 0),
                                        createCell(item.price ?? 0),
                                    ],
                                });
                            }),
                            // Пустые строки (22 штуки по шаблону)
                            ...Array(Math.max(0, 22 - items.length))
                                .fill(null)
                                .map(
                                    () =>
                                        new TableRow({
                                            height: { value: 396, rule: HeightRule.EXACT },
                                            children: Array(7)
                                                .fill(null)
                                                .map(() => createCell('')),
                                        }),
                                ),
                        ],
                    }),

                    // Третий абзац
                    new Paragraph({
                        children: [
                            t(
                                'На момент передачи товара последний по качеству и количеству соответствует условиям Договора, Стороны претензий друг к другу не имеют. Настоящий акт является неотъемлемой частью к договору комиссии №',
                            ),
                            t('____________'),
                            t(' от '),
                            t('__________'),
                            t(' г.'),
                        ],
                        spacing: { before: 120, after: 600 },
                        alignment: AlignmentType.JUSTIFIED,
                    }),

                    // Подписи
                    new Paragraph({
                        children: [
                            t('Комитент '),
                            t('________________________'),
                            t('                                       '), // 39 пробелов
                            t('Комиссионер '),
                            t('____________________________'),
                        ],
                        spacing: { before: 120 },
                        alignment: AlignmentType.LEFT,
                    }),
                    new Paragraph({
                        children: [
                            // Текст размера 16 (8pt)
                            t(
                                '                                              (подпись)                                                                                                                                                                    (подпись)',
                                false,
                                16,
                            ),
                        ],
                        alignment: AlignmentType.LEFT,
                    }),
                ],
            },
        ],
    });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: invoiceId } = await params;

        // Запросы напрямую в БД
        const payload = await getPayload({ config });

        const invoice = await payload.findByID({
            collection: COLLECTION_SLUGS.INVOICES,
            id: invoiceId,
            depth: 2, // чтобы получить автора и товары
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Накладная не найдена' }, { status: 404 });
        }

        const items = (invoice.items || []) as unknown as IInvoiceItem[];

        console.log('items', items);

        // Генерация DOCX
        const doc = createDocumentTemplate(items);

        const buffer = await Packer.toBuffer(doc);
        const uint8Array = new Uint8Array(buffer);

        return new NextResponse(uint8Array, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="MINTO_Invoice_${invoiceId}.docx"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            },
        });
    } catch (error) {
        console.error('Docx generation error:', error);
        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}
