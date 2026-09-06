'use client';

import React, { useEffect, useState } from 'react';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';

export interface ConfirmDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode;
    confirmLabel?: string;
    loadingLabel?: string;
    loading?: boolean;
}

// Универсальная модалка подтверждения удаления (десктоп / мобилка)
// TODO: повыносить компоненты похожим образом
export function ConfirmDeleteDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Удалить',
    loadingLabel = 'Удаление...',
    loading = false,
}: ConfirmDeleteDialogProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent side="bottom" showCloseButton={false} className="p-0 rounded-t-2xl overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-[1.125rem] shrink-0">
                        <SheetTitle className="text-[1rem] font-semibold text-my-primary leading-none">
                            {title}
                        </SheetTitle>
                        <SheetClose asChild>
                            <button
                                type="button"
                                aria-label="Закрыть"
                                className="flex items-center justify-center w-6 h-6 shrink-0 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <X size={24} strokeWidth={1.5} />
                            </button>
                        </SheetClose>
                    </div>

                    <SheetDescription className="sr-only">{title}</SheetDescription>

                    <div className="p-4">
                        <p className="text-[0.875rem] font-semibold text-my-primary leading-snug">{description}</p>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-4 flex flex-col-reverse gap-2 shrink-0">
                        <Button
                            type="button"
                            variant="empty"
                            onClick={onClose}
                            disabled={loading}
                            className="text-my-accent hover:text-my-accent-hover font-semibold h-auto min-h-0 py-2.5 px-2 w-full"
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onConfirm}
                            disabled={loading}
                            className="h-auto min-h-0 py-2.5 px-2 w-full"
                        >
                            {loading ? loadingLabel : confirmLabel}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md flex flex-col p-0 gap-0" showCloseButton={false}>
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-6 shrink-0">
                    <DialogTitle className="text-xl md:text-2xl font-semibold text-my-primary leading-none">
                        {title}
                    </DialogTitle>
                    <DialogClose asChild>
                        <button
                            type="button"
                            aria-label="Закрыть"
                            className="flex items-center justify-center w-6 h-6 shrink-0 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <X size={24} strokeWidth={1.5} />
                        </button>
                    </DialogClose>
                </div>

                <div className="p-5">
                    <DialogDescription className="text-base font-[450] text-my-primary leading-snug">
                        {description}
                    </DialogDescription>
                </div>

                <div className="border-t border-gray-200 p-5 flex items-center justify-between shrink-0">
                    <Button
                        type="button"
                        variant="empty"
                        onClick={onClose}
                        disabled={loading}
                        className="text-my-accent hover:text-my-accent-hover font-semibold h-auto min-h-0 py-2.5 px-2"
                    >
                        Отмена
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                        className="h-auto min-h-0 py-2.5 px-2"
                    >
                        {loading ? loadingLabel : confirmLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
