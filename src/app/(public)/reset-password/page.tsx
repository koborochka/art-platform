'use client';

import React, { Suspense, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PAGES } from '@/config/public-pages.config';
import { customerClientService } from '@/services/api/client/customer-client.service';
import { passwordSchema } from '@/shared/validations/schemas';

const resetPasswordSchema = z.object({
    password: passwordSchema,
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/**
 * Страница, адрес которой приходит в письме для сброса пароля.
 * На сервере проверяет токен, позволяет пользователю ввести новый пароль и отображает результат
 */
function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    // TODO: вынести enum статусов, переиспользовать везде
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(!token ? 'error' : 'idle');
    const [message, setMessage] = useState(!token ? 'Токен не найден. Запросите ссылку на сброс пароля снова.' : '');

    // Инициализируем форму
    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: '' },
    });

    const onSubmit = async (data: ResetPasswordFormValues) => {
        if (!token) return;

        setStatus('loading');
        setMessage('');

        try {
            const result = await customerClientService.resetPassword(token, data.password);
            if (result.success) {
                setStatus('success');
                setMessage('Ваш пароль был успешно обновлен.');
            } else {
                setStatus('error');
                setMessage(result.error || 'Ошибка при изменении пароля.');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('Произошла непредвиденная ошибка при смене пароля.');
        }
    };

    return (
        <Card className="max-w-md mx-auto mt-10">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Установка нового пароля</CardTitle>
                <CardDescription className="text-center">
                    {status === 'success' && 'Операция успешно завершена'}
                    {status === 'error' && !token && 'Ошибка доступа'}
                    {status !== 'success' && token && 'Придумайте и введите новый пароль для вашего аккаунта'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {status === 'success' ? (
                    <>
                        <Alert>
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                        <Button onClick={() => router.push(PAGES.LOGIN)} className="w-full">
                            Войти с новым паролем
                        </Button>
                    </>
                ) : status === 'error' && !token ? (
                    <Alert variant="destructive">
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Новый пароль</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Введите новый пароль"
                                                {...field}
                                                disabled={status === 'loading'}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={status === 'loading'} className="w-full">
                                {status === 'loading' ? 'Сохранение...' : 'Сохранить пароль'}
                            </Button>

                            {status === 'error' && (
                                <Alert variant="destructive">
                                    <AlertDescription>{message}</AlertDescription>
                                </Alert>
                            )}
                        </form>
                    </Form>
                )}
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="text-center mt-10">Загрузка...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
