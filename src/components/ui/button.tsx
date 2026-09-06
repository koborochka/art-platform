import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Minus, Plus } from 'lucide-react';

import { cn } from '@/shared/utils/tailwind';

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-l font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
    {
        variants: {
            variant: {
                default:
                    'bg-my-button-primary-default text-white hover:bg-button-primary-hover disabled:bg-my-button-primary-disabled',
                smallRounded:
                    'bg-my-button-primary-default text-white hover:bg-button-primary-hover disabled:bg-my-button-primary-disabled rounded-full w-6 h-6 min-h-0',
                destructive:
                    'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
                outline:
                    'border-2 hover:bg-secondary/80 hover:border-bg-secondary/80 dark:hover:bg-secondary/80 dark:hover:border-bg-secondary/80',
                secondary:
                    'bg-my-button-secondary-default text-my-accent hover:bg-my-button-secondary-hover disabled:bg-my-button-secondary-disabled disabled:text-my-tertriary',

                ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
                empty: '', //'hover:bg-my-button-primary-hover',
                secondaryEmpty: '', //'hover:bg-my-button-primary-hover/50',
                link: 'text-primary underline-offset-4 hover:underline',

                filter: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-3xl',
                activeFilter: 'text-white bg-my-accent hover:bg-my-accent-hover rounded-3xl',
                pagination: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            },
            size: {
                default: 'h-9 px-4 py-2 min-h-10', // has-[svg]:pr-2
                sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
                lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
                icon: 'size-8 min-h-0',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

const counterVariants = cva('flex w-full gap-1 items-center justify-between rounded-md h-9 min-h-10', {
    variants: {
        variant: {
            default: 'text-white bg-my-button-primary-default',
            secondary: 'text-my-accent bg-my-secondary-background',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

export default function CounterButton({
    handleMinus,
    handlePlus,
    quantity,
    variant,
    boundary,
}: {
    handleMinus: () => void;
    handlePlus: () => void;
    quantity: number;
    variant?: VariantProps<typeof counterVariants>['variant'];
    boundary?: number;
}) {
    return (
        <div className={cn(counterVariants({ variant }))}>
            <Button
                className="p-0 w-9"
                onClick={handleMinus}
                variant={variant === 'default' ? 'empty' : 'secondaryEmpty'}
            >
                <Minus width={36} height={36} />
            </Button>
            <div className="px-2">{quantity}</div>
            <Button
                className={`p-0 w-9 ${quantity === boundary ? 'pointer-events-none disabled' : ''}`}
                onClick={handlePlus}
                variant={variant === 'default' ? 'empty' : 'secondaryEmpty'}
            >
                <Plus width={36} height={36} />
            </Button>
        </div>
    );
}

export { Button, buttonVariants, CounterButton };
