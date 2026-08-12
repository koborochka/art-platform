'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { URL_SEPARATOR } from '@/shared/constants/constants';
import { useFetchCategories } from '@/shared/hooks/useFetchData';

import { Checkbox } from '../ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { ScrollArea } from '../ui/scroll-area';
import { Spinner } from '../ui/spinner';

import { ResponsiveFilterShell } from './ResponsiveFilter';

type CategoryFilterProps = {
    category?: string;
    onCategoryChange: (category?: string) => void;
};

export default function CategoryFilter({ category, onCategoryChange }: CategoryFilterProps) {
    const [open, setOpen] = useState(false);
    const [newCategories, setNewCategories] = useState<string[]>(
        category ? category.split(URL_SEPARATOR).filter(Boolean) : [],
    );

    const { data, isError, error, isFetching } = useFetchCategories();
    const categories = data?.docs || [];

    const isActive = !!category;

    const onSaveClick = () => {
        onCategoryChange(newCategories.length ? newCategories.join(URL_SEPARATOR) : undefined);
        setOpen(false);
    };

    const onResetClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNewCategories([]);
        onCategoryChange(undefined);
        setOpen(false);
    };

    return (
        <ResponsiveFilterShell
            open={open}
            onOpenChange={setOpen}
            triggerLabel="Категория"
            title="Категория"
            isActive={isActive}
            onReset={onResetClick}
        >
            <Command>
                <CommandInput placeholder="Найти категорию" className="h-9" />
                <CommandList className="mt-4">
                    <CommandEmpty>Такой категории нет.</CommandEmpty>
                    <CommandGroup>
                        <ScrollArea className="h-46 w-full">
                            {isError && error && <span>{error.message}</span>}
                            {isFetching && <Spinner />}
                            {categories.map((category) => {
                                const isChecked = newCategories.includes(category.value);
                                const toggle = () => {
                                    setNewCategories((prev) =>
                                        prev.includes(category.value)
                                            ? prev.filter((c) => c !== category.value)
                                            : [...prev, category.value],
                                    );
                                };

                                return (
                                    <CommandItem
                                        className="cursor-pointer"
                                        key={category.value}
                                        value={category.label}
                                        onSelect={toggle}
                                    >
                                        <div className="shrink-0 pointer-events-auto">
                                            <Checkbox checked={isChecked} onCheckedChange={toggle} />
                                        </div>
                                        {category.label}
                                    </CommandItem>
                                );
                            })}
                        </ScrollArea>
                    </CommandGroup>
                </CommandList>
            </Command>
            <div className="mt-4 flex gap-5">
                <Button onClick={onResetClick} className="flex-1" variant="secondary" disabled={!newCategories.length}>
                    Сбросить все
                </Button>
                <Button onClick={onSaveClick} className="flex-1" disabled={!newCategories.length}>
                    Применить
                </Button>
            </div>
        </ResponsiveFilterShell>
    );
}
