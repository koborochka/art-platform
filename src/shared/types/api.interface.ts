import type { Media, Product } from './payload-types';

export interface IOperationResult {
    success: boolean;
    error?: string;
}

// Для операций с товарами
export interface IProductResult extends IOperationResult {
    product?: Product;
}

export interface IMediaResult extends IOperationResult {
    media?: Media;
}
