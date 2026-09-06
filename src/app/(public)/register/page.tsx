'use client';

import React, { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PhoneInput } from '@/components/shared/PhoneInput';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { customerClientService } from '@/services/api/client/customer-client.service';
import type { ICustomerCreateInput } from '@/shared/types/customer.interface';
import { emailSchema, fullNameSchema, passwordSchema, phoneSchema } from '@/shared/validations/schemas';

const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    fullName: fullNameSchema,
    phone: phoneSchema,
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false); // Успешная регистрация

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: '', password: '', fullName: '', phone: '' },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setLoading(true);
        setError('');

        try {
            const registerResult = await customerClientService.register(data as ICustomerCreateInput);
            if (!registerResult.success) {
                setError(registerResult.error || 'Ошибка при регистрации');
                return;
            }
            setSuccess(true);
        } catch (error) {
            console.error(error);
            setError('Произошла ошибка при регистрации');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-lg mx-auto p-6">
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Регистрация успешна</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p>Мы отправили письмо с подтверждением на вашу электронную почту.</p>
                        <p>
                            Пожалуйста, перейдите по ссылке в письме для активации аккаунта перед тем, как войти. Можно
                            покинуть эту страницу.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto p-6">
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Создание аккаунта</CardTitle>
                    <CardDescription className="text-center">Заполните форму для регистрации</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
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
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Пароль</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Придумайте пароль"
                                                {...field}
                                                disabled={loading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Имя</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ваше полное имя" {...field} disabled={loading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Телефон</FormLabel>
                                        <FormControl>
                                            <PhoneInput
                                                placeholder="+7 (XXX) XXX-XX-XX"
                                                {...field}
                                                disabled={loading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={loading} className="w-full cursor-pointer">
                                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                            </Button>
                        </form>
                    </Form>
                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
