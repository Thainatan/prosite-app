import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Finesse Workspace',
    short_name: 'finesse.',
    description: 'Your Finesse Workspace — quotes, projects, invoices, and more',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#1C2B3A',
    theme_color: '#C4685A',
    icons: [
      { src: '/logo.png', sizes: '192x192', type: 'image/png' },
      { src: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
