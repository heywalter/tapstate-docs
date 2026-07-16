import { source, getPageImage, getPageMarkdownUrl } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { docsBaseUrl } from '@/lib/shared';

const sectionInfo: Record<string, { label: string; href: string }> = {
  overview: { label: 'Get started', href: '/docs/overview/what-is-tapstate' },
  concepts: { label: 'Concepts', href: '/docs/concepts/dsl' },
  connectors: { label: 'Connectors', href: '/docs/connectors' },
  guides: { label: 'Guides', href: '/docs/guides/troubleshooting' },
  reference: { label: 'Reference', href: '/docs/reference/dsl-grammar' },
  'for-ai': { label: 'AI-ready docs', href: '/docs/for-ai/llms' },
};

type DocsPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export default async function Page(props: DocsPageProps) {
  const params = await props.params;
  const page = source.getPage(params.slug ?? []);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const isProductOverview = page.url === '/docs/overview/what-is-tapstate';
  const canonicalUrl = new URL(page.url, docsBaseUrl).toString();
  const section = sectionInfo[page.slugs[0]];
  const breadcrumbs = [
    { name: 'tapstate', item: docsBaseUrl },
    { name: 'Documentation', item: new URL('/docs', docsBaseUrl).toString() },
    ...(section ? [{ name: section.label, item: new URL(section.href, docsBaseUrl).toString() }] : []),
    ...(page.slugs.length > 0 && page.url !== section?.href
      ? [{ name: page.data.title, item: canonicalUrl }]
      : []),
  ];
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: page.data.title,
        description: page.data.description,
        url: canonicalUrl,
        mainEntityOfPage: canonicalUrl,
        inLanguage: 'en',
        publisher: { '@type': 'Organization', name: 'tapstate', url: docsBaseUrl },
        isPartOf: { '@type': 'WebSite', name: 'tapstate documentation', url: new URL('/docs', docsBaseUrl).toString() },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((breadcrumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          ...breadcrumb,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <DocsPage
        toc={page.data.toc}
        full={page.data.full}
        tableOfContentPopover={isProductOverview ? { enabled: false } : undefined}
      >
        {!isProductOverview ? (
          <>
            <DocsTitle>{page.data.title}</DocsTitle>
            <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
            <div className="flex flex-row gap-2 items-center border-b pb-6">
              <MarkdownCopyButton markdownUrl={markdownUrl} />
              <ViewOptionsPopover markdownUrl={markdownUrl} />
            </div>
          </>
        ) : null}
        <DocsBody>
          <MDX
            components={getMDXComponents({
              a: createRelativeLink(source, page),
            })}
          />
        </DocsBody>
      </DocsPage>
    </>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: DocsPageProps): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug ?? []);
  if (!page) notFound();

  const canonicalUrl = new URL(page.url, docsBaseUrl).toString();

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      images: getPageImage(page).url,
    },
  };
}
