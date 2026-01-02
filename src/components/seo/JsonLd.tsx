import { APP_NAME, APP_DESCRIPTION } from '@/lib/config';

export function JsonLd() {
    const softwareLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: APP_NAME,
        description: 'Silent OPD / Patient Flow Control system designed for Individual doctors, Clinics, Nursing homes, Small hospitals in India. Token system for clinics.',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        author: {
            '@type': 'Person',
            name: 'Mehedi Hassan'
        },
        offers: {
            '@type': 'Offer',
            price: '2',
            priceCurrency: 'INR',
            priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: '2',
                priceCurrency: 'INR',
                referenceQuantity: {
                    '@type': 'QuantitativeValue',
                    value: '1',
                    unitCode: 'C62'
                }
            }
        },
    };

    const faqLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Do I need good internet for this to work?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No. Mr Compounder is optimized for 2G and unstable networks common in Tier-2 and Tier-3 cities. It is extremely lightweight.'
                }
            },
            {
                '@type': 'Question',
                name: 'Do patients need to install an app?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Absolutely not. Patients do not need to download anything. They get a token via SMS or WhatsApp and track status on a simple web link.'
                }
            },
            {
                '@type': 'Question',
                name: 'Is there a monthly fee?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No. We use a "pay-per-patient" model. You recharge your wallet (postpaid/prepaid) and only pay small fee (₹1-2) per patient served.'
                }
            },
            {
                '@type': 'Question',
                name: 'Can I manage multiple doctors?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. You can manage multiple queues and doctors from a single compounder dashboard.'
                }
            },
            {
                '@type': 'Question',
                name: 'What if the patient does not have a smartphone?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Mr Compounder works with simple feature phones too. You enter their number, and the system can trigger a regular phone call (if configured) or SMS.'
                }
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
            />
        </>
    );
}
