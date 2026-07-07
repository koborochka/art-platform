'use client';

import React, { useCallback, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PhoneInput } from '@/components/shared/PhoneInput';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from '@/components/ui/field';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PAGES } from '@/config/public-pages.config';
import { customerClientService } from '@/services/api/client/customer-client.service';
import { orderClientService } from '@/services/api/client/order-client.service';
import { useCartStore } from '@/services/store/cart/store';
import { DELIVERY_TYPES, PICKUP_ADDRESS } from '@/shared/constants/order.constants';
import { isImageData } from '@/shared/guards/image.guard';
import { isProductData } from '@/shared/guards/product.guard';
import { useProductsByIds } from '@/shared/hooks/useFetchData';
import {
    type IDeliveryType,
    type IOrderCdek,
    type IOrderCreateRequest,
    type OrderUIProps,
} from '@/shared/types/order.interface';
import { fullNameSchema, phoneSchema } from '@/shared/validations/schemas';

import { CdekWidget } from './CdekWidget';

const orderSchema = z
    .object({
        fullName: fullNameSchema,
        phone: phoneSchema,
        comment: z.string().optional(),
        deliveryType: z.string(),
        cdekData: z.any().nullable(),
    })
    .refine(
        (data) => {
            if (data.deliveryType === DELIVERY_TYPES.DELIVERY && !data.cdekData) return false;
            return true;
        },
        { message: 'Пожалуйста, выберите пункт выдачи или адрес доставки на карте', path: ['cdekData'] },
    );

export default function OrderUI({ customer }: OrderUIProps) {
    const router = useRouter();
    const { cart, clearCheckedItems } = useCartStore();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof orderSchema>>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            fullName: customer.fullName || '',
            phone: customer.phone || '',
            comment: '',
            deliveryType: DELIVERY_TYPES.PICKUP,
            cdekData: null,
        },
    });

    const handleCdekSelect = useCallback(
        (selected: IOrderCdek) => {
            form.setValue('cdekData', selected);
            form.clearErrors('cdekData');
        },
        [form],
    );

    const deliveryType = form.watch('deliveryType');
    const isDelivery = deliveryType === DELIVERY_TYPES.DELIVERY;

    const checkedItems = cart?.items?.filter((item) => item.checked) ?? [];

    const productIds = checkedItems.map((item) => {
        return isProductData(item.product) ? item.product.id : item.product;
    });

    const { data: products, isLoading, isError } = useProductsByIds(productIds);

    const total = products
        ? checkedItems.reduce((sum, item) => {
              const productId = isProductData(item.product) ? item.product.id : item.product;
              const product = products.find((p) => p.id === productId);
              return product ? sum + item.quantity * (product.price ?? 0) : sum;
          }, 0)
        : 0;

    const onSubmit = async (data: z.infer<typeof orderSchema>) => {
        setIsSubmitting(true);
        try {
            const { fullName, phone, cdekData, deliveryType, comment } = data;

            if (fullName !== customer.fullName || phone !== customer.phone) {
                await customerClientService.updateProfile({ fullName, phone });
            }

            const requestOrderData: IOrderCreateRequest = {
                items: checkedItems.map((item) => ({
                    id: isProductData(item.product) ? item.product.id : item.product,
                    quantity: item.quantity,
                })),
                deliveryType: deliveryType as IDeliveryType,
                ...(isDelivery && cdekData ? { cdekData } : {}),
                comment: comment || '',
            };

            const result = await orderClientService.createOrder(requestOrderData);
            clearCheckedItems();
            router.push(result.paymentUrl || PAGES.PROFILE);
        } catch (error) {
            console.error('Order creation error:', error);
            alert('Произошла ошибка при оформлении заказа');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="px-4 py-6">Загрузка товаров...</div>;
    }

    if (!isLoading && isError) {
        return <div className="px-4 py-6">Ошибка загрузки товаров</div>;
    }

    if (!isLoading && !isError && checkedItems.length === 0) {
        return (
            <div className="max-w-2xl wrap y-6">
                <h1 className="text-2xl font-bold mb-4">Оформление заказа</h1>
                <p>Нет выбранных товаров для заказа.</p>
                <Button onClick={() => router.push(PAGES.CART)} className="mt-4">
                    Вернуться в корзину
                </Button>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="wrap pb-32 lg:pb-0">
    
                <div className="lg:grid lg:grid-cols-12 lg:gap-16">
                    <Card className="flex flex-col px-0 lg:px-6 gap-8 flex-1 lg:col-span-8">
                        <h1 className="text-2xl font-bold px-4 pt-5 lg:px-0 lg:pt-0 lg:mb-6">Оформление заказа</h1>

                        <div className="space-y-6">
                            <CardHeader className="px-4 lg:px-0">
                                <CardTitle>Состав Заказа</CardTitle>
                            </CardHeader>
                            <div className="flex flex-wrap gap-3 px-4 lg:px-0 mb-8">
                                {checkedItems.map((item, idx) => {
                                    const currentProduct = products.find(
                                        (p) => p.id === (isProductData(item.product) ? item.product.id : item.product),
                                    );
                                    const mainImage =
                                        currentProduct &&
                                        currentProduct.gallery &&
                                        isImageData(currentProduct.gallery[0]?.image)
                                            ? currentProduct.gallery[0].image
                                            : '/placeholder.png';
                                    return (
                                        <Link
                                            href={PAGES.PRODUCT(currentProduct?.slug || '')}
                                            key={idx}
                                            className="relative w-20 h-20 rounded-xl overflow-hidden cursor-pointer"
                                        >
                                            <Image
                                                src={
                                                    isImageData(mainImage) && mainImage.url
                                                        ? mainImage.url
                                                        : (mainImage as string)
                                                }
                                                alt={currentProduct?.title || 'title'}
                                                fill
                                                className="object-cover"
                                            />
                                            <Badge className="absolute bottom-1 left-1" variant="secondary">
                                                {item.quantity} шт
                                            </Badge>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-6 px-4 pt-5 lg:px-0 lg:pt-0">
                            <CardHeader className="px-0">
                                <CardTitle>Данные получателя</CardTitle>
                            </CardHeader>
                            <Alert variant="infoBlue">
                                В качестве данных получателя используются личные данные, указанные в профиле. Вы можете
                                указать другие данные, которые будут актуальны только для текущего заказа. После
                                завершения оформления заказа данные профиля не изменятся.
                            </Alert>
                            <CardContent className="space-y-6 p-0">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ФИО</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                                <PhoneInput {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </div>

                        <div className="space-y-6 px-4 pt-5 lg:px-0 lg:pt-0">
                            <CardHeader className="px-0">
                                <CardTitle>Способ получения</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-0">
                                <RadioGroup
                                    value={deliveryType}
                                    onValueChange={(val) => {
                                        form.setValue('deliveryType', val);
                                        if (val === DELIVERY_TYPES.PICKUP) {
                                            form.setValue('cdekData', null);
                                        }
                                    }}
                                    className="flex flex-col gap-3 lg:flex-row"
                                >
                                    {/* PICKUP */}
                                    <FieldLabel htmlFor="pickup" className="w-full lg:w-auto">
                                        <Field orientation="horizontal">
                                            <FieldContent>
                                                <FieldTitle>Самовывоз</FieldTitle>
                                                <FieldDescription>Из магазина МИНТО</FieldDescription>
                                            </FieldContent>
                                            <RadioGroupItem value={DELIVERY_TYPES.PICKUP} id="pickup" />
                                        </Field>
                                    </FieldLabel>

                                    {/* DELIVERY */}
                                    <FieldLabel htmlFor="delivery" className="w-full lg:w-auto">
                                        <Field orientation="horizontal">
                                            <FieldContent>
                                                <FieldTitle>Доставка СДЭК</FieldTitle>
                                                <FieldDescription>В ПВЗ или курьером</FieldDescription>
                                            </FieldContent>
                                            <RadioGroupItem value={DELIVERY_TYPES.DELIVERY} id="delivery" />
                                        </Field>
                                    </FieldLabel>
                                </RadioGroup>

                                {!isDelivery && (
                                    <div className="space-y-1.5 rounded-xl">
                                        <div className="text-[#4B5563]">Адрес доставки</div>
                                        <div className="bg-[#F3F4F6] py-2.5 px-2 rounded-md">{PICKUP_ADDRESS}</div>
                                    </div>
                                )}
                                {isDelivery && (
                                    <div className="mt-3 space-y-2">
                                        <Label>Выберите пункт выдачи</Label>
                                        <CdekWidget onChoose={handleCdekSelect} />
                                        {form.watch('cdekData') && (
                                            <div className="text-sm">{form.watch('cdekData').address}</div>
                                        )}
                                        {form.formState.errors.cdekData && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.cdekData.message as string}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </div>

                        <div className="space-y-4 px-4 pt-5 lg:px-0 lg:pt-0">
                            <CardHeader className="px-0">
                                <CardTitle>Комментарий</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-0">
                                <FormField
                                    control={form.control}
                                    name="comment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    className="h-20"
                                                    placeholder="Комментарий или пожелание относительно заказа или нашей работы"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </div>
                    </Card>

                    <Card className="hidden lg:block h-fit bg-zinc-100 col-span-4">
                        <CardHeader>
                            <CardTitle>Товары в заказе</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="space-y-3">
                                {checkedItems.map((item) => {
                                    const productId = isProductData(item.product) ? item.product.id : item.product;
                                    const product = products.find((p) => p.id === productId);

                                    return (
                                        <div
                                            key={item.id ?? productId}
                                            className="flex justify-between items-center py-3 border-b"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{product?.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Количество: {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-medium whitespace-nowrap">
                                                {product ? ((product.price ?? 0) * item.quantity).toFixed(2) : 'N/A'}{' '}
                                                руб.
                                            </p>
                                        </div>
                                    );
                                })}

                                <div className="flex justify-between items-center pt-3 font-bold text-lg">
                                    <p>Итого:</p>
                                    <p>{total.toFixed(2)} руб.</p>
                                </div>
                            </div>
                        </CardContent>

                        <Button type="submit" disabled={isSubmitting} className="w-full mt-4" size="lg">
                            {isSubmitting ? 'Оформление заказа...' : 'Завершить заказ'}
                        </Button>
                    </Card>
                </div>

                {/* Sticky footer */}
                <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-background border-t border-border px-4 py-3 flex items-center gap-3">
                    <div className="flex-1">
                        <span className="text-xl font-bold text-primary">{total.toFixed(0)} ₽</span>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="flex-2 h-12 text-base" size="lg">
                        {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}