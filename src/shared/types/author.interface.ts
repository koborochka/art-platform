import type { Author, Invoice, Product } from './payload-types';

export type IAuthorUpdateInput = Omit<
    Author,
    'id' | 'slug' | 'user' | 'products_count' | 'product_categories' | 'createdAt' | 'updatedAt'
>;
export type IAuthorProductCategory = Exclude<Author['product_categories'], undefined | null>[number];
export type IAuthorAvatar = IAuthorUpdateInput['avatar'];
export type IAuthorCover = IAuthorUpdateInput['cover'];

export interface AuthorProfileFormValues {
    name: string;
    bio: string;
    avatar?: IAuthorAvatar;
    cover?: IAuthorCover;
}

export interface AuthorProfileUIProps {
    authorData: Author;
    products: Product[];
    latestInvoice: Invoice | null;
}
