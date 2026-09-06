'use client';

import { useEffect, useMemo, useState } from 'react';

interface TimerProps {
    startTime: string | Date;
    durationMinutes: number;
    expiredText?: string;
    className?: string;
    onExpire?: () => void;
}

export function Timer({
    startTime,
    durationMinutes,
    expiredText = 'Время истекло',
    className = '',
    onExpire,
}: TimerProps) {
    const expiryTime = useMemo(() => {
        return new Date(startTime).getTime() + durationMinutes * 60 * 1000;
    }, [startTime, durationMinutes]);

    const [now, setNow] = useState(Date.now());

    const timeLeft = Math.max(0, expiryTime - now);

    useEffect(() => {
        if (timeLeft <= 0) {
            onExpire?.();
            return;
        }

        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, onExpire]);

    if (timeLeft <= 0) {
        return <span className={`text-destructive font-bold ${className}`}>{expiredText}</span>;
    }

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    return (
        <span className={className}>
            {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
    );
}
