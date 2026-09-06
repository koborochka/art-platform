'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { Download, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiUrl } from '@/services/api/api-url-builder';
import { authorClientService } from '@/services/api/client/author-client.service';
import { isImageData } from '@/shared/guards/image.guard';
import {
    type AuthorInvoiceManagerProps,
    type IInvoiceItemKey,
    INVOICE_ITEM_CONDITION,
    type InvoiceItemWithProduct,
} from '@/shared/types/invoice.interface';
import type { Invoice, Product } from '@/shared/types/payload-types';
import { cn } from '@/shared/utils/tailwind';

const INVOICE_FIELDS = {
    QUANTITY: 'quantity',
    PRICE: 'price',
    CONDITION: 'condition',
} as const;

const CONDITION_LABELS = {
    [INVOICE_ITEM_CONDITION.NEW]: 'Новый (Н)',
    [INVOICE_ITEM_CONDITION.OLD]: 'Старый (С)',
    [INVOICE_ITEM_CONDITION.REVALUATION]: 'Переоценка (П)',
};

const CONDITIONS_WITH_PRICE = [INVOICE_ITEM_CONDITION.OLD, INVOICE_ITEM_CONDITION.REVALUATION];
const CONDITIONS_WITHOUT_PRICE = [INVOICE_ITEM_CONDITION.NEW];

const SELECT_TRIGGER_CLASS =
    'h-auto py-2 w-full flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-transparent px-2 text-sm md:text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-100 disabled:text-my-primary disabled:bg-gray-50';

const INPUT_CELL_CLASS =
    'h-auto py-2 px-2 border-gray-200 text-sm md:text-base bg-transparent disabled:cursor-not-allowed disabled:opacity-100 disabled:text-my-primary disabled:bg-gray-50';

// soft deleted
function isProductPopulated(product: Product | number | null | undefined): product is Product {
    return typeof product === 'object' && product !== null && typeof product.title === 'string';
}

function mapInvoiceItems(latestInvoice: Invoice | null): InvoiceItemWithProduct[] {
    if (!latestInvoice) return [];

    return latestInvoice.items
        .filter((item): item is typeof item & { product: Product } => isProductPopulated(item.product))
        .map((item) => ({
            orderNumber: item.orderNumber,
            product: item.product,
            quantity: item.quantity,
            price: item.price ?? item.product.price ?? 0,
            condition: item.condition,
        }));
}

function getInvoiceRowMeta(item: InvoiceItemWithProduct, errors?: { quantity?: boolean; price?: boolean }) {
    const hasInitialPrice = (item.product.price ?? 0) > 0;
    const baseConditions = hasInitialPrice ? CONDITIONS_WITH_PRICE : CONDITIONS_WITHOUT_PRICE;

    const conditionsToShow = (baseConditions as string[]).includes(item.condition)
        ? baseConditions
        : [item.condition, ...baseConditions];

    return {
        hasInitialPrice,
        isPriceDisabled: item.condition === INVOICE_ITEM_CONDITION.OLD,
        isQuantityDisabled: item.condition === INVOICE_ITEM_CONDITION.REVALUATION,
        errors: errors || {},
        conditionsToShow,
    };
}

// Форматирует id накладной в строку вида "invoice-002" для отображения в диалоге
function formatInvoiceName(id: number | null): string {
    if (!id) return 'накладную';
    return `invoice-${String(id).padStart(3, '0')}`;
}

const MOBILE_ICON_BTN =
    'w-10 h-10 flex items-center justify-center rounded-md bg-my-button-secondary-disabled text-my-secondary transition-opacity cursor-pointer hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed shrink-0';

export default function AuthorInvoiceManager({ authorId, products, latestInvoice }: AuthorInvoiceManagerProps) {
    const router = useRouter();

    const [invoiceItems, setInvoiceItems] = useState<InvoiceItemWithProduct[]>(() => mapInvoiceItems(latestInvoice));
    const [savedInvoiceId, setSavedInvoiceId] = useState<number | null>(latestInvoice?.id || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<number, { quantity?: boolean; price?: boolean }>>(
        {},
    );

    // Диалог подтверждения удаления накладной
    const [isDeleteInvoiceOpen, setIsDeleteInvoiceOpen] = useState(false);

    useEffect(() => {
        if (!latestInvoice) return;

        setInvoiceItems(mapInvoiceItems(latestInvoice));
        setSavedInvoiceId(latestInvoice.id);
    }, [latestInvoice]);

    const availableProducts = useMemo(() => {
        const addedIds = new Set(invoiceItems.map((item) => item.product.id));

        return products.filter((product) => !addedIds.has(product.id));
    }, [products, invoiceItems]);

    const productsByTitle = useMemo(
        () => new Map(availableProducts.map((product) => [product.title, product])),
        [availableProducts],
    );

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    const resetFeedbackState = () => {
        clearMessages();
        setValidationErrors({});
    };

    const handleValueChange = (title: string | null) => {
        if (!title) return;

        const product = productsByTitle.get(title);
        if (!product) return;

        const hasPrice = (product.price ?? 0) > 0;

        const newItem: InvoiceItemWithProduct = {
            orderNumber: invoiceItems.length + 1,
            product,
            quantity: 0,
            condition: hasPrice ? INVOICE_ITEM_CONDITION.OLD : INVOICE_ITEM_CONDITION.NEW,
            price: product.price ?? 0,
        };

        setInvoiceItems((prev) => [...prev, newItem]);

        resetFeedbackState();
    };

    const handleRemoveItem = (productId: number) => {
        setInvoiceItems((prev) => prev.filter((item) => item.product.id !== productId));

        resetFeedbackState();
    };

    const handleItemChange = (productId: number, field: IInvoiceItemKey, value: string | number) => {
        setInvoiceItems((prev) =>
            prev.map((item) => {
                if (item.product.id !== productId) {
                    return item;
                }

                const updatedItem = {
                    ...item,
                    [field]: value,
                };

                if (field !== INVOICE_FIELDS.CONDITION) {
                    return updatedItem;
                }

                if (value === INVOICE_ITEM_CONDITION.REVALUATION) {
                    updatedItem.quantity = item.product.quantity || 0;
                }

                if (value === INVOICE_ITEM_CONDITION.OLD) {
                    updatedItem.price = item.product.price || 0;
                }

                return updatedItem;
            }),
        );

        clearMessages();

        setValidationErrors((prev) => {
            const newErrors = { ...prev };
            const currentErrors = newErrors[productId];
            if (!currentErrors) {
                return newErrors;
            }

            delete currentErrors[field as 'quantity' | 'price'];

            if (Object.keys(currentErrors).length === 0) {
                delete newErrors[productId];
            }

            return newErrors;
        });
    };

    const handleSaveInvoice = async () => {
        if (invoiceItems.length === 0) {
            setError('Добавьте товар');
            return;
        }

        const errors: Record<number, { quantity?: boolean; price?: boolean }> = {};

        invoiceItems.forEach((item, index) => {
            const itemErrors: { quantity?: boolean; price?: boolean } = {};

            if (!item.quantity || item.quantity < 1) {
                itemErrors.quantity = true;
            }

            if (!item.price || item.price < 1) {
                itemErrors.price = true;
            }

            if (Object.keys(itemErrors).length > 0) {
                errors[index] = itemErrors;
            }
        });

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setError('Заполните обязательные поля');
            return;
        }

        setValidationErrors({});
        setLoading(true);
        clearMessages();

        try {
            // Пересчёт номеров
            // Иначе, если автор добавит 3 товара, удалит 2-й и добавит новый, порядковые номера собьются (1,3,3)
            const itemsToSave = invoiceItems.map((item, index) => ({
                ...item,
                orderNumber: index + 1,
            }));

            const result = savedInvoiceId
                ? await authorClientService.updateInvoice(savedInvoiceId, itemsToSave)
                : await authorClientService.saveInvoice(authorId, itemsToSave);

            if (result.success && result.invoice) {
                setSuccess('Накладная успешно сохранена');
                setSavedInvoiceId(result.invoice.id);

                router.refresh();
            } else {
                setError(result.error || 'Ошибка сохранения');
            }
        } catch (err) {
            console.error('Save Invoice Error:', err instanceof Error ? err.message : err);
            setError('Системная ошибка при сохранении');
        } finally {
            setLoading(false);
        }
    };

    const handleClearAll = () => {
        setInvoiceItems([]);
        setSavedInvoiceId(null);
        setValidationErrors({});
        setIsDeleteInvoiceOpen(false);
        clearMessages();
    };

    const handleDownload = () => {
        if (!savedInvoiceId) return;

        router.replace(apiUrl.invoice.export(savedInvoiceId));
    };

    return (
        <div className="flex flex-col gap-0 md:gap-8">
            <div className="md:hidden">
                <h1 className="text-xl font-semibold">Накладная</h1>

                <div className="mt-[1rem] flex items-center gap-[15px]">
                    <button
                        type="button"
                        aria-label="Удалить накладную"
                        onClick={() => setIsDeleteInvoiceOpen(true)}
                        className={MOBILE_ICON_BTN}
                    >
                        <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                    </button>

                    <button
                        type="button"
                        aria-label="Скачать накладную"
                        onClick={handleDownload}
                        disabled={!savedInvoiceId}
                        className={MOBILE_ICON_BTN}
                    >
                        <Download className="w-5 h-5" strokeWidth={1.5} />
                    </button>

                    <Button
                        onClick={handleSaveInvoice}
                        disabled={loading}
                        className="w-auto text-[0.875rem] font-semibold h-10 px-4"
                    >
                        {loading ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </div>
            </div>

            <h1 className="hidden md:block text-3xl font-semibold">Накладная</h1>

            <div className="mt-[1.5rem] md:mt-0 flex flex-col gap-[1.5rem] md:gap-4">
                <Combobox items={availableProducts.map((product) => product.title)} onValueChange={handleValueChange}>
                    <div className="relative w-full">
                        <ComboboxInput placeholder="Найти товар по названию или артикулу" />

                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-my-primary pointer-events-none" />
                    </div>

                    <ComboboxContent className="p-3">
                        <ComboboxEmpty>Товары не найдены</ComboboxEmpty>

                        <ComboboxList>
                            {(title: string) => {
                                const product = productsByTitle.get(title);

                                if (!product) return null;

                                return <ProductComboboxItem key={product.id} product={product} />;
                            }}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>

                {invoiceItems.length === 0 ? (
                    <div className="rounded-xl bg-gray-50 py-10 px-6 text-center">
                        <p className="text-base text-my-secondary">
                            В накладной пока нет товаров. Используйте поиск выше, чтобы добавить их.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-md border border-gray-200 overflow-x-auto">
                        <Table className="min-w-[720px] [font-family:'Wix_Madefor_Display',sans-serif] text-sm md:text-base leading-relaxed font-medium font-medium tracking-[0px] [font-variant-numeric:lining-nums_tabular-nums_stacked-fractions]">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-gray-200">
                                    <TableHead className="w-12 text-my-primary font-medium py-4 pr-2 pl-3">№</TableHead>

                                    <TableHead className="w-32 text-my-primary font-medium py-4 px-2">
                                        Артикул
                                    </TableHead>

                                    <TableHead className="text-my-primary font-medium py-4 px-2">
                                        Наименование
                                    </TableHead>

                                    <TableHead className="w-32 text-my-primary font-medium py-4 px-2">
                                        Количество
                                    </TableHead>

                                    <TableHead className="w-44 text-my-primary font-medium py-4 px-2">
                                        Состояние
                                    </TableHead>

                                    <TableHead className="w-32 text-my-primary font-medium py-4 px-2">Цена</TableHead>

                                    <TableHead className="w-12 py-4 px-2" />
                                </TableRow>
                            </TableHeader>

                            <TableBody className="[&_tr:last-child]:border-0">
                                {invoiceItems.map((item, index) => {
                                    const meta = getInvoiceRowMeta(item, validationErrors[index]);

                                    return (
                                        <TableRow
                                            key={item.product.id}
                                            className="hover:bg-transparent border-b border-gray-200"
                                        >
                                            <TableCell className="py-5 pr-2 pl-3 text-my-primary">
                                                {index + 1}
                                            </TableCell>

                                            <TableCell className="py-5 px-2 text-my-primary">
                                                {item.product.article1C || '—'}
                                            </TableCell>

                                            <TableCell className="py-5 px-2 text-my-primary font-medium">
                                                {item.product.title}
                                            </TableCell>

                                            <TableCell className="py-3 px-2">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={item.quantity}
                                                    disabled={meta.isQuantityDisabled}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            item.product.id,
                                                            INVOICE_FIELDS.QUANTITY,
                                                            parseInt(e.target.value, 10) || 0,
                                                        )
                                                    }
                                                    className={cn(
                                                        INPUT_CELL_CLASS,
                                                        meta.errors.quantity &&
                                                            'border-red-300 focus-visible:ring-red-100',
                                                    )}
                                                />
                                            </TableCell>

                                            <TableCell className="py-3 px-2">
                                                <Select
                                                    value={item.condition}
                                                    disabled={!meta.hasInitialPrice}
                                                    onValueChange={(value) =>
                                                        handleItemChange(
                                                            item.product.id,
                                                            INVOICE_FIELDS.CONDITION,
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                                                        <SelectValue />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        {meta.conditionsToShow.map((condition) => (
                                                            <SelectItem key={condition} value={condition}>
                                                                {CONDITION_LABELS[condition]}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>

                                            <TableCell className="py-3 px-2">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={item.price ?? 0}
                                                    disabled={meta.isPriceDisabled}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            item.product.id,
                                                            INVOICE_FIELDS.PRICE,
                                                            parseFloat(e.target.value) || 0,
                                                        )
                                                    }
                                                    className={cn(
                                                        INPUT_CELL_CLASS,
                                                        meta.errors.price &&
                                                            'border-red-300 focus-visible:ring-red-100',
                                                    )}
                                                />
                                            </TableCell>

                                            <TableCell className="py-3 px-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(item.product.id)}
                                                    aria-label="Удалить товар из накладной"
                                                    className="w-10 h-10 flex items-center justify-center rounded-md bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-6 h-6" strokeWidth={1.5} />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {error && (
                <Alert variant="destructive" className="mt-4 md:mt-0">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="bg-green-50 border-green-200 text-green-800 mt-4 md:mt-0">
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            {invoiceItems.length > 0 && (
                <div className="hidden md:flex md:flex-row md:flex-wrap md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <Button onClick={handleSaveInvoice} disabled={loading}>
                            {loading ? 'Сохранение...' : 'Сохранить'}
                        </Button>

                        <Button
                            variant="secondary"
                            className="font-semibold"
                            onClick={handleDownload}
                            disabled={!savedInvoiceId}
                        >
                            Скачать
                        </Button>
                    </div>

                    <Button
                        type="button"
                        onClick={() => setIsDeleteInvoiceOpen(true)}
                        className="bg-gray-200 hover:bg-gray-200 text-my-secondary font-semibold pl-2"
                    >
                        <Trash2 className="!size-6" strokeWidth={1.5} />
                        Очистить все
                    </Button>
                </div>
            )}

            <ConfirmDeleteDialog
                isOpen={isDeleteInvoiceOpen}
                onClose={() => setIsDeleteInvoiceOpen(false)}
                onConfirm={handleClearAll}
                title="Удаление накладной"
                description={
                    <>
                        Вы действительно хотите удалить накладную{' '}
                        <span className="font-semibold">{formatInvoiceName(savedInvoiceId)}</span>? Отменить данное
                        действие будет невозможно.
                    </>
                }
                confirmLabel="Удалить"
                loadingLabel="Удаление..."
                loading={loading}
            />
        </div>
    );
}

function ProductComboboxItem({ product }: { product: Product }) {
    const image = product.gallery?.[0]?.image;
    const imageUrl = isImageData(image) ? image.url : null;

    return (
        <ComboboxItem value={product.title}>
            <div className="flex w-full items-center justify-between rounded-md p-1 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-md overflow-hidden bg-gray-200">
                        {imageUrl && <Image src={imageUrl} alt="" fill unoptimized className="object-cover" />}
                    </div>

                    <span className="font-semibold text-my-primary truncate">{product.title}</span>
                </div>

                <span className="text-my-tertriary tabular-nums">{product.article1C || '—'}</span>
            </div>
        </ComboboxItem>
    );
}
