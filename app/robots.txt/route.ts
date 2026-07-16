import { docsBaseUrl, isSiteIndexable } from '@/lib/shared';

export const revalidate = false;

export function GET() {
  if (!isSiteIndexable) {
    return new Response(
      ['User-agent: *', 'Disallow: /', ''].join('\n'),
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  return new Response(
    ['User-agent: *', 'Allow: /', '', `Sitemap: ${new URL('/sitemap.xml', docsBaseUrl)}`, ''].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
