'use server';

import configPromise from '@payload-config';
import { execFile } from 'child_process';
import path from 'path';
import { getPayload } from 'payload';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface CreateRevaluationItem {
    article1C: string;
    newPrice: number;
}

export interface CreateRevaluationInput {
    items: CreateRevaluationItem[];
}

export interface CreateRevaluationResult {
    success: boolean;
    type?: 'business' | 'technical';
    error?: string;
    logs?: string;
}

export async function createRevaluation1C({
    items,
}: CreateRevaluationInput): Promise<CreateRevaluationResult> {

    try {
        if (!items.length) {
            throw new Error('Не переданы товары');
        }

        const scriptPath = path.join(
            process.cwd(),
            'scripts',
            'createRevaluation.mjs',
        );

        const args = items.map(
            ({ article1C, newPrice }) => `${article1C.toLowerCase()}:${newPrice}`,
        );

        console.log(
            '[1C REVALUATION]',
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
            console.error('[1C REVALUATION STDERR]', stderr);
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
        console.error('[1C REVALUATION ERROR]', error);

        return {
            success: false,
            type: 'technical',
            error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        };
    }
}