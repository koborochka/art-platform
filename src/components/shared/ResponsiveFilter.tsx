'use client';

import React from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

import { FilterTrigger } from './FilterTrigger';

type ResponsiveFilterShellProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    triggerLabel: string;
    title: string;
    isActive: boolean;
    onReset: (e: React.MouseEvent) => void;
    children: React.ReactNode;
};

export function ResponsiveFilterShell({
    open,
    onOpenChange,
    triggerLabel,
    title,
    isActive,
    onReset,
    children,
}: ResponsiveFilterShellProps) {
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    const trigger = <FilterTrigger label={triggerLabel} isActive={isActive} onReset={onReset} />;

    if (isDesktop) {
        return (
            <Popover open={open} onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>{trigger}</PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start" side="bottom" avoidCollisions={false}>
                    {children}
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-6">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-left">{title}</SheetTitle>
                    <SheetDescription className="sr-only">Выбор: {title.toLowerCase()}</SheetDescription>
                </SheetHeader>
                {children}
            </SheetContent>
        </Sheet>
    );
}
