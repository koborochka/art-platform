import type z from 'zod';

import type { productSchema } from '../validations/schemas';

import type { Product } from './payload-types';

export type IProductFormData = Omit<Product, 'id' | 'slug' | 'author' | 'updatedAt' | 'createdAt'>;
export type IProductCreateInput = Omit<Product, 'id' | 'slug' | 'updatedAt' | 'createdAt'>;
export type IProductUpdateInput = Partial<IProductCreateInput>;

export type ProductFormValues = z.infer<typeof productSchema>;
export type IGalleryItem = NonNullable<ProductFormValues['gallery']>[number];
