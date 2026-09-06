import { Clock, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="mt-24 bg-gray-50">
            <div className="wrap py-8 px-4 md:py-18 lg:py-18 flex flex-col gap-10 md:gap-14">
                {/* Навигация */}
                <div className="flex flex-col gap-4">
                    {/* Основные ссылки */}
                    <nav className="flex flex-wrap gap-x-6 gap-y-2">
                        <Link
                            href="/products"
                            className="text-sm md:text-base font-semibold text-my-primary hover:text-my-accent transition-colors"
                        >
                            Товары
                        </Link>
                        <Link
                            href="/authors"
                            className="text-sm md:text-base font-semibold text-my-primary hover:text-my-accent transition-colors"
                        >
                            Авторы
                        </Link>
                        <Link
                            href="/about"
                            className="text-sm md:text-base font-semibold text-my-primary hover:text-my-accent transition-colors"
                        >
                            О нас
                        </Link>
                    </nav>

                    {/* Юридические ссылки */}
                    <nav className="flex flex-wrap gap-x-6 gap-y-1">
                        <Link
                            href="/questionnaire"
                            className="text-sm text-my-secondary hover:text-my-accent transition-colors"
                        >
                            Сотрудничество
                        </Link>
                        <Link
                            href=""
                            // href="/offer"
                            className="text-sm text-my-secondary hover:text-my-accent transition-colors"
                        >
                            Публичная оферта
                        </Link>
                        <Link
                            href=""
                            // href="/privacy"
                            className="text-sm text-my-secondary hover:text-my-accent transition-colors"
                        >
                            Политика конфиденциальности
                        </Link>
                    </nav>
                </div>

                {/* Контактный блок */}
                {/* Desktop: три колонки в ряд | Mobile: стопкой */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {/* Месторасположение */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm md:text-base font-semibold text-my-primary">Месторасположение</h3>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-start gap-2 text-my-secondary">
                                <MapPin className="size-4 flex-shrink-0 mt-0.5 text-my-disabled" />
                                <span className="text-sm">улица Горького, 33, Екатеринбург</span>
                            </div>
                            <div className="flex items-center gap-2 text-my-secondary">
                                <Clock className="size-4 flex-shrink-0 text-my-disabled" />
                                <span className="text-sm">10:00 — 22:00</span>
                            </div>
                        </div>
                    </div>

                    {/* Контакты */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm md:text-base font-semibold text-my-primary">Контакты</h3>
                        <div className="flex items-center gap-2 text-my-secondary">
                            <Phone className="size-4 flex-shrink-0 text-my-disabled" />
                            <a href="tel:+79995619915" className="text-sm hover:text-my-accent transition-colors">
                                +7 (999) 561–99–15
                            </a>
                        </div>
                    </div>

                    {/* Социальные сети */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm md:text-base font-semibold text-my-primary">Социальные сети</h3>
                        <div className="flex items-center gap-5">
                            {/* TODO: Добавить ссылки */}
                            <Link
                                href="https://vk.com/minto_ekb"
                                aria-label="ВКонтакте"
                                className="text-my-secondary hover:text-my-accent transition-colors cursor-pointer"
                            >
                                <Image src="/icons/vk--gray.svg" alt="VK" width={20} height={20} />
                            </Link>
                            <Link
                                href="#"
                                aria-label="Telegram"
                                className="text-my-secondary hover:text-my-accent transition-colors cursor-pointer"
                            >
                                <Image src="/icons/telegram--gray.svg" alt="Telegram" width={20} height={20} />
                            </Link>
                            <Link
                                href="#"
                                aria-label="TikTok"
                                className="text-my-secondary hover:text-my-accent transition-colors cursor-pointer"
                            >
                                <Image src="/icons/tiktok--gray.svg" alt="TikTok" width={20} height={20} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Копирайт */}
                <p className="text-sm text-my-disabled">
                    © МИНТО 2026 Все права защищены
                    <span style={{ fontSize: '6px', marginLeft: '16px' }}>v 1.1.8</span>
                </p>
            </div>
        </footer>
    );
}
