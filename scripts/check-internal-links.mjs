// Checks that internal links in docs and source files point to existing routes and anchors.
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const docsRoot = new URL('../content/docs/', import.meta.url);
const sourceRoots = [
  new URL('../content/', import.meta.url),
  new URL('../app/', import.meta.url),
  new URL('../components/', import.meta.url),
  new URL('../lib/', import.meta.url),
];
const docFiles = (await readdir(docsRoot, { recursive: true }))
  .filter((name) => /\.(?:md|mdx)$/.test(name));
const routes = new Map();

function routeFor(name) {
  const extensionless = name.replace(/\.(?:md|mdx)$/, '');
  const segments = extensionless.split('/');
  if (segments.at(-1) === 'index') segments.pop();
  return `/docs${segments.length > 0 ? `/${segments.join('/')}` : ''}`;
}

function headingSlug(value) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

for (const name of docFiles) {
  const source = await readFile(new URL(name, docsRoot), 'utf8');
  const anchors = new Set();
  const duplicateCounts = new Map();

  for (const match of source.matchAll(/^#{2,6}\s+(.+?)\s*$/gm)) {
    const base = headingSlug(match[1]);
    const count = duplicateCounts.get(base) ?? 0;
    anchors.add(count === 0 ? base : `${base}-${count}`);
    duplicateCounts.set(base, count + 1);
  }
  for (const match of source.matchAll(/\bid=["']([^"']+)["']/g)) anchors.add(match[1]);

  routes.set(routeFor(name), { name, anchors });
}

const failures = [];
let checkedRoutes = 0;
let checkedAnchors = 0;

for (const root of sourceRoots) {
  const entries = await readdir(root, { recursive: true });
  for (const entry of entries) {
    if (!/\.(?:md|mdx|ts|tsx|json)$/.test(entry)) continue;
    const file = new URL(entry, root);
    if (!(await stat(file)).isFile()) continue;
    const source = await readFile(file, 'utf8');
    const relative = path.relative(new URL('..', import.meta.url).pathname, file.pathname);
    const links = [
      ...source.matchAll(/(?:href=["']|\]\()(?<url>\/docs[^)"'\s]*)/g),
    ];

    for (const match of links) {
      if (match.groups.url.includes('${')) continue;
      const [route, anchor] = match.groups.url.split('#', 2);
      checkedRoutes += 1;
      const target = routes.get(route);
      if (!target) {
        failures.push(`${relative}: missing internal route ${route}`);
        continue;
      }
      if (anchor) {
        checkedAnchors += 1;
        if (!target.anchors.has(anchor)) {
          failures.push(`${relative}: missing anchor ${route}#${anchor} in ${target.name}`);
        }
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`Internal link check failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Internal links passed: ${checkedRoutes} route references and ${checkedAnchors} heading anchors.`,
);
