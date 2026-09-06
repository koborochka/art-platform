'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { URL_SEPARATOR } from '@/shared/constants/constants';
import { useFetchAuthors } from '@/shared/hooks/useFetchData';

import { ResponsiveFilterShell } from '../shared/ResponsiveFilter';
import { Checkbox } from '../ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { ScrollArea } from '../ui/scroll-area';
import { Spinner } from '../ui/spinner';

type AuthorFilterProps = {
    initialAuthor?: string;
    onAuthorChange: (author?: string) => void;
};

export default function AuthorFilter({ initialAuthor, onAuthorChange }: AuthorFilterProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [newAuthors, setNewAuthors] = useState<string[]>(
        initialAuthor ? initialAuthor.split(URL_SEPARATOR).filter(Boolean) : [],
    );

    const { data, isError, error, isFetching } = useFetchAuthors({ limit: 1000 });
    const authors = data?.docs;
    const filteredAuthors = authors?.filter((author) => author.name?.toLowerCase().includes(search.toLowerCase()));

    const isActive = !!initialAuthor;

    const onSaveClick = () => {
        onAuthorChange(newAuthors.length ? newAuthors.join(URL_SEPARATOR) : undefined);
        setOpen(false);
    };

    const onResetClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNewAuthors([]);
        onAuthorChange(undefined);
        setOpen(false);
    };

    return (
        <ResponsiveFilterShell
            open={open}
            onOpenChange={setOpen}
            triggerLabel="Автор"
            title="Автор"
            isActive={isActive}
            onReset={onResetClick}
        >
            <Command>
                <CommandInput value={search} onValueChange={setSearch} placeholder="Найти автора" className="h-9" />
                <CommandList className="mt-4">
                    <CommandEmpty>Такого автора нет.</CommandEmpty>
                    <CommandGroup>
                        {isFetching ? (
                            <Spinner />
                        ) : isError ? (
                            <div>Error: {error.message}</div>
                        ) : (
                            <ScrollArea className="h-46 w-full">
                                {filteredAuthors?.map((author) => {
                                    const value = author.name ?? author.id.toString();
                                    const isChecked = newAuthors.includes(value);

                                    const toggle = () => {
                                        setNewAuthors((prev) =>
                                            prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value],
                                        );
                                    };

                                    return (
                                        <CommandItem
                                            key={author.id}
                                            value={value}
                                            onSelect={toggle}
                                            className="cursor-pointer"
                                        >
                                            <div className="shrink-0 pointer-events-auto">
                                                <Checkbox checked={isChecked} onCheckedChange={toggle} />
                                            </div>
                                            {author.name}
                                        </CommandItem>
                                    );
                                })}
                            </ScrollArea>
                        )}
                    </CommandGroup>
                </CommandList>
            </Command>
            <div className="mt-4 flex gap-5">
                <Button onClick={onResetClick} className="flex-1" variant="secondary" disabled={!newAuthors.length}>
                    Сбросить все
                </Button>
                <Button onClick={onSaveClick} className="flex-1" disabled={!newAuthors.length}>
                    Применить
                </Button>
            </div>
        </ResponsiveFilterShell>
    );
}
