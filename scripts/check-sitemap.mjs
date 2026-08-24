import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sitemapPath = resolve('out/sitemap.xml');
let sitemap;

try {
  sitemap = await readFile(sitemapPath, 'utf8');
} catch (error) {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
    throw new Error('Missing out/sitemap.xml. Run pnpm build before pnpm sitemap:check.');
  }
  throw error;
}

const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

if (!sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
  throw new Error('out/sitemap.xml is missing the XML declaration.');
}

if (!sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
  throw new Error('out/sitemap.xml is missing the sitemap urlset.');
}

if (locations.length === 0) {
  throw new Error('out/sitemap.xml does not contain any URLs.');
}

if (!locations.some((location) => new URL(location).pathname.startsWith('/docs'))) {
  throw new Error('out/sitemap.xml does not contain a documentation URL.');
}

console.log(`Sitemap check passed: ${locations.length} URLs in out/sitemap.xml.`);
