import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'D31',
    short_name: 'D31',
    start_url: '/',
    display: 'standalone',
    background_color: '#07070b',
    theme_color: '#00D2BE',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  }
}
