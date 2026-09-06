'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { isValidPrice } from '@/shared/utils/isValidPrice';

import { FilterTrigger } from '../shared/FilterTrigger';
import { Input } from '../ui/input';

type PriceFilterProps = {
    priceFrom?: number;
    priceTo?: number;
    onPriceChange: (priceFrom?: number, priceTo?: number) => void;
};

export default function PriceFilter({ priceFrom, priceTo, onPriceChange }: PriceFilterProps) {
    const [open, setOpen] = useState(false);
    const [priceFromValue, setPriceFromValue] = useState(priceFrom);
    const [priceToValue, setPriceToValue] = useState(priceTo);

    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const isActive = !!(priceFrom || priceTo);
    const isValid = isValidPrice(priceFromValue) || isValidPrice(priceToValue);

    const onSaveClick = () => {
        onPriceChange(priceFromValue, priceToValue);
        setOpen(false);
    };

    const onResetClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPriceFromValue(undefined);
        setPriceToValue(undefined);
        onPriceChange(undefined, undefined);
        setOpen(false);
    };

    const trigger = <FilterTrigger label="Цена" isActive={isActive} onReset={onResetClick} />;

    const content = (
        <div className="flex flex-col gap-5">
            <div className="flex gap-2 h-10">
                <Input
                    type="number"
                    placeholder="от"
                    value={priceFromValue}
                    onChange={(e) => setPriceFromValue(Number(e.target.value))}
                />
                <Input
                    type="number"
                    placeholder="до"
                    value={priceToValue}
                    onChange={(e) => setPriceToValue(Number(e.target.value))}
                />
            </div>
            <div className="flex gap-5">
                <Button onClick={onResetClick} className="flex-1" variant="secondary" disabled={!isValid}>
                    Сбросить
                </Button>
                <Button className="flex-1" onClick={onSaveClick} disabled={!isValid}>
                    Применить
                </Button>
            </div>
        </div>
    );

    if (isDesktop) {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>{trigger}</PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                    {content}
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-6">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-left">Цена</SheetTitle>
                    <SheetDescription className="sr-only">Фильтр по цене</SheetDescription>
                </SheetHeader>
                {content}
            </SheetContent>
        </Sheet>
    );
}
