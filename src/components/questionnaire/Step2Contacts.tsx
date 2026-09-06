'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type z from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { activityOptions } from '@/shared/constants/questionnaire.constants';
import { authorStep2Schema, type AuthorWelcomeValues } from '@/shared/validations/schemas';

export default function Step2Contacts({
    defaultValues,
    onNext,
    onBack,
}: {
    defaultValues: Partial<AuthorWelcomeValues>;
    onNext: (values?: Partial<AuthorWelcomeValues>) => void;
    onBack: () => void;
}) {
    const form = useForm<z.infer<typeof authorStep2Schema>>({
        resolver: zodResolver(authorStep2Schema),
        defaultValues,
    });

    const submit = (values: Partial<AuthorWelcomeValues>) => {
        onNext(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-8">
                <div className="space-y-5">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-my-secondary">Электронная почта</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ваша электронная почта" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="vkPersonal"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-my-secondary">Ссылка на личную страницу в ВК</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ваша страница ВК" {...field} />
                                </FormControl>
                                <FormDescription className="text-[11px]">
                                    Убедитесь, что ваши личные сообщения открыты, чтобы мы могли связаться с вами!
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-3">
                        <FormLabel className="">Основной род деятельности:</FormLabel>
                        {activityOptions.map((item) => (
                            <FormField
                                key={item.id}
                                control={form.control}
                                name="activities"
                                render={({ field, fieldState }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...field.value, item.id])
                                                        : field.onChange(
                                                              field.value?.filter((value) => value !== item.id),
                                                          );
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel
                                            className={`font-normal leading-tight ${field.value?.includes(item.id) && 'text-my-accent'}`}
                                        >
                                            {item.label}
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>

                    <FormField
                        control={form.control}
                        name="publicLink"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-my-secondary">Ссылка на паблик</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ваш паблик" {...field} />
                                </FormControl>
                                <FormDescription className="text-[11px]">
                                    Мы рассматриваем ссылки только на ВК или Телеграм!
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="nickname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-my-secondary">Ваш ник</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ваш ник" {...field} />
                                </FormControl>
                                <FormDescription className="text-[11px]">
                                    Чтобы мы знали, как вас подписать на анонсе!
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-between">
                    <Button type="button" variant="secondary" onClick={onBack}>
                        <ChevronLeft /> Назад
                    </Button>

                    <Button type="submit">
                        Далее <ChevronRight />
                    </Button>
                </div>
            </form>
        </Form>
    );
}
