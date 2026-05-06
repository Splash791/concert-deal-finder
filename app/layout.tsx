import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Concert Deal Finder',
  description: 'Find the best concert deals combining ticket prices with travel and accommodation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
