import type { IOrderCdek } from './order.interface';

export interface CdekOfficeAddress {
    address: string;
    code: string;
    // .. приходит больше полей, но для заказа достаточно этих
}

export interface CdekCourierAddress {
    formatted: string;
    // .. приходит больше полей
}

export type CdekAddress = CdekOfficeAddress | CdekCourierAddress;

// TODO: либо удалить tariff вовсе, либо высвечивать delivery_sum (как только появится ИП key)
export interface CdekTariff {
    tariff_code: number;
    tariff_name: string;
    tariff_description: string;
    delivery_mode: number;
    period_min: number;
    period_max: number;
    delivery_sum: number;
}

// Настройки виджета:

declare global {
    interface Window {
        CDEKWidget: CDEKWidgetConstructor;
    }
}

export interface CDEKWidgetConstructor {
    new (config: CDEKWidgetConfig): CDEKWidgetInstance;
}

export interface CDEKWidgetInstance {
    destroy: () => void;
}

export interface CDEKWidgetConfig {
    servicePath: string;
    root: string;
    apiKey?: string;
    defaultLocation: number[];
    onChoose: (mode: string, tariff: CdekTariff, address: CdekAddress) => void;
}

export interface CdekWidgetProps {
    onChoose: (selected: IOrderCdek) => void;
}
