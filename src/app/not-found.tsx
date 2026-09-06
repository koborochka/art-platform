import Link from 'next/link';

import { PAGES } from '@/config/public-pages.config';

export default function NotFound() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">404</h1>
            <Link href={PAGES.HOME} className="hover:underline">
                На главную
            </Link>
        </div>
    );
}
