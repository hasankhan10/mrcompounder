import { MetadataRoute } from 'next';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/config';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: APP_NAME,
        short_name: 'Mr Compounder',
        description: APP_DESCRIPTION,
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
