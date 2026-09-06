import type { IOperationResult } from './api.interface';
import type { Invoice, Product } from './payload-types';

export type IInvoiceItems = Exclude<Invoice['items'], null | undefined>;
export type IInvoiceItem = IInvoiceItems[number];
export type InvoiceItemWithProduct = IInvoiceItems[number] & {
    product: Product;
};
export type IInvoiceItemKey = keyof IInvoiceItems[number];
export type IInvoiceCreatePayloadData = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>;
export type IInvoiceUpdatePayloadData = Partial<IInvoiceCreatePayloadData>;

export interface IInvoiceResult extends IOperationResult {
    invoice?: Invoice;
}

export interface AuthorInvoiceManagerProps {
    authorId: number;
    products: Product[];
    latestInvoice: Invoice | null;
}

export const INVOICE_ITEM_CONDITION = {
    NEW: 'Н',
    OLD: 'С',
    REVALUATION: 'П',
} as const;
