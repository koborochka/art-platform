'use client';

import React, { useRef } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Slider from 'react-slick';

import type { Media } from '@/shared/types/payload-types';

type Props = {
    gallery: Media[];
};

export default function ProductSlider({ gallery }: Props) {
    const mainSlider = useRef<Slider | null>(null);
    const thumbSlider = useRef<Slider | null>(null);

    if (!gallery?.length)
        return (
            <div className="relative w-full aspect-square">
                <div className="relative w-full h-full overflow-hidden rounded-lg bg-gray-100">
                    <Image
                        src="/placeholder.png"
                        alt="Placeholder"
                        fill
                        sizes="(max-width: 767px) 100vw, 55vw"
                        className="object-cover"
                    />
                </div>
            </div>
        );

    const mainSettings = {
        asNavFor: thumbSlider.current as Slider | undefined,
        arrows: false,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        speed: 0,
    };

    const thumbSettings = {
        asNavFor: mainSlider.current as Slider | undefined,
        slidesToShow: 5,
        slidesToScroll: 1,
        vertical: true,
        focusOnSelect: true,
        arrows: false,
        infinite: true,
        draggable: true,
        speed: 400,
    };

    return (
        <div className="flex gap-3 md:gap-5 h-full">
            {/* Миниатюры — скрываем на мобильных */}
            <div className="hidden md:flex w-20 lg:w-24 shrink-0">
                <Slider ref={thumbSlider} {...thumbSettings} className="w-full">
                    {gallery.map((img) => (
                        <div key={img.id} className="px-0 py-1.5 md:py-3 outline-none">
                            <div className="relative w-20 h-20 lg:w-24 lg:h-24 overflow-hidden rounded-lg cursor-pointer">
                                <Image
                                    src={img.url!}
                                    alt={img.filename ?? ''}
                                    fill
                                    sizes="96px"
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>

            {/* Основной слайдер */}
            <div className="relative flex-1 pt-3 min-w-0">
                <Slider ref={mainSlider} {...mainSettings}>
                    {gallery.map((img, index) => (
                        <div key={img.id}>
                            <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                                <Image
                                    src={img.url!}
                                    alt={img.filename ?? ''}
                                    fill
                                    sizes="(max-width: 767px) 100vw, 55vw"
                                    priority={index === 0}
                                    loading={index === 0 ? undefined : 'lazy'}
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    ))}
                </Slider>

                <button
                    onClick={() => mainSlider.current?.slickPrev()}
                    className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2
                     bg-white/80 hover:bg-white rounded-md p-1.5 md:p-2 shadow cursor-pointer z-10"
                >
                    <ChevronLeft className="size-4 md:size-5" />
                </button>

                <button
                    onClick={() => mainSlider.current?.slickNext()}
                    className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2
                     bg-white/80 hover:bg-white rounded-md p-1.5 md:p-2 shadow cursor-pointer z-10"
                >
                    <ChevronRight className="size-4 md:size-5" />
                </button>

                {/* Точки-миниатюры на мобильных вместо боковых thumb */}
                <div className="flex md:hidden justify-center gap-1.5 mt-3">
                    {gallery.map((img, i) => (
                        <button
                            key={img.id}
                            onClick={() => mainSlider.current?.slickGoTo(i)}
                            className="w-1.5 h-1.5 rounded-full bg-gray-300 transition-colors"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
