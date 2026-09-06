'use client';

import React, { useCallback, useState } from 'react';

import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authorClientService } from '@/services/api/client/author-client.service';
import { isImageData } from '@/shared/guards/image.guard';
import type { Media } from '@/shared/types/payload-types';
import { cn } from '@/shared/utils/tailwind';

interface CoverUploaderProps {
    value?: number | Media | null;
    onChange: (image: Media | null) => void;
}

const ACCEPTED_FORMATS = 'JPG, GIF, PNG, WEBP или HEIC/HEIF';

export default function CoverUploader({ value, onChange }: CoverUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const upload = useCallback(
        async (file: File) => {
            setUploading(true);
            try {
                const res = await authorClientService.uploadMedia(file);
                if (res.success && res.media) onChange(res.media);
            } finally {
                setUploading(false);
            }
        },
        [onChange],
    );

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (file) await upload(file);
        },
        [upload],
    );

    const imageUrl = isImageData(value) ? value.url : null;
    const hasCover = !!imageUrl;

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
        disabled: uploading,
        noClick: hasCover,
        noKeyboard: hasCover,
    });

    const handleEdit = () => {
        setMenuOpen(false);
        open();
    };
    const handleDelete = () => {
        setMenuOpen(false);
        onChange(null);
    };

    const dropzoneProps = getRootProps();

    return (
        <div
            {...dropzoneProps}
            className={cn(
                'relative w-full h-32 max-md:h-24 rounded-lg overflow-hidden flex items-center justify-center transition-colors group',
                hasCover ? '' : 'border-2 border-dashed cursor-pointer',
                !hasCover &&
                    (isDragActive
                        ? 'border-my-accent bg-my-secondary-background'
                        : 'border-my-disabled hover:border-my-accent'),
                uploading && 'opacity-60 pointer-events-none',
            )}
        >
            <input {...getInputProps()} />

            {uploading ? (
                <Loader2 className="w-7 h-7 animate-spin text-my-accent" />
            ) : hasCover ? (
                <>
                    <Image src={imageUrl!} alt="Cover" fill unoptimized className="object-cover" />

                    <div className="absolute inset-0 bg-black/50 flex flex-col gap-2 items-center justify-center text-center px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <Plus className="w-6 h-6 text-white" strokeWidth={1.5} />
                        <p className="text-xl font-medium text-white">Загрузить обложку</p>
                        <p className="text-xs font-medium text-white">Доступные форматы — {ACCEPTED_FORMATS}</p>
                    </div>

                    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="absolute inset-0 cursor-pointer"
                                aria-label="Действия с обложкой"
                            />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" className="min-w-44">
                            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer gap-2.5 py-2">
                                <Pencil className="w-4 h-4" /> Изменить
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleDelete}
                                variant="destructive"
                                className="cursor-pointer gap-2.5 py-2"
                            >
                                <Trash2 className="w-4 h-4" /> Удалить
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            ) : (
                <div className="flex flex-col gap-2 items-center justify-center text-center px-4 pointer-events-none">
                    <Plus className="w-6 h-6 text-my-secondary" strokeWidth={1.5} />
                    <p className="text-sm font-medium text-my-primary">Загрузить обложку</p>
                    <p className="text-xs text-my-tertriary">Доступные форматы — {ACCEPTED_FORMATS}</p>
                </div>
            )}
        </div>
    );
}
