'use client';

import React, { useRef } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Slider from 'react-slick';

import type { HomeSlider as HomeSliderType } from '@/shared/types/payload-types';

import './home-slider.scss';

type Props = {
    slides?: HomeSliderType[];
};

export default function HomeSlider({ slides }: Props) {
    const sliderRef = useRef<Slider | null>(null);

    if (!slides || slides.length === 0) {
        return null;
    }

    const containerClasses =
        'relative w-full h-[400px] md:h-[520px] lg:h-[624px] rounded-xl overflow-hidden shadow-[0_3px_40px_0_rgba(39,39,42,0.05)] cursor-pointer';

    if (slides.length === 1) {
        const slide = slides[0];
        const src = (typeof slide?.image === 'object' && slide.image?.url) || '/placeholder.png';

        return (
            <div className={containerClasses}>
                <Image src={src} alt={slide?.title || 'Картинка'} fill priority className="object-cover" />
            </div>
        );
    }

    const settings = {
        dots: false,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2500,
        arrows: false,
        draggable: true,
    };

    return (
        <div className="relative home-slider w-full h-100 md:h-130 lg:h-156 overflow-hidden">
            <Slider ref={sliderRef} {...settings} className="h-full">
                {slides.map((slide) => {
                    const src = (typeof slide.image === 'object' && slide.image?.url) || '/placeholder.png';

                    return (
                        <div key={slide.id} className="h-full outline-none">
                            <div className={containerClasses}>
                                <Image src={src} alt={slide.title} fill priority className="object-cover" />
                            </div>
                        </div>
                    );
                })}
            </Slider>

            <button
                onClick={() => sliderRef.current?.slickPrev()}
                aria-label="Предыдущий слайд"
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2
                           bg-white/80 hover:bg-white rounded-full p-2 shadow z-10 cursor-pointer
                           transition-colors duration-200"
            >
                <ChevronLeft className="size-5" />
            </button>
            <button
                onClick={() => sliderRef.current?.slickNext()}
                aria-label="Следующий слайд"
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2
                           bg-white/80 hover:bg-white rounded-full p-2 shadow z-10 cursor-pointer
                           transition-colors duration-200"
            >
                <ChevronRight className="size-5" />
            </button>
        </div>
    );
}
