'use client';

import { ImageIcon, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';

import { Card } from '@/components/ui/card';
import { isImageData } from '@/shared/guards/image.guard';
import { useFetchCategories } from '@/shared/hooks/useFetchData';
import type { Product } from '@/shared/types/payload-types';

interface AuthorProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}

export function AuthorProductCard({ product, onEdit, onDelete }: AuthorProductCardProps) {
    const { data: categoriesData } = useFetchCategories();
    const categories = categoriesData?.docs || [];

    const firstImage = product.gallery?.[0]?.image;
    const thumbUrl = isImageData(firstImage) ? firstImage.url : null;

    const { title, description, article1C, price, quantity, category } = product;

    const categoryLabel =
        typeof category === 'object' && category !== null
            ? category.label
            : categories.find((c) => c.id === category)?.label || '—';

    const priceLabel = price ? `${price.toLocaleString('ru-RU')} ₽` : '—';
    const stockLabel = quantity != null ? `${quantity} шт` : '—';
    const articleLabel = article1C || '—';

    return (
        <Card className="p-0 overflow-hidden shadow-[0px_5px_30px_0px_#11182714] gap-0">
            <div className="hidden md:flex flex-row items-stretch">
                <div className="relative w-40 shrink-0 bg-gray-50 flex items-center justify-center self-stretch min-h-32">
                    {thumbUrl ? (
                        <Image src={thumbUrl} alt={title} fill unoptimized className="object-cover" sizes="160px" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-my-disabled py-6">
                            <ImageIcon className="h-7 w-7 mb-3" />
                            <span className="text-base">Нет фото</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 p-5 flex flex-col gap-6 min-w-0">
                    <div className="flex flex-col gap-2 min-w-0">
                        <h3 className="text-xl font-semibold text-my-primary truncate">{title}</h3>
                        <p className="text-base text-my-tertriary line-clamp-1">{description || 'Описание товара'}</p>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-auto">
                        <InfoField label="Категория" value={categoryLabel} />
                        <InfoField label="Цена" value={priceLabel} />
                        <InfoField label="Остаток" value={stockLabel} />
                        <InfoField label="Артикул 1С" value={articleLabel} />
                    </div>
                </div>

                <CardActions product={product} onEdit={onEdit} onDelete={onDelete} />
            </div>

            <div className="flex md:hidden flex-col">
                <div className="grid grid-cols-[auto_1fr] items-start gap-3 p-3">
                    <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                        {thumbUrl ? (
                            <Image src={thumbUrl} alt={title} fill unoptimized className="object-cover" sizes="80px" />
                        ) : (
                            <ImageIcon className="h-6 w-6 text-my-disabled" />
                        )}
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-base font-semibold text-my-primary line-clamp-2">{title}</h3>
                        <p className="mt-[0.5rem] text-sm text-my-tertriary line-clamp-2">
                            {description || 'Описание товара'}
                        </p>
                        <div className="mt-[1rem] flex flex-col gap-[0.75rem]">
                            <InfoRow label="Остаток" value={stockLabel} />
                            <InfoRow label="Цена" value={priceLabel} />
                            <InfoRow label="Артикул 1С" value={articleLabel} />
                            <InfoRow label="Категория" value={categoryLabel} />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200" />

                <div className="flex justify-end gap-4 p-3">
                    <button
                        type="button"
                        onClick={() => onEdit(product)}
                        aria-label="Редактировать"
                        className="w-9 h-9 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-my-primary transition-colors cursor-pointer"
                    >
                        <Pencil className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(product)}
                        aria-label="Удалить"
                        className="w-9 h-9 flex items-center justify-center rounded-md bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
                    >
                        <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </Card>
    );
}

// Десктоп - колонка справа с кнопками
function CardActions({
    product,
    onEdit,
    onDelete,
}: {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}) {
    return (
        <div className="flex flex-col items-center justify-between p-4 gap-2 shrink-0 border-l border-gray-100">
            <button
                type="button"
                onClick={() => onEdit(product)}
                aria-label="Редактировать"
                className="w-9 h-9 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-my-primary transition-colors cursor-pointer"
            >
                <Pencil className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
                type="button"
                onClick={() => onDelete(product)}
                aria-label="Удалить"
                className="w-9 h-9 flex items-center justify-center rounded-md bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
            >
                <Trash2 className="w-5 h-5" strokeWidth={1.5} />
            </button>
        </div>
    );
}

// Десктоп - лейбл сверху, значение снизу
function InfoField({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-2 min-w-0">
            <span className="text-base text-my-tertriary">{label}</span>
            <span className="text-base font-semibold text-my-primary truncate">{value}</span>
        </div>
    );
}

// Мобилка - лейбл слева, значение справа
function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-my-tertriary shrink-0">{label}</span>
            <span className="text-sm font-semibold text-my-primary text-right truncate">{value}</span>
        </div>
    );
}
