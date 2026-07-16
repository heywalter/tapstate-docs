import { source } from '@/lib/source';
import { docsBaseUrl, isSiteIndexable } from '@/lib/shared';

export const revalidate = false;

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&apos;',
      '"': '&quot;',
    };
    return entities[character];
  });
}

export function GET() {
  if (!isSiteIndexable) {
    return new Response('', { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
  }

  const urls = [docsBaseUrl, ...source.getPages().map((page) => new URL(page.url, docsBaseUrl).toString())];
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
