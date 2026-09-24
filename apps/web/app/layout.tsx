import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'MEGHNETRA — Weather Intelligence', description: 'National Weather Big Data Analytics Platform' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
