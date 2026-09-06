'use client';

import * as React from 'react';

import { Combobox as ComboboxPrimitive } from '@base-ui/react';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';

import { cn } from '@/shared/utils/tailwind';

const Combobox = ComboboxPrimitive.Root;

function ComboboxInput({ className, placeholder, ...props }: ComboboxPrimitive.Input.Props & { placeholder?: string }) {
    return (
        <ComboboxPrimitive.Input
            data-slot="combobox-input"
            className={cn(
                'h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base font-[450] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                className,
            )}
            placeholder={placeholder}
            {...props}
        />
    );
}

function ComboboxTrigger() {
    return (
        <ComboboxPrimitive.Trigger className="absolute right-3 top-1/2 -translate-y-1/2 text-my-primary">
            <ChevronDownIcon size={24} strokeWidth={1.5} />
        </ComboboxPrimitive.Trigger>
    );
}

function ComboboxContent({ className, children, ...props }: ComboboxPrimitive.Popup.Props) {
    return (
        <ComboboxPrimitive.Portal>
            <ComboboxPrimitive.Positioner sideOffset={6} align="start" className="z-50">
                <ComboboxPrimitive.Popup
                    className={cn(
                        'w-[var(--anchor-width)] min-w-[var(--anchor-width)] rounded-xl border border-gray-200 bg-popover p-2 shadow-md pointer-events-auto',
                        className,
                    )}
                    {...props}
                >
                    {children}
                </ComboboxPrimitive.Popup>
            </ComboboxPrimitive.Positioner>
        </ComboboxPrimitive.Portal>
    );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
    return (
        <ComboboxPrimitive.List className={cn('flex max-h-80 flex-col gap-1 overflow-y-auto', className)} {...props} />
    );
}

function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
    return (
        <ComboboxPrimitive.Item
            className={cn('relative flex w-full cursor-pointer items-center outline-none', className)}
            {...props}
        >
            {children}
            <ComboboxPrimitive.ItemIndicator className="absolute right-3">
                <CheckIcon className="size-4 text-my-accent" />
            </ComboboxPrimitive.ItemIndicator>
        </ComboboxPrimitive.Item>
    );
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
    return (
        <ComboboxPrimitive.Empty
            className={cn('hidden py-6 text-center text-sm text-muted-foreground group-data-[empty]:flex', className)}
            {...props}
        />
    );
}

export { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger };
