import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Separator } from '../ui/separator';

export default function Step1Info({ onNext }: { onNext: () => void }) {
    return (
        <>
            <div className="space-y-6">
                <div className="space-y-9 leading-relaxed">
                    <div>
                        <h3 className="font-bold text-base mb-5">Как это работает?</h3>
                        <p>
                            Минто — это место, где каждый автор может арендовать полочку и представить свои работы. Мы
                            поддерживаем талантливых художников и мастеров, помогая им находить покупателей и
                            вдохновляться на создание нового и уникального.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-base mb-5">Почему Минто?</h3>
                        <ol className="list-decimal ml-4 space-y-1">
                            <li>Только авторские и уникальные товары.</li>
                            <li>Поддержка талантливых авторов.</li>
                            <li>Активное ведение соцсетей.</li>
                            <li>Быстрая организация отчетов.</li>
                        </ol>
                    </div>

                    <div>
                        <h3 className="font-bold text-base mb-5">Важные моменты</h3>
                        <ul className="list-disc ml-4 space-y-1">
                            <li>Минимальный срок аренды — 2 месяца.</li>
                            <li>Комиссия с продаж — 13%.</li>
                        </ul>
                    </div>
                </div>

                <Separator color="my-secondary" />

                <div className="text-center space-y-1">
                    <p>Екатеринбург | ул. Горького 33</p>
                    <p>ИП Кобелева Анастасия Александровна</p>
                    <p>ИНН 741308401932</p>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={onNext}>
                    Далее <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </>
    );
}
