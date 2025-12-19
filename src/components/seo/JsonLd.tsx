import { APP_NAME, APP_DESCRIPTION } from '@/lib/config';

export function JsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: APP_NAME,
        description: APP_DESCRIPTION,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        author: {
            '@type': 'Person',
            name: 'Mehedi Hassan'
        },
        creator: {
            '@type': 'Person',
            name: 'Mehedi Hassan'
        },
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
