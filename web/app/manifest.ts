import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ProSite — Remodeling OS',
    short_name: 'ProSite',
    description: 'Run your entire remodeling business from one place',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#1C2B3A',
    theme_color: '#E8834A',
    icons: [
      { src: '/logo.png', sizes: '192x192', type: 'image/png' },
      { src: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
