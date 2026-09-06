import * as React from 'react';

import { cn } from '@/shared/utils/tailwind';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'h-10 w-full min-w-0 rounded-md border border-input bg-transparent',
                'px-3 py-2',
                'text-base font-[450] leading-none',
                '[font-variant-numeric:lining-nums_tabular-nums_stacked-fractions]',
                'placeholder:text-muted-foreground placeholder:font-[450]',
                'shadow-xs outline-none transition-[color,box-shadow]',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-base file:font-medium',
                'selection:bg-primary selection:text-primary-foreground',
                'dark:bg-input/30',
                'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
}

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'w-full min-w-0 rounded-md border border-input bg-transparent',
                'px-3 py-2',
                'text-base font-[450] leading-none',
                '[font-variant-numeric:lining-nums_tabular-nums_stacked-fractions]',
                'placeholder:text-muted-foreground placeholder:font-[450]',
                'shadow-xs outline-none resize-none',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                className,
            )}
            {...props}
        />
    );
}

export { Input, Textarea };
