// src/app/[lang]/layout.tsx

import React from 'react';
import { notFound } from 'next/navigation';
import LocaleWrapper from './LocaleWrapper'; // Import the new component

// Define supported locales (must match middleware)
const supportedLocales = ['en', 'es']; 

export default async function LocaleLayout({
  children,
  params,
}: { 
  children: React.ReactNode; 
  // Explicitly define params as a Promise to resolve build constraint error
  params: Promise<{ lang: 'en' | 'es' }>; 
}) {
  
  // Await the promise to get the actual lang object, resolving the runtime error
  const { lang } = await params;

  // 1. Validate the locale against the supported list
  if (!supportedLocales.includes(lang)) {
    // If the URL segment does not match a supported locale, show 404
    notFound(); 
  }

  // 2. Render the client-side wrapper component, passing children and locale
  return (
    <LocaleWrapper lang={lang}>
        {children}
    </LocaleWrapper>
  );
}