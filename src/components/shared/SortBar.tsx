import React from 'react';

import { ArrowDownUp, X } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Button } from '../ui/button';

type SortBarProps<T extends string> = {
    sort?: T;
    options: readonly { value: T; label: string }[];
    onSortChange: (value: T | undefined) => void;
};

export default function SortBar<T extends string>({ sort, options, onSortChange }: SortBarProps<T>) {
    const [open, setOpen] = React.useState(false);

    const isActive = !!sort;

    const onResetClick = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onSortChange(undefined);
        setOpen(false);
    };

    return (
        <Select
            value={sort ?? 'default'}
            onValueChange={(value) => onSortChange(value === 'default' ? undefined : (value as T))}
            open={open}
            onOpenChange={setOpen}
        >
            <SelectTrigger>
                <Button variant={isActive ? 'activeFilter' : 'filter'}>
                    <ArrowDownUp />
                    <SelectValue placeholder="По умолчанию" />
                    {isActive && (
                        <span
                            role="button"
                            tabIndex={0}
                            className="inline-flex items-center justify-center rounded-full w-6 h-6 bg-my-button-primary-default text-white hover:bg-button-primary-hover cursor-pointer"
                            onPointerDown={onResetClick}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ')
                                    onResetClick(e as unknown as React.PointerEvent);
                            }}
                        >
                            <X className="w-4 h-4" />
                        </span>
                    )}
                </Button>
            </SelectTrigger>

            <SelectContent>
                {/* <SelectItem value="default">По умолчанию</SelectItem> */}
                {options.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="">
                        {s.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
