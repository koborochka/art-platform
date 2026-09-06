import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/utils/tailwind';

const badgeVariants = cva(
    'inline-flex items-center rounded-3xl border px-6 py-[5px] w-fit h-fit whitespace-nowrap ' +
        'md:text-xs text-[10px] font-medium md:font-normal ' +
        'transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-my-button-primary-default hover:my-button-primary-default/80',
                counter:
                    'border-transparent text-white bg-my-button-primary-default hover:my-button-primary-default/80',

                secondary: 'border-transparent bg-white text-my-secondary px-1 py-0 font-semibold',
                destructive:
                    'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80 ',
                outline: 'text-foreground',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
