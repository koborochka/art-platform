'use client';

import React, { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, CircleUserRound, LockKeyhole, LogOut, ShoppingBag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import OrderHistory from '@/app/(public)/profile/OrderHistory';
import { PhoneInput } from '@/components/shared/PhoneInput';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { PAGES } from '@/config/public-pages.config';
import { customerClientService } from '@/services/api/client/customer-client.service';
import { useAuthStore } from '@/services/store/auth/store';
import type { CustomerProfileUIProps, ICustomerUpdateInput } from '@/shared/types/customer.interface';
import { cn } from '@/shared/utils/tailwind';
import { emailSchema, fullNameSchema, phoneSchema } from '@/shared/validations/schemas';

const profileSchema = z.object({
    fullName: fullNameSchema,
    phone: phoneSchema,
});

const securitySchema = z.object({
    email: emailSchema,
    // Здесь не проверяем сложность (только наличие), т.к. это ввод старого пароля:
    password: z.string().min(1, 'Введите текущий пароль для подтверждения'),
});

type TabType = 'profile' | 'orders' | 'security';

const TAB_TITLES: Record<TabType, string> = {
    profile: 'Личные данные',
    orders: 'Заказы',
    security: 'Параметры входа',
};

export default function CustomerProfileUI({ customerData }: CustomerProfileUIProps) {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);

    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [showMobileContent, setShowMobileContent] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: { fullName: customerData.fullName || '', phone: customerData.phone || '' },
    });

    const securityForm = useForm({
        resolver: zodResolver(securitySchema),
        defaultValues: { email: customerData.email || '', password: '' },
    });

    const resetAlerts = () => {
        setError('');
        setSuccess('');
    };

    const selectTab = (tab: TabType) => {
        setActiveTab(tab);
        setShowMobileContent(true);
        resetAlerts();
    };
    const handleBack = () => {
        setShowMobileContent(false);
        resetAlerts();
    };

    const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
        setLoading(true);
        resetAlerts();

        try {
            // TODO: по хорошему формировать updated исходя из того, что изменилось, делать проверки
            // Но в целом данных мало, так что пока просто обновляем всё
            const updated: ICustomerUpdateInput = { ...data, addresses: customerData.addresses };

            const result = await customerClientService.updateProfile(updated);
            if (result.success) {
                setSuccess('Данные успешно обновлены');
                profileForm.reset(data);
            } else setError(result.error || 'Ошибка при обновлении профиля');
        } finally {
            setLoading(false);
        }
    };

    // Обработчик обновления Email (требует пароль)
    const onSecuritySubmit = async (data: z.infer<typeof securitySchema>) => {
        setLoading(true);
        resetAlerts();
        try {
            const result = await customerClientService.updateProfile(data);
            if (result.success) {
                setSuccess('Email успешно изменён.');
                securityForm.setValue('password', '');
            } else setError(result.error || 'Ошибка при изменении Email');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        setResetLoading(true);
        resetAlerts();

        try {
            const result = await customerClientService.requestPasswordReset(customerData.email);
            if (result.success)
                setSuccess('Ссылка для изменения пароля отправлена на вашу почту. Проверьте входящие или спам.');
            else setError(result.error || 'Ошибка при запросе смены пароля');
        } finally {
            setResetLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.replace(PAGES.LOGIN);
    };

    const tabs = [
        { id: 'profile' as const, label: 'Личные данные', icon: CircleUserRound },
        { id: 'orders' as const, label: 'Заказы', icon: ShoppingBag },
        { id: 'security' as const, label: 'Параметры входа', icon: LockKeyhole },
    ];

    // TODO: loading и error компоненты

    return (
        <div className="wrap px-3 lg:px-0">
            <h1 className={cn('text-xl font-semibold text-my-primary mb-6 md:hidden', showMobileContent && 'hidden')}>
                Профиль
            </h1>

            <div className="grid grid-cols-12 gap-0 md:gap-16">
                <aside
                    className={cn(
                        'col-span-12 h-fit md:col-span-3',
                        'md:bg-gray-50 md:p-6 md:pb-4 md:pt-4 md:rounded-md',
                        showMobileContent && 'hidden md:block',
                    )}
                >
                    <nav className={cn('flex flex-col space-y-2', 'mb-8 md:mb-0', 'md:pb-[1.625rem]')}>
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => selectTab(tab.id)}
                                    className={cn(
                                        'flex gap-2 py-2 md:py-2.5 cursor-pointer items-center transition-colors',
                                        'text-sm md:text-base font-medium',
                                        isActive ? 'md:text-my-accent md:font-medium' : 'hover:text-my-accent',
                                    )}
                                >
                                    <Icon size={24} strokeWidth={1.5} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>

                    <Separator className="hidden md:block bg-gray-200" />

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className={cn(
                            'flex gap-2 cursor-pointer hover:text-red-500 transition-colors w-full text-left items-center',
                            'text-sm md:text-base ',
                            'py-3 py-0 md:pt-[1.625rem]',
                        )}
                    >
                        <LogOut size={24} strokeWidth={1.5} />
                        Выйти
                    </button>
                </aside>

                <main
                    className={cn(
                        'col-span-12 md:col-span-9 space-y-6 md:space-y-8',
                        !showMobileContent && 'hidden md:block',
                    )}
                >
                    <Breadcrumb className="md:hidden">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    onClick={handleBack}
                                    className="flex items-center gap-2 p-1.5 cursor-pointer text-base font-semibold text-my-secondary hover:text-my-primary"
                                >
                                    <ChevronLeft className="size-6" strokeWidth={1.5} />
                                    Профиль
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <h2
                        className={cn(
                            'font-semibold text-my-primary font-medium text-xl md:text-[1.75rem]',
                            activeTab === 'profile' && 'md:hidden',
                        )}
                    >
                        {TAB_TITLES[activeTab]}
                    </h2>

                    {activeTab === 'profile' && (
                        <ProfileSection form={profileForm} loading={loading} onSubmit={onProfileSubmit} />
                    )}

                    {activeTab === 'orders' && <OrderHistory customerId={customerData.id} />}

                    {activeTab === 'security' && (
                        <SecuritySection
                            customerEmail={customerData.email}
                            securityForm={securityForm}
                            loading={loading}
                            resetLoading={resetLoading}
                            onSecuritySubmit={onSecuritySubmit}
                            onPasswordReset={handlePasswordReset}
                        />
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert className="bg-green-50 border-green-200 text-green-800">
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}
                </main>
            </div>

            <LogoutConfirmDialog
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
}

function ProfileSection({
    form,
    loading,
    onSubmit,
}: {
    form: ReturnType<typeof useForm<{ fullName: string; phone: string }>>;
    loading: boolean;
    onSubmit: (data: { fullName: string; phone: string }) => void;
}) {
    const isDirty = form.formState.isDirty;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 md:gap-8">
                <div className="hidden md:flex justify-between items-center">
                    <h1 className="text-[1.75rem] font-semibold">Личные данные</h1>
                    <Button type="submit" disabled={loading || !isDirty}>
                        {loading ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                </div>

                <Alert variant="infoBlue" className="py-2 px-3">
                    <AlertDescription className="text-base font-[450] text-my-secondary">
                        Указанные ниже данные используются для оформления доставки. При необходимости, данные можно
                        будет изменить на этапе оформления заказа.
                    </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem className="flex flex-col gap-1.5 space-y-0">
                                <FormLabel className="text-base font-[450] text-my-secondary">ФИО</FormLabel>
                                <FormControl>
                                    <Input placeholder="Введите ФИО" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem className="flex flex-col gap-1.5 space-y-0">
                                <FormLabel className="text-base font-[450] text-my-secondary">Телефон</FormLabel>
                                <FormControl>
                                    <PhoneInput {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={loading || !isDirty} className="md:hidden w-full mt-2">
                    {loading ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
            </form>
        </Form>
    );
}

function SecuritySection({
    customerEmail,
    securityForm,
    loading,
    resetLoading,
    onSecuritySubmit,
    onPasswordReset,
}: {
    customerEmail: string;
    securityForm: ReturnType<typeof useForm<{ email: string; password: string }>>;
    loading: boolean;
    resetLoading: boolean;
    onSecuritySubmit: (data: { email: string; password: string }) => void;
    onPasswordReset: () => void;
}) {
    const watchedEmail = securityForm.watch('email');
    const watchedPassword = securityForm.watch('password');
    const isEmailButtonDisabled = loading || watchedEmail === customerEmail || !watchedPassword;

    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="flex flex-col gap-4 md:">
                    <div className="flex items-center justify-between">
                        <p className="text-base md:text-xl font-semibold text-my-primary">Email</p>
                        <Button
                            type="submit"
                            disabled={isEmailButtonDisabled}
                            className="hidden md:flex h-auto min-h-0 py-2 px-3"
                        >
                            {loading ? 'Сохранение...' : 'Изменить email'}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={securityForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-1.5 space-y-0">
                                    <FormControl>
                                        <Input placeholder="Новый email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={securityForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-1.5 space-y-0">
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Текущий пароль для подтверждения"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button type="submit" disabled={isEmailButtonDisabled} className="md:hidden w-full">
                        {loading ? 'Сохранение...' : 'Изменить email'}
                    </Button>
                </form>
            </Form>

            <Separator color="gray-200" />

            <div className="flex flex-col gap-4 md:gap-6">
                <div className="flex items-center justify-between">
                    <p className="text-base md:text-xl font-semibold text-my-primary">Пароль</p>
                    <Button
                        type="button"
                        onClick={onPasswordReset}
                        disabled={resetLoading}
                        className="hidden md:flex h-auto min-h-0 py-2 px-3"
                    >
                        {resetLoading ? 'Отправка...' : 'Изменить пароль'}
                    </Button>
                </div>

                <Alert variant="infoBlue" className="py-3">
                    <AlertDescription className="text-base font-[450] text-my-secondary">
                        Смена пароля производится через подтверждение по электронной почте. Мы отправим письмо со
                        специальной ссылкой на ваш текущий email. Проверьте «Входящие» и «Спам».
                    </AlertDescription>
                </Alert>

                <Button type="button" onClick={onPasswordReset} disabled={resetLoading} className="md:hidden w-full">
                    {resetLoading ? 'Отправка...' : 'Изменить пароль'}
                </Button>
            </div>
        </div>
    );
}

function ConfirmDialogHeader({ title }: { title: string }) {
    return (
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-6 shrink-0">
            <DialogTitle className="text-xl font-semibold text-my-primary leading-none">{title}</DialogTitle>
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
    );
}

function ConfirmDialogFooter({
    onCancel,
    onConfirm,
    cancelLabel = 'Отмена',
    confirmLabel,
    confirmVariant = 'destructive',
    loading,
    loadingLabel,
}: {
    onCancel: () => void;
    onConfirm: () => void;
    cancelLabel?: string;
    confirmLabel: string;
    confirmVariant?: 'destructive' | 'default' | 'secondary';
    loading?: boolean;
    loadingLabel?: string;
}) {
    return (
        <div className="border-t border-gray-200 p-5 flex items-center justify-between shrink-0">
            <Button
                type="button"
                variant="empty"
                onClick={onCancel}
                disabled={loading}
                className="text-my-accent hover:text-my-accent-hover font-semibold h-auto min-h-0 py-2.5 px-2"
            >
                {cancelLabel}
            </Button>
            <Button
                type="button"
                variant={confirmVariant}
                onClick={onConfirm}
                disabled={loading}
                className="h-auto min-h-0 py-2.5 px-2"
            >
                {loading && loadingLabel ? loadingLabel : confirmLabel}
            </Button>
        </div>
    );
}

function LogoutConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md flex flex-col p-0 gap-0" showCloseButton={false}>
                <ConfirmDialogHeader title="Выход из аккаунта" />
                <div className="p-5">
                    <DialogDescription className="text-base font-[450] text-my-primary leading-snug">
                        Вы действительно хотите выйти из аккаунта?
                    </DialogDescription>
                </div>
                <ConfirmDialogFooter onCancel={onClose} onConfirm={onConfirm} confirmLabel="Выйти" />
            </DialogContent>
        </Dialog>
    );
}
