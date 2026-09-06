'use client';

import React, { useState } from 'react';

import Link from 'next/link';

import { postForm } from '@/server-actions/post-form';
import { type AuthorWelcomeValues } from '@/shared/validations/schemas';

import { Button } from '../ui/button';
import { Card } from '../ui/card';

import Step1Info from './Step1Info';
import Step2Contacts from './Step2Contacts';
import Step3Shelves from './Step3Shelves';

export default function AuthorForm() {
    const [step, setStep] = useState(1);

    const [data, setData] = useState<Partial<AuthorWelcomeValues>>({
        activities: [],
        email: '',
        vkPersonal: '',
        publicLink: '',
        nickname: '',
        shelves: [],
        needRail: '',
    });

    const next = (values?: Partial<AuthorWelcomeValues>) => {
        if (values) {
            setData((prev) => ({ ...prev, ...values }));
        }
        setStep((s) => s + 1);
    };

    const back = () => setStep((s) => s - 1);

    const finish = async (values: Partial<AuthorWelcomeValues>) => {
        const finalData: AuthorWelcomeValues = {
            ...data,
            ...values,
        } as AuthorWelcomeValues;

        try {
            const result = await postForm(finalData);
            if (!result.success) throw new Error(result.error);

            setData({});
            setStep(4);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto mb-20 p-8 space-y-8 text-black">
            <h1 className="text-3xl font-semibold text-center">Анкета автора</h1>

            {step === 1 && <Step1Info onNext={() => next()} />}
            {step === 2 && <Step2Contacts defaultValues={data} onNext={next} onBack={back} />}
            {step === 3 && <Step3Shelves defaultValues={data} onBack={back} onSubmit={finish} />}
            {step === 4 && (
                <>
                    <h2 className="text-xl font-semibold text-center mt-2 mb-4">Заявка отправлена!</h2>
                    <Link href={'/'} className="w-full items-center">
                        <Button className="w-full">На главную</Button>
                    </Link>
                </>
            )}
        </Card>
    );
}
