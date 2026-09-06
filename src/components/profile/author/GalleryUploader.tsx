'use client';

import React, { useCallback, useState } from 'react';

import { Loader2, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';

import { authorClientService } from '@/services/api/client/author-client.service';
import { isImageData } from '@/shared/guards/image.guard';
import type { Media } from '@/shared/types/payload-types';
import type { IGalleryItem } from '@/shared/types/product.type';
import { cn } from '@/shared/utils/tailwind';

interface GalleryUploaderProps {
    value: IGalleryItem[];
    onChange: (gallery: IGalleryItem[]) => void;
}

const ACCEPTED_FORMATS = 'JPG, GIF, PNG, WEBP или HEIC/HEIF';

export default function GalleryUploader({ value, onChange }: GalleryUploaderProps) {
    const [uploading, setUploading] = useState(false);

    const upload = useCallback(async (file: File): Promise<Media | null> => {
        const res = await authorClientService.uploadMedia(file);
        if (res.success && res.media) return res.media;
        return null;
    }, []);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (!acceptedFiles.length) return;
            setUploading(true);
            try {
                const uploaded: IGalleryItem[] = [];
                for (const file of acceptedFiles) {
                    const media = await upload(file);
                    if (media) uploaded.push({ id: null, image: media });
                }
                if (uploaded.length) onChange([...value, ...uploaded]);
            } finally {
                setUploading(false);
            }
        },
        [upload, value, onChange],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        disabled: uploading,
    });

    const removeImage = (index: number) => {
        const newGallery = [...value];
        newGallery.splice(index, 1);
        onChange(newGallery);
    };

    return (
        <div className="flex flex-col gap-[1.5rem] md:gap-9">
            <div
                {...getRootProps()}
                className={cn(
                    'relative flex items-center justify-center w-full min-h-24 md:min-h-36 rounded-lg border-2 border-dashed transition-colors cursor-pointer px-6 py-3.5 md:py-8',
                    isDragActive
                        ? 'border-my-accent bg-my-secondary-background'
                        : 'border-my-disabled hover:border-my-accent',
                    uploading && 'opacity-60 pointer-events-none',
                )}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-7 h-7 animate-spin text-my-accent" />
                        <p className="text-sm text-my-tertriary">Загрузка...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
                        <Plus className="w-6 h-6 text-my-secondary" strokeWidth={1.5} />
                        <p className="text-base font-medium text-my-primary">Загрузить фотографии</p>
                        <p className="text-xs text-my-tertriary">Доступные форматы — {ACCEPTED_FORMATS}</p>
                    </div>
                )}
            </div>

            {value.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                    {value.map((item, idx) => {
                        const media = item.image;
                        const url = isImageData(media) ? media.url : null;
                        return (
                            <div
                                key={item.id ?? `new-${idx}`}
                                className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100"
                            >
                                {url ? (
                                    <Image
                                        src={url}
                                        alt={`Фото ${idx + 1}`}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-my-tertriary">
                                        Нет фото
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    aria-label="Удалить фотографию"
                                    className="absolute top-1.5 right-1.5 w-8 h-8 flex items-center justify-center rounded-md bg-white text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-50"
                                >
                                    <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
