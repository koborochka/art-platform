'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import type z from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { shelfOptions } from '@/shared/constants/questionnaire.constants';
import { authorFullSchema, type AuthorWelcomeValues } from '@/shared/validations/schemas';

import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

export default function Step3Shelves({
    defaultValues,
    onSubmit,
    onBack,
}: {
    defaultValues: Partial<AuthorWelcomeValues>;
    onSubmit: (values: Partial<AuthorWelcomeValues>) => Promise<void>;
    onBack: () => void;
}) {
    const form = useForm<z.infer<typeof authorFullSchema>>({
        resolver: zodResolver(authorFullSchema),
        defaultValues,
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormLabel className="font-semibold text-xl">Выбор полочки</FormLabel>
                <div className="space-y-3">
                    <div>
                        Цена указана за 1 (один) месяц аренды!
                        <br />
                        ПОЛОВИНА ПОЛОЧКИ (38см/32,5см/28см)
                    </div>
                    <Image src="/shelves.png" alt="shelves" width={600} height={456} className="w-full"></Image>
                    {shelfOptions.map((shelf) => (
                        <FormField
                            name="shelves"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <div key={shelf.id} className="flex gap-2">
                                        <Checkbox
                                            checked={field.value?.includes(shelf.id)}
                                            onCheckedChange={(checked) =>
                                                checked
                                                    ? field.onChange([...field.value, shelf.id])
                                                    : field.onChange(field.value.filter((v: string) => v !== shelf.id))
                                            }
                                        />
                                        <FormLabel
                                            className={`font-normal leading-tight ${field.value?.includes(shelf.id) && 'text-my-accent'}`}
                                        >
                                            {shelf.label}
                                        </FormLabel>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>

                <FormField
                    name="needRail"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="font-normal leading-tight text-my-secondary">
                                Нужен ли рейл?
                            </FormLabel>

                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="w-fit">
                                    <Field orientation="horizontal">
                                        <RadioGroupItem value="yes" id="need-rail-yes" className="cursor-pointer" />
                                        <FieldLabel htmlFor="need-rail-yes" className="py-1 border-none">
                                            Да
                                        </FieldLabel>
                                    </Field>

                                    <Field orientation="horizontal">
                                        <RadioGroupItem value="no" id="need-rail-no" />
                                        <FieldLabel htmlFor="need-rail-no" className="py-1 border-none">
                                            Нет
                                        </FieldLabel>
                                    </Field>
                                </RadioGroup>
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="">
                    В соответствии с требованиями Федерального закона от 27.07.2006 г. № 152-ФЗ «О персональных данных»
                    нажимая кнопку «Отправить» я даю согласие на обработку своих персональных данных.
                    <br />
                    Данные не будут переданы третьим лицам
                </div>

                <div className="flex justify-between">
                    <Button type="button" variant="secondary" onClick={onBack}>
                        <ChevronLeft /> Назад
                    </Button>

                    <Button type="submit">Завершить</Button>
                </div>
            </form>
        </Form>
    );
}
