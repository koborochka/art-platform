'use client';

import React from 'react';

import clsx from 'clsx';
import Link from 'next/link';

import type { IMenuItem } from './menu.data';

export interface IMenuItemProps {
    menuItem: IMenuItem;
    isActive: boolean;
}

export function MenuItem({ menuItem, isActive }: IMenuItemProps) {
    return (
        <Link href={menuItem.href} className={clsx('py-2.5 hover:underline', isActive && 'text-my-accent')}>
            {menuItem.name}
        </Link>
    );
}
