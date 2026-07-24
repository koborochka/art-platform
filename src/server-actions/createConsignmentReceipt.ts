'use server';

import configPromise from '@payload-config';
import { execFile } from 'child_process';
import path from 'path';
import { getPayload } from 'payload';
import { promisify } from 'util';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import type { Author } from '@/shared/types/payload-types';

const execFileAsync = promisify(execFile);

export interface CreateConsignmentReceiptItem {
    article1C: string;
    quantity: number;
    price: number;
}

export interface CreateConsignmentReceiptInput {
    authorId: number;
    items: CreateConsignmentReceiptItem[];
}

export interface CreateConsignmentReceiptResult {
    success: boolean;
    type?: 'business' | 'technical';
    error?: string;
    logs?: string;
}

function resolveAuthorFio(author: Author): string {
    if (!author.fullName?.trim()) {
        throw new Error(`Не указано fullName у автора (id=${author.id})`);
    }

    return author.fullName.trim().toLocaleLowerCase();
}

export async function createConsignmentReceipt1C({
    authorId,
    items,
}: CreateConsignmentReceiptInput): Promise<CreateConsignmentReceiptResult> {
    const payload = await getPayload({
        config: configPromise,
    });

    try {
        if (!items.length) {
            throw new Error('Не переданы товары');
        }

        const author = await payload.findByID({
            collection: COLLECTION_SLUGS.AUTHORS,
            id: authorId,
        });

        const fio = resolveAuthorFio(author).toLowerCase();

        const scriptPath = path.join(
            process.cwd(),
            'scripts',
            'createConsignmentReceipt.mjs',
        );

        const args = [
            fio,
            ...items.map(
                ({ article1C, quantity, price }) =>
                    `${article1C.toLowerCase()}:${quantity}:${price}`,
            ),
        ];

        console.log(
            '[1C CONSIGNMENT RECEIPT]',
            `node ${scriptPath} ${args.map((a) => `"${a}"`).join(' ')}`,
        );

        const { stdout, stderr } = await execFileAsync(
            'node',
            [scriptPath, ...args],
            {
                timeout: 10 * 60 * 1000,
                maxBuffer: 10 * 1024 * 1024,
            },
        );

        if (stderr?.trim()) {
            console.error('[1C CONSIGNMENT RECEIPT STDERR]', stderr);
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
            type: result.type,
            error: result.error,
            logs: stdout,
        };
    } catch (error) {
        console.error('[1C CONSIGNMENT RECEIPT ERROR]', error);

        return {
            success: false,
            type: 'technical',
            error:
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка',
        };
    }
}