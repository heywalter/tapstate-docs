import { source, getPageImage, getPageMarkdownUrl, getPublicDocPages, isPublicDocPage } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { Aside, getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { docsBaseUrl } from '@/lib/shared';
import {
  getConnectorDocumentationStatus,
  getConnectorProductProfile,
} from '@/lib/connector-directory';

const sectionInfo: Record<string, { label: string; href: string }> = {
  overview: { label: 'Get started', href: '/docs/overview/what-is-tapstate' },
  concepts: { label: 'Understand tapstate', href: '/docs/concepts/dsl' },
  connectors: { label: 'Connectors', href: '/docs/connectors' },
  guides: { label: 'Build and operate', href: '/docs/guides/bootstrap-and-auth' },
  reference: { label: 'Reference', href: '/docs/reference/dsl-grammar' },
  releases: { label: 'Release notes', href: '/docs/releases/v0.2.0' },
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
  if (!isPublicDocPage(page)) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const isProductOverview = page.url === '/docs/overview/what-is-tapstate';
  const pageDescription = page.data.description;
  const canonicalUrl = new URL(page.url, docsBaseUrl).toString();
  const section = sectionInfo[page.slugs[0]];
  const connectorDocumentationStatus = page.slugs[0] === 'connectors' && page.slugs.length > 1
    ? getConnectorDocumentationStatus(page.slugs[1])
    : undefined;
  const connectorProductProfile = page.slugs[0] === 'connectors' && page.slugs.length > 1
    ? getConnectorProductProfile(page.slugs[1])
    : undefined;
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
        description: pageDescription,
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
            <DocsDescription className="mb-0">{pageDescription}</DocsDescription>
            <div className="flex flex-row gap-2 items-center border-b pb-6">
              <MarkdownCopyButton markdownUrl={markdownUrl} />
              <ViewOptionsPopover markdownUrl={markdownUrl} />
            </div>
          </>
        ) : null}
        <DocsBody>
          {connectorDocumentationStatus === 'roadmap' ? (
            <Aside title="Roadmap reference" type="note">
              This page is retained as a planning and external-system preparation reference{connectorProductProfile ? ` for a planned ${connectorProductProfile.useAs.join(' and ')} role` : ''}. It is not in the current product path and does not imply a release date or runtime support contract.
            </Aside>
          ) : null}
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
  return getPublicDocPages().map((page) => ({ slug: page.slugs }));
}

export async function generateMetadata(props: DocsPageProps): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug ?? []);
  if (!page) notFound();
  if (!isPublicDocPage(page)) notFound();

  const canonicalUrl = new URL(page.url, docsBaseUrl).toString();
  const pageDescription = page.data.description;
  return {
    title: page.data.title,
    description: pageDescription,
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
