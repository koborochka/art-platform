'use client';

import React from 'react';

import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { useFetchAuthor } from '@/shared/hooks/useFetchData';
import type { AuthorQueryParams, ProductsQueryParams } from '@/shared/types/query-params.type';

import { isImageData } from '../../shared/guards/image.guard';
import ProductsUI from '../products/ProductsUI';
import { HomeLoader } from '../shared/Skeleton';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export default function AuthorUI({
    initialParams,
    searchParams,
}: {
    initialParams: AuthorQueryParams;
    searchParams: ProductsQueryParams;
}) {
    const slug = initialParams.author;
    const { data, isError, error, isFetching } = useFetchAuthor({ slug });

    if (isError) {
        return <div>Error: {error.message}</div>;
    }
    if (isFetching) {
        return <HomeLoader />;
    }
    if (!data) {
        notFound();
    }

    const { name, avatar, bio, externalLink, cover } = data;

    return (
        <div className="relative">
            {cover && (
                <div className="absolute top-0 left-0 w-full h-30 z-0 overflow-hidden">
                    <Image
                        src={isImageData(cover) ? cover?.url || '' : ''}
                        alt="background"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}
            {/* mobile */}
            <div className="sm:hidden w-full h-13" />
            <Card className="relative z-10 flex flex-col sm:hidden w-[80%] p-4 mx-auto mb-8">
                <div className="relative flex flex-col items-center">
                    <Image
                        src={isImageData(avatar) ? avatar?.url || '/placeholder.png' : '/placeholder.png'}
                        alt="avatar"
                        width={72}
                        height={72}
                        className="rounded-full object-cover h-18 w-18 border-4 border-white z-10 absolute bottom-[90%]"
                    />
                    <div className="flex flex-col items-center gap-1 pt-8 text-center bg-white">
                        <h2 className="text-xl font-semibold">{name}</h2>
                        <p className="text-sm text-my-secondary">{bio}</p>
                        {externalLink && (
                            <Link href={externalLink} target="_blank" rel="noopener noreferrer">
                                <Button variant="secondary">
                                    Соцсеть автора <ExternalLink size={14} />
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </Card>

            {/* desktop */}
            <div className="hidden wrap sm:flex relative z-10 py-9 mb-12">
                <Image
                    src={isImageData(avatar) ? avatar?.url || '/placeholder.png' : '/placeholder.png'}
                    alt={'avatar'}
                    width={160}
                    height={160}
                    className="rounded-full object-cover h-40 w-40 border-6 border-white absolute"
                />
                <div className="h-fit flex gap-6 flex-1 items-center bg-white pl-4 pt-3 pr-4 pb-5 rounded-tr-xl mt-15 ml-39">
                    <div className="flex flex-col gap-2 flex-1">
                        <h2 className="text-3xl font-semibold">{name}</h2>
                        <p className="text-lg text-my-primary font-normal">{bio}</p>
                    </div>
                    {externalLink && (
                        <Link
                            href={externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-my-accent hover:underline transition-colors"
                        >
                            Соц-сети автора <ExternalLink size={24} />
                        </Link>
                    )}
                </div>
            </div>

            <ProductsUI initialParams={{ ...searchParams, authors: name! }} showAuthorFilter={false} />
        </div>
    );
}
