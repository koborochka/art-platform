import type { Cart } from './payload-types';

export type ICartItem = NonNullable<Cart['items']>[number];
