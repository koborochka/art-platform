import type { PropsWithChildren } from 'react';

import JsonLd from '@/components/seo/JsonLd';
import Footer from '@/components/shared/Footer';
import { Header } from '@/components/shared/Header';
import { MobileNav } from '@/components/shared/MobileNav';
import { organizationJsonLd, webSiteJsonLd } from '@/shared/utils/jsonld';

export default function Layout({ children }: PropsWithChildren<unknown>) {
    return (
        <>
            <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
            <Header />
            <main className="mt-2 sm:mt-0 min-h-[85vh]">{children}</main>
            <Footer />
            <MobileNav />
        </>
    );
}
