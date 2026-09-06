'use client';

import React, { useCallback, useEffect, useRef } from 'react';

import Script from 'next/script';

import type {
    CdekCourierAddress,
    CdekOfficeAddress,
    CDEKWidgetInstance,
    CdekWidgetProps,
} from '@/shared/types/cdek.interface';
import type { IOrderCdek } from '@/shared/types/order.interface';

const CONTAINER_ID = 'cdek-map-container';
const EKATERINBURG_COORDS: [number, number] = [60.597636, 56.837435];
const CDEK_PROXY_API_URL = '/api/cdek';
const YANDEX_MAPS_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

export const CdekWidget = React.memo(({ onChoose }: CdekWidgetProps) => {
    const widgetRef = useRef<CDEKWidgetInstance | null>(null);

    const initializeWidget = useCallback(() => {
        console.log('initialize CdekWidget');

        if (!window.CDEKWidget || !document.getElementById(CONTAINER_ID)) return;
        if (widgetRef.current) return;

        widgetRef.current = new window.CDEKWidget({
            servicePath: CDEK_PROXY_API_URL,
            root: CONTAINER_ID,
            defaultLocation: EKATERINBURG_COORDS,
            apiKey: YANDEX_MAPS_API_KEY,

            onChoose: (mode, tariff, address) => {
                let selected: IOrderCdek;
                if (mode === 'office') {
                    const officeAddress = address as CdekOfficeAddress;
                    selected = {
                        type: 'pvz',
                        address: officeAddress.address,
                        code: officeAddress.code,
                    };
                } else {
                    // mode === 'door'
                    const courierAddress = address as CdekCourierAddress;
                    selected = {
                        type: 'courier',
                        address: courierAddress.formatted,
                    };
                }

                onChoose(selected);
            },
        });
    }, [onChoose]);

    useEffect(() => {
        if (window.CDEKWidget) {
            initializeWidget();
        }
        return () => {
            widgetRef.current?.destroy();
            widgetRef.current = null;
        };
    }, [initializeWidget]);

    return (
        <div className="relative w-full h-[400px] overflow-hidden rounded-md bg-gray-100">
            <Script
                src="https://cdn.jsdelivr.net/npm/@cdek-it/widget@3"
                strategy="afterInteractive"
                onLoad={initializeWidget}
            />
            <div id={CONTAINER_ID} className="absolute inset-0" />
        </div>
    );
});

// TODO: возможно передавать эти параметры в new window.CDEKWidget
// Тогда можно будет сразу выбрать нужный тариф и посмотреть цену доставки
// Но в этом мало смысла без сохранения в БД, так же для этого нужно обязательно знать точные параметры товаров goods
// => можно реализовывать только при наличии у каждого product обязательного параметра Dimensions
// from: {
//     country_code: 'RU',
//     city: 'Екатеринбург',
//     postal_code: 620000,
//     code: '250',
//     address: 'ул. Горького, д.33',
// },
// goods: [
//     {
//         width: 10,
//         height: 10,
//         length: 10,
//         weight: 150,
//     },
// ],
