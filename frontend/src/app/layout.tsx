import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EcoTrend — Long-Term Environmental Intelligence Platform',
  description: 'Multi-domain environmental data ingestion, standardization, cleaning pipeline, spatial location hierarchy, and deterministic historical statistical analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="min-h-screen bg-eco-bg text-eco-text antialiased">
        {children}
      </body>
    </html>
  );
}
