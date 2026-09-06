'use client';

import React, { useCallback, useState } from 'react';

import { Camera, Loader2, Pencil, Trash2 } from 'lucide-react';
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

interface AvatarUploaderProps {
    value?: number | Media | null;
    onChange: (image: Media | null) => void;
}

export default function AvatarUploader({ value, onChange }: AvatarUploaderProps) {
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
    const hasAvatar = !!imageUrl;

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
        disabled: uploading,
        noClick: hasAvatar,
        noKeyboard: hasAvatar,
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
        <div className="flex items-center gap-6">
            <div
                {...dropzoneProps}
                className={`relative group flex shrink-0 items-center justify-center w-32 h-32 max-md:w-24 max-md:h-24 rounded-full overflow-hidden cursor-pointer transition-colors
                ${!hasAvatar && (isDragActive ? 'border-primary bg-primary/5' : 'border-2 border-dashed border-muted-foreground/50 hover:border-my-accent')}
                ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <input {...getInputProps()} />

                {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary z-10" />
                ) : hasAvatar ? (
                    <>
                        <Image src={imageUrl!} alt="Avatar" fill unoptimized className="object-cover" />

                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-full">
                            <Camera className="w-8 h-8 text-white" strokeWidth={1.5} />
                        </div>

                        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute inset-0 cursor-pointer rounded-full"
                                    aria-label="Действия с аватаром"
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
                    <div className="flex items-center justify-center pointer-events-none">
                        <Camera className="w-8 h-8 text-muted-foreground hover:text-my-accent" />
                    </div>
                )}
            </div>
        </div>
    );
}
