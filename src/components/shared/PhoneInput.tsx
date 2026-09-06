import React, { forwardRef } from 'react';

import { useIMask } from 'react-imask';

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    onChange?: (value: string) => void;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(({ onChange, ...restProps }, forwardedRef) => {
    const { ref, value, setValue } = useIMask(
        { mask: '+7 (000) 000 00-00' },
        {
            onAccept: (val) => {
                onChange?.(val);
            },
        },
    );

    return (
        <input
            ref={(node) => {
                ref.current = node;
                if (typeof forwardedRef === 'function') forwardedRef(node);
                else if (forwardedRef) forwardedRef.current = node;
            }}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            {...restProps}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
    );
});
