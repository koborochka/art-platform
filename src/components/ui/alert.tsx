import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/utils/tailwind';

const alertVariants = cva(
    'relative w-full rounded-lg  px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
    {
        variants: {
            variant: {
                default: 'bg-card text-card-foreground border',
                destructive:
                    'text-destructive border bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
                infoBlue: 'border-[#17BBFF] bg-[#F2FAFE] rounded-none border-l-4 whitespace-normal block py-2 px-4',
                infoRed: 'border-red-500 bg-red-50 rounded-none border-l-4 whitespace-normal block py-2 px-4',
                infoYellow: 'border-[#F18200] bg-[#FFFCED] rounded-none border-l-4 whitespace-normal block py-2 px-4',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
    return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-title"
            className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
            {...props}
        />
    );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-description"
            className={cn(
                'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
                className,
            )}
            {...props}
        />
    );
}

export { Alert, AlertDescription, AlertTitle };
