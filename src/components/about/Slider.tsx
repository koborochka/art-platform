'use client';

import React from 'react';

import Image from 'next/image';
import Slider from 'react-slick';

export default function AboutSlider() {
    const settings = {
        dots: false,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        focusOnSelect: true,
        autoplay: true,
        centerMode: true,
        centerPadding: '0px',
        autoplaySpeed: 2500,
        draggable: true,
        arrows: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    centerPadding: '0px',
                    arrows: false, // убираем стрелки на планшетах
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    centerPadding: '0px',
                    arrows: false, // убираем стрелки на мобильных
                },
            },
        ],
    };

    const images = ['/homeslider/minto.png'];

    return (
        <div className="w-full h-full overflow-hidden rounded-xl md:rounded-2xl">
            <Slider {...settings} className="about-slider">
                {images.map((url, i) => (
                    <div key={i} className="outline-none">
                        <div className="relative w-full h-[250px] md:h-[350px] lg:h-[500px]">
                            <Image
                                src={url}
                                alt={`Slide ${i + 1}`}
                                fill
                                priority={i === 0}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 60vw"
                                className="object-cover"
                            />
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}
