import React from 'react';

import { Clock, MapPin, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import JoinTeamSection from '@/components/about/JoinTeamSection';
import AboutSlider from '@/components/about/Slider';
import YandexMap from '@/components/about/YandexMap';

export const metadata: Metadata = {
    title: 'О нас | МИНТО — Маркет авторских работ',
    description:
        'МИНТО — это пространство в Екатеринбурге, где художники и мастера могут арендовать полки для своих уникальных товаров.',
};

export default function AboutPage() {
    return (
        <section className="flex flex-col gap-8 md:gap-20 lg:gap-30">
            <section className="wrap">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 lg:gap-16 p-4 md:p-6 lg:p-8 shadow-[0_3px_40px_0_rgba(39,39,42,0.05)] rounded-xl">
                    <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
                        <h1 className="text-2xl md:text-3xl lg:text-[32px] font-semibold leading-tight">
                            Привет и добро пожаловать в МИНТО!
                        </h1>
                        <p className="text-sm md:text-base leading-relaxed">
                            МИНТО — это место, где каждый автор может арендовать полочку и представить свои работы. Мы
                            поддерживаем талантливых художников и мастеров, помогая им находить покупателей и
                            вдохновляться на создание нового и уникального.
                        </p>
                    </div>
                    <div className="lg:col-span-7 w-full h-[250px] md:h-[350px] lg:h-[500px] overflow-hidden rounded-xl">
                        <AboutSlider />
                    </div>
                </div>
            </section>

            <JoinTeamSection />

            <section className="wrap mb-10 md:mb-16 lg:mb-20">
                <h2 className="text-2xl md:text-3xl lg:text-[32px] font-semibold mb-6 md:mb-8 px-4 lg:px-0">
                    Как нас найти?
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 px-4 lg:px-0">
                    <ul className="lg:col-span-4 flex flex-col gap-4">
                        <li className="flex flex-col gap-3 md:gap-4 bg-gray-50 p-4 md:p-6 rounded-xl">
                            <h3 className="text-lg md:text-xl font-semibold">Месторасположение</h3>
                            <div className="flex flex-col gap-3 md:gap-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-primary size-5 shrink-0 mt-0.5" />
                                    <span className="text-sm md:text-base">улица Горького, 33, Екатеринбург</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="text-primary size-5 shrink-0" />
                                    <span className="text-sm md:text-base">10:00 — 22:00</span>
                                </div>
                            </div>
                        </li>

                        <li className="flex flex-col gap-3 md:gap-4 bg-gray-50 p-4 md:p-6 rounded-xl">
                            <h3 className="text-lg md:text-xl font-semibold">Контакты</h3>
                            <div className="flex items-center gap-3">
                                <Phone className="text-primary size-5 shrink-0" />
                                <a
                                    href="tel:+79995619915"
                                    className="text-sm md:text-base hover:text-primary transition-colors"
                                >
                                    +7 (999) 561-99-15
                                </a>
                            </div>
                        </li>

                        <li className="flex flex-col gap-3 md:gap-4 bg-gray-50 p-4 md:p-6 rounded-xl">
                            <h3 className="text-lg md:text-xl font-semibold">Социальные сети</h3>
                            <div className="flex flex-col gap-3 md:gap-4">
                                <Link
                                    href="#"
                                    className="flex items-center gap-2 hover:text-my-accent transition-colors"
                                >
                                    <img src="/icons/vk.svg" alt="VK" className="w-5 h-5 md:w-6 md:h-6" />
                                    <span className="text-sm md:text-base font-medium">Вконтакте</span>
                                </Link>
                                <Link
                                    href="#"
                                    className="flex items-center gap-2 hover:text-my-accent transition-colors"
                                >
                                    <img src="/icons/telegram.svg" alt="Telegram" className="w-5 h-5 md:w-6 md:h-6" />
                                    <span className="text-sm md:text-base font-medium">Telegram</span>
                                </Link>
                                <Link
                                    href="#"
                                    className="flex items-center gap-2 hover:text-my-accent transition-colors"
                                >
                                    <img src="/icons/tiktok.svg" alt="TikTok" className="w-5 h-5 md:w-6 md:h-6" />
                                    <span className="text-sm md:text-base font-medium">TikTok</span>
                                </Link>
                            </div>
                        </li>
                    </ul>

                    <div className="lg:col-span-8 h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-xl">
                        <YandexMap />
                    </div>
                </div>
            </section>
        </section>
    );
}
