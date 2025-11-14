import { notFound } from 'next/navigation';
import { getStaticContent } from '@/utils/staticContent';
import InfoPageLayout from '@/app/components/InfoPage/InfoPageLayout';
import type { Metadata } from 'next';

const VALID_SLUGS = ['terms-of-service', 'help-center', 'legal', 'privacy-policy'];

type PageParams = {
  lang: 'en' | 'es';
  slug: string;
};

// ----- METADATA -----
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { lang, slug } = params as PageParams;

  if (!VALID_SLUGS.includes(slug)) {
    return { title: 'Not Found' };
  }

  const content = getStaticContent(slug, lang);
  const canonicalUrl = `https://barciastech.com/${lang}/pages/${slug}`;

  const pageTitle =
    content?.title ||
    slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return {
    title: `${pageTitle} | Barcias Tech`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      url: canonicalUrl,
      type: 'article',
    },
  };
}

// ----- PAGE COMPONENT -----
export default function InfoPage({ params }: any) {
  const { lang, slug } = params as PageParams;

  if (!VALID_SLUGS.includes(slug)) {
    notFound();
  }

  const contentData = getStaticContent(slug, lang);

  if (!contentData) {
    notFound();
  }

  return <InfoPageLayout contentData={contentData} />;
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
