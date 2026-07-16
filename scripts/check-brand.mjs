import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const roots = ['app', 'components', 'content', 'lib', 'public', 'scripts'];
const rootFiles = ['AGENTS.md', 'README.md', 'netlify.toml', 'package.json', 'pnpm-lock.yaml', 'source.config.ts'];
const textExtensions = new Set(['.css', '.js', '.json', '.md', '.mdx', '.mjs', '.svg', '.ts', '.tsx']);
const mixedCaseBrand = ['Tap', 'State'].join('');
const legacyBrand = ['cyn', 'tex'].join('');
const upstreamBrand = ['tap', 'data'].join('');
const legacyStem = ['c', 'y', 'n'].join('');
const forbidden = [
  { label: 'non-canonical brand casing', pattern: new RegExp(`\\b${mixedCaseBrand}\\b`, 'g') },
  { label: 'legacy product name', pattern: new RegExp(legacyBrand, 'gi') },
  { label: 'upstream product name', pattern: new RegExp(upstreamBrand, 'gi') },
  { label: 'legacy documentation domain', pattern: new RegExp(`docs\\.${legacyBrand}\\.io`, 'gi') },
  { label: 'legacy overview slug', pattern: new RegExp(`what-is-${legacyBrand}`, 'gi') },
  { label: 'legacy package name', pattern: new RegExp(`${legacyBrand}-docs`, 'gi') },
  { label: 'legacy resource extension', pattern: new RegExp(`\\.${legacyStem}\\.yml`, 'gi') },
  { label: 'legacy resource version', pattern: new RegExp(`${legacyBrand}/v1`, 'gi') },
  { label: 'legacy workspace variable', pattern: new RegExp(`${legacyBrand.toUpperCase()}_WORKDIR`, 'g') },
];

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (path === 'scripts/check-brand.mjs') continue;
    if (entry.isDirectory()) files.push(...(await collect(path)));
    else if (textExtensions.has(extname(entry.name))) files.push(path);
  }

  return files;
}

const files = [...rootFiles];
for (const root of roots) files.push(...(await collect(root)));

const failures = [];
for (const file of files) {
  const value = await readFile(file, 'utf8');
  const lines = value.split('\n');

  for (const { label, pattern } of forbidden) {
    for (let index = 0; index < lines.length; index += 1) {
      pattern.lastIndex = 0;
      if (pattern.test(lines[index])) failures.push(`${relative('.', file)}:${index + 1}: ${label}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Brand check passed: no legacy or upstream product names, domains, slugs, or package names.');
}
