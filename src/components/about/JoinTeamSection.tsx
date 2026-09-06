'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function JoinTeamSection() {
    return (
        <section className="flex flex-col items-center gap-6 md:gap-8 lg:gap-10 relative">
            <h2 className="wrap text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight text-center">
                Дорогой автор, присоединяйся к нашей команде!
            </h2>

            <div className="w-full relative flex justify-center">
                <Image
                    src="/icons/author-icons.png"
                    alt="Authors icons"
                    width={1504}
                    height={64}
                    className="w-full h-auto object-contain max-h-fit"
                    priority
                />
            </div>

            <div className="wrap flex justify-center z-10">
                <Button size="lg" asChild className="w-full sm:w-auto">
                    <Link href="/questionnaire">Заполнить анкету</Link>
                </Button>
            </div>
        </section>
    );
}
