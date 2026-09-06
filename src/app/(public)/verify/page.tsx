'use client';

import React, { Suspense, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PAGES } from '@/config/public-pages.config';
import { customerClientService } from '@/services/api/client/customer-client.service';

/**
 * Страница, адрес которой приходит в письме для подтверждения почты.
 * На сервере проверяет токен, активирует аккаунт и отображает результат пользователю
 */
function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    // TODO: enum везде заюзать
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Токен подтверждения не найден. Пожалуйста, проверьте ссылку.');
            return;
        }

        const verifyAccount = async () => {
            const result = await customerClientService.verifyEmail(token);

            if (result.success) {
                setStatus('success');
                setMessage('Ваша почта успешно подтверждена! Теперь вы можете авторизоваться.');
            } else {
                setStatus('error');
                setMessage(result.error || 'Произошла ошибка. Ссылка недействительна или уже использована.');
            }
        };

        verifyAccount();
    }, [token]);

    return (
        <Card className="max-w-md mx-auto mt-10">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Подтверждение почты</CardTitle>
                <CardDescription className="text-center">
                    {status === 'loading' && 'Подождите, проверяем токен...'}
                    {status === 'success' && 'Операция успешно завершена'}
                    {status === 'error' && 'Не удалось подтвердить почту'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {status === 'error' && (
                    <Alert variant="destructive">
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                {status === 'success' && (
                    <Alert>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                {status !== 'loading' && (
                    <Button onClick={() => router.push(PAGES.LOGIN)} className="w-full">
                        Войти в аккаунт
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="text-center mt-10">Загрузка...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
