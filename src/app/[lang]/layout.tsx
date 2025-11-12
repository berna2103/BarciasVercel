// src/app/[lang]/layout.tsx

import React from 'react';
import { notFound } from 'next/navigation';
import LocaleWrapper from './LocaleWrapper';
import { getDictionary } from '../i18n';
import type { Metadata } from 'next' // Import Metadata type
import { URL } from 'url'; // Ensure URL is correctly imported if needed

// Define supported locales (must match middleware)
const supportedLocales = ['en', 'es']; 

// Define types for params as a Promise, which is required by your environment
type LayoutParams = { lang: 'en' | 'es' };

// 1. DYNAMIC METADATA GENERATION (Server Component)
export async function generateMetadata({ params }: { params: Promise<LayoutParams> }): Promise<Metadata> {
  const resolvedParams = await params; // Await the promise to get the object
  const dict = await getDictionary(resolvedParams.lang);
  
  const langCode = resolvedParams.lang === 'es' ? 'es_ES' : 'en_US';
  const canonicalUrl = `https://barciastech.com/${resolvedParams.lang}`;
  
  // Use headline from the dictionary for title and description
  const title = dict.hero.headline.split(':')[0] || "Barcias Tech | Local Pro Lead Engine"; 
  const description = dict.hero.subHeadline.replace(/<[^>]*>?/gm, '') + " Book a free AI Growth Blueprint Session to see our guaranteed lead generation process for Plumbers, Electricians, Roofers, Junk Removal and Landscapers in Chicago, IL and NW Indiana.";

  // Use string for metadataBase to avoid issues if URL is not a constructor
  const metadataBase = new URL('https://barciastech.com');

  return {
    metadataBase: metadataBase,
    title: title,
    description: description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: title,
      description: description,
      url: canonicalUrl,
      locale: langCode,
      type: 'website',
      siteName: 'Barcias Tech',
    },
  };
}

// 2. SCHEMA MARKUP DEFINITION (Server Component)
const LocalBusinessSchema = async (params: Promise<LayoutParams>) => {
    const { lang } = await params;
    const isEs = lang === 'es';
    // Fetch dictionary to ensure translation is available for schema
    const dict = await getDictionary(lang); 
    
    // Using dictionary content for dynamic FAQ schema
    const faqData = isEs ? [
        { q: "Garantía de Rendimiento", a: "Garantizamos un lead calificado en 30 días o trabajamos gratis." },
        { q: "Valor de $4,500", a: "Incluye sitio web, SEO local avanzado, y kit de marca física." },
        { q: "Foco Geográfico", a: "Solo negocios de Landscapers, Roofers, Servicio de Limpieza, Electricistas, Plomeros en Chicago y el Noroeste de Indiana." },
    ] : [
        { q: "30-Day Performance Guarantee", a: "We guarantee one qualified lead within 30 days or we work for free." },
        { q: "$4,500 Value Breakdown", a: "Includes website, advanced local SEO, and physical branding kit." },
        { q: "Geographic Focus", a: "Exclusively trade businesses in Chicago and NW Indiana." },
    ];
    
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqData.map((item: any) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
            },
        })),
    };

    const localBusinessSchema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Barcias Tech | Local Pro Lead Engine',
        description: dict.hero.subHeadline.replace(/<[^>]*>?/gm, ''), // Use localized subHeadline
        image: 'https://barciastech.com/images/logo/logo.png',
        url: `https://barciastech.com/${lang}`,
        telephone: '+1-708-314-0477',
        address: {
            '@type': 'PostalAddress',
            streetAddress: '11319 S Green Bay Ave',
            addressLocality: 'Chicago',
            addressRegion: 'IL',
            postalCode: '60617',
            addressCountry: 'US',
        },
        areaServed: [
            { '@type': 'City', name: 'Chicago, IL' },
            { '@type': 'State', name: 'Northwest Indiana' },
            { '@type': 'City', name: 'Cicero, IL' },
        ],
        priceRange: '$$',
        sameAs: [
            // List social profiles here
        ]
    };
    
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
            />
             <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </>
    );
};

// 3. DEFAULT EXPORT LAYOUT
// Re-using the working Promise signature
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<LayoutParams>; // <-- Keep the Promise wrapper
}) {
  
  // Await the promise to get the actual lang object
  const { lang } = await params;

  // 1. Validate the locale against the supported list
  if (!supportedLocales.includes(lang)) {
    // If the URL segment does not match a supported locale, show 404
    notFound(); 
  }

  // 2. Render the client-side wrapper component, passing children and locale
  return (
    <LocaleWrapper lang={lang}>
        {/* Inject Schema Markup here (Note the await before calling it) */}
        {await LocalBusinessSchema(params)}
        {children}
    </LocaleWrapper>
  );
}