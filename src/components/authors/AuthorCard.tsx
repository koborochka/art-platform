'use client';

import { useRef } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { PAGES } from '@/config/public-pages.config';
import { isImageData } from '@/shared/guards/image.guard';
import type { Author } from '@/shared/types/payload-types';
import type { Timer } from '@/shared/types/timer.type';
import { getQueryClient } from '@/shared/utils/get-query-client';
import { getAuthorQueryOptions } from '@/shared/utils/getDataQueryOptions';

export default function AuthorCard({ name, slug, avatar, priority = false }: Author & { priority?: boolean }) {
    const timerRef = useRef<Timer | null>(null);
    const queryClient = getQueryClient();

    return (
        <Card
            onMouseEnter={() =>
                (timerRef.current = setTimeout(() => {
                    queryClient.prefetchQuery(getAuthorQueryOptions({ slug: slug! }));
                }, 300))
            }
            onMouseLeave={() => timerRef.current && clearTimeout(timerRef.current)}
            className="p-0 hover:outline-4 hover:outline-[#D8F2F3] outline-0 outline-offset-0"
        >
            <Link href={PAGES.AUTHOR(slug!)} className="flex flex-col gap-3">
                <div className="flex flex-1 aspect-square relative items-center rounded-md overflow-hidden">
                    <Image
                        alt="Картинка"
                        src={isImageData(avatar) ? (avatar?.url ? avatar.url : '/placeholder.png') : '/placeholder.png'}
                        fill
                        sizes="(max-width: 1023px) 33vw, 16vw"
                        className="object-cover "
                        priority={priority}
                        loading={priority ? undefined : 'lazy'}
                    />
                </div>

                <CardContent className="flex flex-col gap-2 px-3 lg:px-4">
                    <CardTitle className="font-semibold hover:underline text-sm lg:text-lg">{name}</CardTitle>
                </CardContent>
            </Link>
        </Card>
    );
}
