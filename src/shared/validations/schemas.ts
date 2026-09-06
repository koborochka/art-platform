import { z } from 'zod';

// Базовые переиспользуемые правила
export const emailSchema = z.string().min(1, 'Email обязателен').pipe(z.email('Введите корректный email адрес'));
export const linkSchema = z.string().min(1, 'Ссылка обязательна').url('Введите корректную ссылку');

export const passwordSchema = z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/[a-zA-Z]/, 'Пароль должен содержать хотя бы одну букву')
    .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру');

export const phoneSchema = z
    .string()
    .min(18, 'Введите полный номер телефона') // Длина маски "+7 (000) 000 00-00"
    .refine((val) => !val.includes('_'), 'Введите полный номер телефона');

export const fullNameSchema = z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Слишком длинное имя');

const mediaSchema = z
    .object({
        id: z.number(),
    })
    .catchall(z.any());

export const productSchema = z.object({
    title: z.string().min(1, 'Введите название товара'),
    description: z.string().optional().nullable(),
    category: z.union([z.number(), z.string()]), // категория обязательна для 1с
    gallery: z.array(
        z.object({
            id: z.string().nullable().optional(),
            // Может быть id (number) при создании или объектом Media при редактировании
            image: z.union([z.number(), mediaSchema]).nullable().optional(),
        }),
    ),
});

export const authorStep2Schema = z.object({
    email: emailSchema,
    vkPersonal: linkSchema,
    activities: z.array(z.string()).min(1, 'Выберите хотя бы один род деятельности'),
    otherActivity: z.string().optional(),
    publicLink: linkSchema,
    nickname: z.string().min(2, 'Ник слишком короткий'),
});

export const authorFullSchema = authorStep2Schema.extend({
    shelves: z.array(z.string()).min(1, 'Выберите хотя бы одну полку'),
    needRail: z.string().min(1, 'Выберете вариант'),
});

export type AuthorWelcomeValues = z.infer<typeof authorFullSchema>;
