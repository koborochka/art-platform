'use client';

import React, { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PAGES } from '@/config/public-pages.config';
import { authorClientService } from '@/services/api/client/author-client.service';
import { customerClientService } from '@/services/api/client/customer-client.service';
import { useAuthStore } from '@/services/store/auth/store';
import { type UserRole, UserType } from '@/shared/types/auth.interface';
import { emailSchema } from '@/shared/validations/schemas';

interface LoginFormProps {
    redirectUrl: string;
}

const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Введите пароль'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm({ redirectUrl }: LoginFormProps) {
    const router = useRouter();
    const checkAuth = useAuthStore((state) => state.checkAuth);

    const [userType, setUserType] = useState<UserRole>(UserType.CUSTOMER);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState({ type: '', text: '' });

    const customerForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const authorForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const currentCustomerEmail = customerForm.watch('email');

    const handleLoginSubmit = async (data: LoginFormValues, role: UserRole) => {
        setLoading(true);
        setError('');
        setResetMessage({ type: '', text: '' });

        try {
            const { email, password } = data;

            let authResult;
            if (role === UserType.CUSTOMER) {
                // Аутентификация покупателя через Payload
                authResult = await customerClientService.authenticate(email, password);
            } else if (role === UserType.AUTHOR) {
                // Аутентификация автора через Payload
                authResult = await authorClientService.authenticate(email, password);
            } else {
                setError('Неверный тип пользователя');
                return;
            }

            if (!authResult.success) {
                setError(authResult.error || 'Неверный email или пароль');
                return;
            }

            await checkAuth(); // Обновляем user в store

            // После успешного входа перенаправляем в профиль или по пути редиректа
            router.replace(redirectUrl);
        } catch (error) {
            console.error(error);
            setError('Произошла ошибка при входе');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!currentCustomerEmail) {
            setResetMessage({
                type: 'error',
                text: 'Пожалуйста, введите ваш Email в поле выше для восстановления пароля',
            });
            // Триггерим ошибку на поле email, если оно пустое
            customerForm.trigger('email');
            return;
        }

        // Если email введен не валидно по Zod, прерываем отправку
        const isEmailValid = await customerForm.trigger('email');
        if (!isEmailValid) return;

        setResetLoading(true);
        setResetMessage({ type: '', text: '' });
        setError('');

        try {
            const result = await customerClientService.requestPasswordReset(currentCustomerEmail);
            if (result.success) {
                setResetMessage({
                    type: 'success',
                    text: 'Ссылка для восстановления отправлена на почту. Проверьте входящие и папку "Спам".',
                });
            } else {
                setResetMessage({ type: 'error', text: result.error || 'Ошибка при запросе сброса пароля.' });
            }
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6">
            <Card className="p-4">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Вход в аккаунт</CardTitle>
                    <CardDescription className="text-center">
                        Выберите тип аккаунта и введите данные для входа
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="customer"
                        className="w-full"
                        onValueChange={(value) => {
                            setUserType(value as UserRole);
                            setError('');
                            setResetMessage({ type: '', text: '' });
                        }}
                    >
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="customer">Покупатель</TabsTrigger>
                            <TabsTrigger value="author">Автор</TabsTrigger>
                        </TabsList>

                        <TabsContent value="customer">
                            <Form {...customerForm}>
                                <form
                                    onSubmit={customerForm.handleSubmit((data) =>
                                        handleLoginSubmit(data, UserType.CUSTOMER),
                                    )}
                                    className="space-y-6"
                                >
                                    <FormField
                                        control={customerForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="your@email.com" {...field} disabled={loading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={customerForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="items-start">
                                                <FormLabel>Пароль</FormLabel>

                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="Ваш пароль"
                                                        {...field}
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                                <button
                                                    type="button"
                                                    onClick={handleForgotPassword}
                                                    disabled={resetLoading || loading}
                                                    className="mr-auto text-sm text-my-accent underline underline-offset-4 disabled:opacity-50"
                                                >
                                                    {resetLoading ? 'Отправка...' : 'Забыли пароль?'}
                                                </button>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" disabled={loading} className="w-full cursor-pointer">
                                        {loading ? 'Вход...' : 'Войти в аккаунт'}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="author">
                            <Form {...authorForm}>
                                <form
                                    onSubmit={authorForm.handleSubmit((data) =>
                                        handleLoginSubmit(data, UserType.AUTHOR),
                                    )}
                                    className="space-y-6"
                                >
                                    <Alert variant="infoBlue">
                                        Для входа используйте данные, предоставленные администратором
                                    </Alert>
                                    <FormField
                                        control={authorForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="author@email.com"
                                                        {...field}
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={authorForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Пароль</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="Пароль"
                                                        {...field}
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" disabled={loading} className="w-full cursor-pointer">
                                        {loading ? 'Вход...' : 'Войти в аккаунт'}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>

                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {resetMessage.text && (
                        <Alert variant={resetMessage.type === 'error' ? 'destructive' : 'default'} className="mt-4">
                            <AlertDescription>{resetMessage.text}</AlertDescription>
                        </Alert>
                    )}

                    {userType === UserType.CUSTOMER && (
                        <div className="text-my-accent mt-4 text-center text-sm">
                            <a href={PAGES.REGISTER} className="hover:underline hover:underline-offset-4">
                                Нет аккаунта? Создать
                            </a>
                        </div>
                    )}

                    {userType === UserType.AUTHOR && (
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Аккаунты авторов создаются администратором. Если вы потеряли доступ, обратитесь в поддержку.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
