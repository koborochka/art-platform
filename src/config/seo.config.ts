export const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://polki-minto.ru').replace(/\/$/, '').trim();

export const SITE_NAME = 'Минто';

export const SITE_TITLE = 'Минто — магазинчик авторского мерча';

export const SITE_DESCRIPTION =
    'Минто — магазин авторских товаров. Полки с уникальными изделиями от художников и мастеров. ' +
    'Купите что-то необычное или разместите собственные работы. Только оригинальное — только для тебя.';

// почти не влияют на ранжирование, короткий список на всякий случай
export const SITE_KEYWORDS = [
    'Минто',
    'авторский мерч',
    'авторские товары',
    'изделия ручной работы',
    'товары от художников и мастеров',
];

export const SITE_LOCALE = 'ru_RU';

export const OG_DEFAULT_IMAGE = {
    url: '/og/og-default.png',
    width: 1200,
    height: 630,
    alt: SITE_TITLE,
};

// Лого для Organization JSON-LD
export const ORGANIZATION_LOGO = '/logo.jpg';

// Соцсети для JSON-LD
export const SOCIAL_LINKS = {
    vk: 'https://vk.com/minto_ekb',
    telegram: 'https://t.me/minto_ekb',
};

export const REVALIDATE_TIME = 3600;
