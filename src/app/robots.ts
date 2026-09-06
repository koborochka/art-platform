import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/config/seo.config';

// Боты, которым закрываем сайт целиком
const BLOCKED_BOTS = [
    'AhrefsBot',
    'SemrushBot',
    'MJ12bot',
    'DotBot',
    'Bytespider',
    'DataForSeoBot',
    'magpie-crawler',
    'GPTBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-Web',
    'Claude-User',
    'anthropic-ai',
    'Google-Extended',
    'CCBot',
    'PerplexityBot',
    'Amazonbot',
    'Applebot-Extended',
    'cohere-ai',
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/api/webhooks/yookassa'],
                disallow: [
                    '/admin/',
                    '/api/',
                    '/graphql',
                    '/api/graphql',
                    '/login',
                    '/register',
                    '/profile',
                    '/cart',
                    '/order',
                    '/*.json$',
                    '/*.sql$',
                ],
            },
            ...BLOCKED_BOTS.map((userAgent) => ({ userAgent, disallow: '/' })),
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
