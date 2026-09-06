import React from 'react';

import { X } from 'lucide-react';

import { Button } from '../ui/button';

type FilterTriggerProps = {
    label: string;
    isActive: boolean;
    onReset: (e: React.MouseEvent) => void;
};

export const FilterTrigger = React.forwardRef<HTMLButtonElement, FilterTriggerProps>(
    ({ label, isActive, onReset, ...props }, ref) => {
        return (
            <Button ref={ref} variant={isActive ? 'activeFilter' : 'filter'} {...props}>
                {label}
                {isActive && (
                    <span
                        role="button"
                        tabIndex={0}
                        className="inline-flex items-center justify-center rounded-full w-6 h-6 bg-my-button-primary-default text-white hover:bg-button-primary-hover cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onReset(e);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                onReset(e as unknown as React.MouseEvent);
                            }
                        }}
                    >
                        <X className="w-4 h-4" />
                    </span>
                )}
            </Button>
        );
    },
);

FilterTrigger.displayName = 'FilterTrigger';
