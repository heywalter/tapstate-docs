import { getLLMText, getPageMarkdownUrl, getPublicDocPages, isPublicDocPage, source } from '@/lib/source';
import { notFound } from 'next/navigation';

export const revalidate = false;

type RouteProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export async function GET(_req: Request, { params }: RouteProps) {
  const { slug } = await params;
  // remove the appended "content.md"
  const page = source.getPage(slug?.slice(0, -1));
  if (!page) notFound();
  if (!isPublicDocPage(page)) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export function generateStaticParams() {
  return getPublicDocPages().map((page) => ({
    slug: getPageMarkdownUrl(page).segments,
  }));
}
