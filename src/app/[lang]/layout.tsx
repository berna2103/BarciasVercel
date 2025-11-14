// src/app/[lang]/layout.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import LocaleWrapper from './LocaleWrapper';
import { getDictionary } from '../i18n';
import type { Metadata } from 'next';

type LayoutParams = { lang: 'en' | 'es' };
const supportedLocales = ['en', 'es'];

/**
 * Helper — safely build absolute URL for metadataBase
 */
const buildMetadataBase = () => {
  try {
    return new URL('https://barciastech.com');
  } catch {
    // Fallback string if URL constructor is not available in the runtime
    return 'https://barciastech.com';
  }
};

/**
 * 1) DYNAMIC METADATA (Server Component)
 */
export async function generateMetadata({ params }: { params: Promise<LayoutParams> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const canonicalUrl = `https://barciastech.com/${lang}`;
  const langCode = lang === 'es' ? 'es-ES' : 'en-US';

  // Style C (Local SEO Focused)
  const title = lang === 'es'
    ? 'Clientes Locales para Contratistas en Chicago | Roofing, Plumbing, Electrical, Landscaping & Junk Removal – Garantizado'
    : 'Chicago Local Contractor Leads | Roofing, Plumbing, Electrical, Landscaping & Junk Removal – Guaranteed';

  // Keep description concise < ~160 chars
  const description = lang === 'es'
    ? 'Leads locales garantizados para contratistas en Chicago. Sistema probado de 30 días para roofers, plomeros, electricistas, paisajismo y junk removal.'
    : 'Guaranteed local leads for Chicago contractors. Proven 30-day system delivering real calls for roofers, plumbers, electricians, landscapers and junk removal.';

// Remove buildMetadataBase entirely

// Inside generateMetadata():
const metadataBase = new URL('https://barciastech.com');

return {
  metadataBase,
  title,
  description,
  keywords: [
    'local contractor leads',
    'Chicago leads',
    'roofing leads Chicago',
    'plumber leads Chicago',
    'electrician leads Chicago',
    'landscaping leads Chicago',
    'junk removal leads',
    'local SEO contractors',
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      'en-US': 'https://barciastech.com/en',
      'es-ES': 'https://barciastech.com/es',
    },
  },
  openGraph: {
    title,
    description,
    url: canonicalUrl,
    locale: langCode,
    type: 'website',
    siteName: 'Barcias Tech',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

}

/**
 * 2) SCHEMA MARKUP (Server Component)
 * Returns React nodes with JSON-LD scripts for LocalBusiness + FAQ
 */
const LocalBusinessSchema = async (params: Promise<LayoutParams>) => {
  const { lang } = await params;
  const isEs = lang === 'es';
  const dict = await getDictionary(lang);

  // FAQ entries (localized + service-focused)
  const faqData = isEs ? [
    {
      q: "¿Cuánto tiempo para conseguir el primer lead?",
      a: "Garantizamos al menos un lead calificado dentro de 30 días o trabajamos gratis.",
    },
    {
      q: "¿Qué incluye el paquete de $4,500?",
      a: "Sitio web optimizado, SEO local avanzado, gestión de campañas y un kit de marca física.",
    },
    {
      q: "¿En qué zonas trabajan?",
      a: "Atendemos negocios comerciales y residenciales en Chicago y el Noroeste de Indiana.",
    },
    {
      q: "¿Con qué oficios trabajan?",
      a: "Roofers, Plumbers, Electricians, Landscapers y Junk Removal — enfoque exclusivo por territorio para evitar competencia directa.",
    },
    {
      q: "¿Cómo se mide la calidad del lead?",
      a: "Validamos que la llamada sea de un cliente real con intención de contratar y con detalles del trabajo.",
    },
  ] : [
    {
      q: "How fast can I get my first lead?",
      a: "We guarantee at least one qualified lead within 30 days or we work for free.",
    },
    {
      q: "What does the $4,500 package include?",
      a: "Includes an optimized website, advanced local SEO, campaign management and a physical branding kit.",
    },
    {
      q: "Which areas do you serve?",
      a: "We serve both commercial and residential clients in Chicago and Northwest Indiana.",
    },
    {
      q: "Which trades do you work with?",
      a: "Roofers, Plumbers, Electricians, Landscapers and Junk Removal — we protect territory exclusivity.",
    },
    {
      q: "How do you qualify leads?",
      a: "We validate calls for genuine hiring intent and job details before delivering as qualified leads.",
    },
  ];

  // LocalBusiness schema
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://barciastech.com/#localbusiness',
    name: 'Barcias Tech | Local Pro Lead Engine',
    description: dict?.hero?.subHeadline ? dict.hero.subHeadline.replace(/<[^>]*>?/gm, '') : (isEs ? 'Generación de leads locales para contratistas en Chicago.' : 'Local lead generation for contractors in Chicago.'),
    image: 'https://barciastech.com/images/logo/logo.png',
    url: `https://barciastech.com/${lang}`,
    telephone: '+1-708-314-0477',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '11319 S Green Bay Ave',
      addressLocality: 'Chicago',
      addressRegion: 'IL',
      postalCode: '60617',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.689,
      longitude: -87.535,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday','Tuesday','Wednesday','Thursday','Friday'
        ],
        opens: '08:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday','Sunday'],
        opens: '09:00',
        closes: '16:00'
      }
    ],
    areaServed: [
      { '@type': 'City', name: 'Chicago' },
      { '@type': 'AdministrativeArea', name: 'Illinois' },
      { '@type': 'AdministrativeArea', name: 'Northwest Indiana' }
    ],
    serviceType: [
      'Roofing lead generation',
      'Plumbing lead generation',
      'Electrical lead generation',
      'Landscaping lead generation',
      'Junk removal lead generation'
    ],
    sameAs: [
      // Add social profiles (Facebook, LinkedIn, etc.) to strengthen schema trust
      // Example: 'https://www.facebook.com/yourpage'
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
};

/**
 * 3) DEFAULT EXPORT LAYOUT
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<LayoutParams>;
}) {
  const { lang } = await params;

  if (!supportedLocales.includes(lang)) {
    notFound();
  }

  return (
    <LocaleWrapper lang={lang}>
      {/* Inject structured data */}
      {await LocalBusinessSchema(params)}
      {children}
    </LocaleWrapper>
  );
}
