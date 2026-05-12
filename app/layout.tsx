import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PrimeHomes Malawi | Powered by Rasta Kadema',
    template: '%s | PrimeHomes Malawi',
  },
  description:
    'Find your dream home in Malawi. Browse properties for sale and rent across Lilongwe, Blantyre, and more. Powered by Rasta Kadema.',
  keywords: [
    'Malawi real estate',
    'homes for sale Malawi',
    'property Malawi',
    'Rasta Kadema',
    'Kadema',
    'PrimeHomes Malawi',
    'houses for rent Malawi',
    'Lilongwe property',
    'Blantyre property',
  ],
  authors: [{ name: 'Rasta Kadema', url: 'https://cheza-x-malawi.vercel.app' }],
  creator: 'Rasta Kadema',
  publisher: 'Kadema',
  metadataBase: new URL('https://primehomesmalawi.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_MW',
    url: 'https://primehomesmalawi.vercel.app',
    siteName: 'PrimeHomes Malawi',
    title: 'PrimeHomes Malawi | Powered by Rasta Kadema',
    description:
      'Discover premium properties for sale and rent in Malawi. Powered by Rasta Kadema.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrimeHomes Malawi | Powered by Rasta Kadema',
    description: 'Find your dream home in Malawi. Powered by Rasta Kadema.',
    creator: '@rastakadema',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
