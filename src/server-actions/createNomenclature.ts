'use server';
import configPromise from '@payload-config';
import { execFile } from 'child_process';
import path from 'path';
import { getPayload } from 'payload';
import { promisify } from 'util';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import type { Author, Category } from '@/shared/types/payload-types';

const execFileAsync = promisify(execFile);

export interface CreateNomenclatureResult {
    success: boolean;
    article?: string;
    type?: 'business' | 'technical';
    error?: string;
    logs?: string;
}

export interface CreateNomenclatureInput {
    authorId: number;
    categoryId: number;
    productName: string;
}

function resolveAuthorFio(author: Author): string {
    if (!author.fullName?.trim()) {
        throw new Error(`Не указано fullName у автора (id=${author.id})`);
    }

    return author.fullName.trim().toLocaleLowerCase();
}

function resolveCategoryTitle(category: Category): string {
    if (!category.label?.trim()) {
        throw new Error(`Не указан label у категории (id=${category.id})`);
    }

    return category.label.trim().toLocaleLowerCase();
}

export async function createNomenclature1C({
    authorId,
    categoryId,
    productName,
}: CreateNomenclatureInput): Promise<CreateNomenclatureResult> {
    const payload = await getPayload({ config: configPromise });

    try {
        if (!productName?.trim()) {
            throw new Error('Не указано название номенклатуры');
        }

        const author = (await payload.findByID({
            collection: COLLECTION_SLUGS.AUTHORS,
            id: authorId,
        })) as Author;

        const category = (await payload.findByID({
            collection: COLLECTION_SLUGS.CATEGORIES,
            id: categoryId,
        })) as Category;

        const fio = resolveAuthorFio(author);
        const categoryTitle = resolveCategoryTitle(category);

        const scriptPath = path.join(process.cwd(), 'scripts', 'createNomenclature.mjs');

        const args = [fio, categoryTitle, productName];

        console.log('[1C NOMENCLATURE]', `node ${scriptPath} ${args.map((a) => `"${a}"`).join(' ')}`);

        const { stdout, stderr } = await execFileAsync('node', [scriptPath, ...args], {
            timeout: 10 * 60 * 1000,
            maxBuffer: 10 * 1024 * 1024,
        });

        if (stderr?.trim()) {
            console.error('[1C NOMENCLATURE STDERR]', stderr);
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
            article: result.article,
            type: result.type,
            error: result.error,
            logs: stdout,
        };
    } catch (error) {
        console.error('[1C NOMENCLATURE ERROR]', error);

        return {
            success: false,
            type: 'technical',
            error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        };
    }
}