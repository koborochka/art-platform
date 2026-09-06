import type { TaskConfig } from 'payload';

import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { UserType } from '@/shared/types/auth.interface';

export const cleanupUnverifiedUsers: TaskConfig<'cleanupUnverifiedUsers'> = {
    slug: 'cleanupUnverifiedUsers',
    label: 'Очистка неподтверждённых пользователей',
    schedule: [
        {
            cron: '0 3 * * 1', // каждый понедельник в 03:00
            queue: 'cleanup',
        },
    ],
    inputSchema: [],
    outputSchema: [
        { name: 'deletedUsersCount', type: 'number', required: true },
        { name: 'deletedCustomersCount', type: 'number', required: true },
    ],
    retries: 2,
    handler: async ({ req }) => {
        const { payload } = req;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const unverifiedUsers = await payload.find({
            collection: COLLECTION_SLUGS.USERS,
            where: {
                and: [
                    { _verified: { equals: false } },
                    { role: { equals: UserType.CUSTOMER } },
                    { createdAt: { less_than: oneWeekAgo.toISOString() } },
                ],
            },
            limit: 1000,
        });

        let deletedUsersCount = 0;
        let deletedCustomersCount = 0;

        for (const user of unverifiedUsers.docs) {
            // Удаление связанного покупателя
            try {
                const customers = await payload.find({
                    collection: COLLECTION_SLUGS.CUSTOMERS,
                    where: { user: { equals: user.id } },
                    limit: 1,
                });
                const customer = customers.docs[0];
                if (customer) {
                    await payload.delete({
                        collection: COLLECTION_SLUGS.CUSTOMERS,
                        id: customer.id,
                    });
                    deletedCustomersCount++;
                }
            } catch (err) {
                const errMessage = err instanceof Error ? err.message : String(err);
                payload.logger.error(`Error deleting customer for user ${user.id}: ${errMessage}`);
            }

            // Удаление пользователя
            try {
                const result = await payload.delete({
                    collection: COLLECTION_SLUGS.USERS,
                    id: user.id,
                });
                if (result) {
                    deletedUsersCount++;
                    payload.logger.info(`User ${user.id} successfully deleted.`);
                }
            } catch (err) {
                const errMessage = err instanceof Error ? err.message : String(err);
                payload.logger.error(`FAILED to delete user ${user.id}: ${errMessage}`);
            }
        }

        return {
            output: {
                deletedUsersCount,
                deletedCustomersCount,
            },
        };
    },
};
