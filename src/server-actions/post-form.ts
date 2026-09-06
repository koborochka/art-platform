'use server';

import { getPayload } from 'payload';
import type z from 'zod';

import config from '@/payload.config';
import { authorFullSchema } from '@/shared/validations/schemas';

export async function postForm(data: z.infer<typeof authorFullSchema>) {
    try {
        const payload = await getPayload({ config });

        await payload.create({
            collection: 'forms',
            data: {
                ...data,
                needRail: data.needRail === 'yes',
            },
        });

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to submit form' };
    }
}
