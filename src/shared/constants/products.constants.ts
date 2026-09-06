export const PRODUCTS_PER_PAGE = 24;

export const PRODUCTS_SORT_OPTIONS = [
    { value: 'default', label: 'По умолчанию' },
    { value: 'price', label: 'Сначала дешевле' },
    { value: '-price', label: 'Сначала дороже' },
    { value: '-created_at', label: 'От старых к новым' },
    { value: 'created_at', label: 'От новых к старым' },
] as const;

export const PRODUCT_CATEGORIES = [
    { value: 'shoppers', label: 'Шоперы' },
    { value: 'clothes', label: 'Одежда' },
    { value: 'trinkets', label: 'Брелоки' },
    { value: 'postcards', label: 'Открытки' },
    { value: 'ceramics', label: 'Керамика' },
    { value: 'stickers', label: 'Стикеры' },
    { value: 'knitted', label: 'Вязанные изделия' },
] as const;
