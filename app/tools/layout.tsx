// app/tools/layout.tsx - DEBUG VERSION
import React, { ReactNode } from "react";
import type { Metadata } from 'next';
// Comment out these imports temporarily to test
import PWARegistration from './components/PWARegistration';
// import NotificationProvider from './components/NotificationProvider';

interface ToolsLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: 'Tools - Ovrica',
  description: 'Access powerful PDF and AI tools with Apexion. Transform your documents with our suite of intelligent tools designed for productivity and efficiency.',
  keywords: ['PDF tools', 'AI tools', 'document processing', 'productivity', 'Apexion', 'file converter', 'text analysis'],
  authors: [{ name: 'Apexion Team' }],
  creator: 'Apexion',
  publisher: 'Apexion',

  // Robots and indexing
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

  // Canonical URL
  alternates: {
    canonical: 'https://apexion-2.vercel.app/tools',
  },

  // Open Graph tags
  openGraph: {
    title: 'Tools - Apexion | Powerful PDF & AI Tools',
    description: 'Access powerful PDF and AI tools with Apexion. Transform your documents with our suite of intelligent tools designed for productivity and efficiency.',
    url: 'https://apexion-2.vercel.app/tools',
    siteName: 'Apexion',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Apexion Tools - PDF & AI Tools Suite',
        type: 'image/png',
      },
      {
        url: '/favicon.ico',
        width: 32,
        height: 32,
        alt: 'Apexion Logo',
      },
    ],
  },

  // Twitter Card tags
  twitter: {
    card: 'summary_large_image',
    site: '@apexion',
    creator: '@apexion',
    title: 'Tools - Apexion | Powerful PDF & AI Tools',
    description: 'Access powerful PDF and AI tools with Apexion. Transform your documents with intelligent tools.',
    images: ['/og-image.png'],
  },

  // Favicon and icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#000000' },
    ],
  },

  // Mobile and viewport
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },

  // Theme color
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],

  // App-specific
  applicationName: 'Apexion',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',

  // Additional meta tags with PWA manifest
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Apexion Tools',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#000000',
    'msapplication-config': '/browserconfig.xml',
  },

  // Add manifest
  manifest: '/manifest.json',
};

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  // Add debug logging
  console.log('🔄 ToolsLayout rendering at:', new Date().toISOString());
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* STEP 1: Comment out EVERYTHING to test if layout metadata is the issue */}
      <PWARegistration /> 
      {/* <NotificationProvider> */}
        {children}
      {/* </NotificationProvider> */}
    </div>
  );
}