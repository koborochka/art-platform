'use server';
import configPromise from '@payload-config';
import { execFile } from 'child_process';
import path from 'path';
import { getPayload } from 'payload';
import { promisify } from 'util';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import type { Order, Product } from '@/shared/types/payload-types';

const execFileAsync = promisify(execFile);

export interface CreateSaleResult {
    success: boolean;
    documentNumber?: string;
    type?: 'business' | 'technical';
    error?: string;
    logs?: string;
}

export async function createSale(order: Order): Promise<CreateSaleResult> {
          const payload = await getPayload({ config: configPromise });
  
    try {
        if (!order.items.length) {
            throw new Error('Заказ не содержит товаров');
        }

        const scriptPath = path.join(process.cwd(), 'scripts', 'createSale.mjs');

        const args: string[] = [];

             for (const item of order.items) { 
            const productId = item.productSnapshot.productId;

            const product = await payload.findByID({
                collection: COLLECTION_SLUGS.PRODUCTS,
                id: productId,
            }) as Product;
 
            if (!product.article1C) { 
                throw new Error(`Не указан article1C для товара "${product.title}"`); 
            } 
 
            args.push(`${product.article1C}:${item.quantity}`); 
        } 

        console.log('[1C SALE]', `node ${scriptPath} ${args.join(' ')}`);

        const { stdout, stderr } = await execFileAsync('node', [scriptPath, ...args], {
            timeout: 10 * 60 * 1000,
            maxBuffer: 10 * 1024 * 1024,
        });

        if (stderr?.trim()) {
            console.error('[1C SALE STDERR]', stderr);
        }

        const resultLine = stdout
            .split('\n')
            .map((line) => line.trim())
            .find((line) => {
                try {
                    const parsed = JSON.parse(line);

                    return parsed.__RESULT__ === true;
                } catch {
                    return false;
                }
            });

        if (!resultLine) {
            return {
                success: false,
                type: 'technical',
                error: 'Скрипт не вернул результат выполнения',
                logs: stdout,
            };
        }

        const result = JSON.parse(resultLine);

        return {
            success: result.success,
            documentNumber: result.documentNumber,
            type: result.type,
            error: result.error,
            logs: stdout,
        };
    } catch (error) {
        console.error('[1C SALE ERROR]', error);

        return {
            success: false,
            type: 'technical',
            error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        };
    }
}
