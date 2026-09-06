'use client';

import React from 'react';

import { Map, Placemark, YMaps } from '@pbe/react-yandex-maps';

const COORDS: [number, number] = [56.836008, 60.606924];
const YANDEX_MAPS_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

export default function YandexMap() {
    return (
        <YMaps query={{ apikey: YANDEX_MAPS_API_KEY }}>
            <Map defaultState={{ center: COORDS, zoom: 16 }} width="100%" height="100%">
                <Placemark geometry={COORDS} />
            </Map>
        </YMaps>
    );
}
