'use client';

import * as React from 'react';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleCheck, CircleIcon } from 'lucide-react';

import { cn } from '@/shared/utils/tailwind';

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
    return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn('grid gap-3', className)} {...props} />;
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
    return (
        <RadioGroupPrimitive.Item
            data-slot="radio-group-item"
            className={cn(
                'border-my-tertriary text-primary',
                'aspect-square size-4 shrink-0 rounded-full border shadow-xs outline-none transition',

                'data-[state=checked]:border-[#01AAB3]',

                'focus-visible:ring-[3px] focus-visible:ring-ring/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',

                className,
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator
                data-slot="radio-group-indicator"
                className="relative flex items-center justify-center"
            >
                <CircleIcon
                    stroke="none"
                    className="fill-[#01AAB3] absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2"
                />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    );
}

export { RadioGroup, RadioGroupItem };
