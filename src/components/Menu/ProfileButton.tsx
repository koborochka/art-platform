'use client';

import React from 'react';

import { CircleUserRound } from 'lucide-react';
import Link from 'next/link';

import { PAGES } from '@/config/public-pages.config';

export default function ProfileButton({ isActive, isRegistered }: { isActive: boolean; isRegistered: boolean }) {
    const href = isRegistered ? PAGES.PROFILE : PAGES.LOGIN;

    return (
        <Link href={href}>
            <div className="p-2 cursor-pointer">
                <CircleUserRound strokeWidth={1.5} size={24} className={`${isActive && 'text-my-accent'}`} />
            </div>
        </Link>
    );
}
