'use client';

import * as React from 'react';

import { Square, SquareCheck } from 'lucide-react';

import { cn } from '@/shared/utils/tailwind';

interface CheckboxProps {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

const Checkbox = React.forwardRef<HTMLDivElement, CheckboxProps>(
    ({ checked = false, onCheckedChange, disabled = false, className }, ref) => {
        const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
            if (disabled) return;
            e.preventDefault();
            e.stopPropagation();
            onCheckedChange?.(!checked);
        };

        return (
            <div
                ref={ref}
                role="checkbox"
                aria-checked={checked}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                onClick={handleToggle}
                className={cn(
                    // Базовые стили контейнера
                    'relative size-6 cursor-pointer outline-none transition-all',
                    'focus-visible:ring-2 focus-visible:ring-my-accent/50',
                    disabled && 'cursor-not-allowed opacity-50',
                    className,
                )}
            >
                <input type="checkbox" className="sr-only" checked={checked} readOnly disabled={disabled} />

                {checked ? (
                    <SquareCheck size={24} className="absolute inset-0 text-my-accent" />
                ) : (
                    <Square
                        size={24}
                        className={cn('text-my-secondary absolute inset-0 transition-colors duration-200')}
                    />
                )}
            </div>
        );
    },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
