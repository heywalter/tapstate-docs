// Validates connector documentation pages against the product connector catalog.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const catalogDir = process.env.TAPSTATE_CATALOG_DIR;

if (!catalogDir) {
  console.error('Set TAPSTATE_CATALOG_DIR to the product catalog directory before running this check.');
  process.exit(2);
}

const docsDir = new URL('../content/docs/connectors/', import.meta.url);
const directorySource = await readFile(new URL('../lib/connector-directory.ts', import.meta.url), 'utf8');
const connectorMeta = JSON.parse(await readFile(new URL('../content/docs/connectors/meta.json', import.meta.url), 'utf8'));
const pageNames = (await readdir(docsDir)).filter((name) => name.endsWith('.mdx') && name !== 'index.mdx');
const coreSections = {
  profile: /<ConnectorProfile\b/,
  beforeYouBegin: /^## Before you begin/m,
  createConnection: /^## Create a connection/m,
  validateConfiguration: /^## Validate the configuration/m,
  limitations: /^## Limitations/m,
  reference: /^## Reference/m,
  validationExamples: /<ValidationStatusGuide\s*\/>/,
};

const internalMigrationLanguage = /(?:catalog-declared|code-backed|upstream (?:guide|page|connector|platform|baseline))/i;
const internalEvidenceLanguage = /(?:optional approval filters|local validation boundary|connector implementation|runtime representation|resource placement[^.\n]*pending|inherited spelling|documented baseline)/i;
const redundantProfileCallout = /<Aside\b[^>]*\btitle="(?:Source-only connection|Target-only connection|Snapshot only|Authorization|Required field spelling|AWS connection fields|Network access|Endpoint availability|Rate limits are service-side|Use test data only|Source use needs staging validation|MySQL-compatible mode|One connection, one filesystem catalog)"[^>]*>/i;

function frontmatterValue(page, key) {
  return page.match(new RegExp(`^\\s*${key}:\\s*([^\\s]+)\\s*$`, 'm'))?.[1];
}

function frontmatterList(page, key) {
  return (page.match(new RegExp(`^\\s*${key}:\\s*\\[([^\\]]*)\\]`, 'm'))?.[1] ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

const failures = [];
let catalogBacked = 0;
let catalogMissing = 0;
let serverAuthoritative = 0;
const maturityCounts = { ga: 0, preview: 0, deprecated: 0 };

function quotedList(value) {
  return [...value.matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

const directoryItems = new Map(
  [...directorySource.matchAll(/\{\s*slug:\s*'([^']+)',\s*id:\s*'([^']+)',\s*title:\s*'[^']+',\s*category:\s*'[^']+',\s*maturity:\s*'([^']+)',\s*((?:(?:releaseTestedE2E:\s*true|capabilityAuthority:\s*'server'),\s*)*)useAs:\s*\[([^\]]*)\],\s*modes:\s*\[([^\]]*)\]\s*\}/g)]
    .map((match) => [match[1], {
      id: match[2],
      maturity: match[3],
      capabilityAuthority: match[4].includes("capabilityAuthority: 'server'") ? 'server' : 'catalog',
      roles: quotedList(match[5]),
      modes: quotedList(match[6]),
    }]),
);
const productProfiles = new Map(
  [...directorySource.matchAll(/^\s*['"]?([\w-]+)['"]?:\s*\{\s*status:\s*'(current|roadmap)',[\s\S]*?useAs:\s*\[([^\]]*)\],\s*modes:\s*\[([^\]]*)\]\s*\},?$/gm)]
    .map((match) => [match[1], {
      status: match[2],
      roles: quotedList(match[3]),
      modes: quotedList(match[4]),
    }]),
);

const expectedNavigation = [
  'index',
  ...[...productProfiles]
    .filter(([, profile]) => profile.status === 'current')
    .map(([slug]) => slug),
];
if (JSON.stringify(connectorMeta.pages) !== JSON.stringify(expectedNavigation)) {
  failures.push(`meta.json: expected current connector navigation ${JSON.stringify(expectedNavigation)}, received ${JSON.stringify(connectorMeta.pages)}`);
}

for (const name of pageNames) {
  const page = await readFile(new URL(name, docsDir), 'utf8');
  const id = frontmatterValue(page, 'id');
  if (!id) {
    failures.push(`${name}: missing ai.id`);
    continue;
  }

  const roles = frontmatterList(page, 'useAs');
  const declaredModes = frontmatterList(page, 'modes');
  const maturity = frontmatterValue(page, 'maturity');
  const profileMaturity = page.match(/<ConnectorProfile\b[\s\S]*?\bmaturity="([^"]+)"/)?.[1];
  const description = page.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  const slug = name.replace(/\.mdx$/, '');
  const directoryItem = directoryItems.get(slug);
  const isServerAuthoritative = directoryItem?.capabilityAuthority === 'server';
  const missing = Object.entries(coreSections)
    .filter(([section, pattern]) => section !== 'validationExamples' && !pattern.test(page))
    .map(([section]) => section);

  if (!['ga', 'preview', 'deprecated'].includes(maturity)) {
    missing.push('valid ai.maturity');
  } else {
    maturityCounts[maturity] += 1;
  }
  const expectedProfileMaturity = maturity === 'ga'
    ? 'GA'
    : maturity === 'deprecated'
      ? 'Deprecated'
      : 'Preview';
  if (profileMaturity !== expectedProfileMaturity) {
    missing.push(`profile maturity differs (${profileMaturity ?? 'missing'})`);
  }
  const profileHasRoles = /\bworksAs="[^"]+"/.test(page);
  const profileHasCapabilities = /\bcapabilities="[^"]+"/.test(page);
  const profileRoles = (page.match(/\bworksAs="([^"]+)"/)?.[1] ?? '')
    .split(',')
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean);
  if (roles.length > 0 && (!profileHasRoles || !profileHasCapabilities)) {
    missing.push('profile roles and capabilities required by product-backed role');
  }
  if (roles.join(',') !== profileRoles.join(',')) {
    missing.push('profile roles differ from frontmatter');
  }
  if (roles.length === 0 && (profileHasRoles || profileHasCapabilities)) {
    missing.push('profile roles or capabilities without product-backed role');
  }
  if (!description?.endsWith('.') || description.length < 80 || description.length > 160) {
    missing.push('single 80–160 character outcome-oriented description');
  }
  const preProfile = page.slice(0, page.indexOf('<ConnectorProfile'));
  const imports = [...preProfile.matchAll(/^import .*;\n/gm)];
  const lastImport = imports.at(-1);
  if (!lastImport || preProfile.slice(lastImport.index + lastImport[0].length).trim()) {
    missing.push('duplicate intro before connector profile');
  }
  if (!directoryItem) {
    missing.push('connector directory entry');
  } else {
    if (directoryItem.id !== id) missing.push(`directory id differs (${directoryItem.id})`);
    if (directoryItem.maturity !== maturity) missing.push(`directory maturity differs (${directoryItem.maturity})`);
    if (directoryItem.roles.join(',') !== roles.join(',')) missing.push('directory roles differ from frontmatter');
    if (directoryItem.modes.join(',') !== declaredModes.join(',')) missing.push('directory modes differ from frontmatter');
  }

  if (/^kind:\s*target\s*$/m.test(page)) {
    missing.push('invalid kind: target example (target-capable connections use kind: source without mode)');
  }
  if (internalMigrationLanguage.test(page)) {
    missing.push('reader-facing migration provenance');
  }
  if (internalEvidenceLanguage.test(page)) {
    missing.push('reader-facing implementation evidence');
  }
  if (redundantProfileCallout.test(page)) {
    missing.push('redundant connector-profile callout');
  }
  if (roles.includes('source') && !/^### Source\b/m.test(page)) missing.push('source section');
  if (roles.includes('target') && !/^### Target\b/m.test(page)) missing.push('target section');

  let catalog;
  try {
    catalog = JSON.parse(await readFile(path.join(catalogDir, `${id}.json`), 'utf8'));
  } catch {
    catalogMissing += 1;
    if (isServerAuthoritative) serverAuthoritative += 1;
    if (missing.length > 0) failures.push(`${name}: ${missing.join(', ')}`);
    continue;
  }

  catalogBacked += 1;
  if (!coreSections.validationExamples.test(page)) missing.push('validationExamples');
  const catalogModes = catalog.modes ?? [];

  if (isServerAuthoritative) {
    serverAuthoritative += 1;
  } else {
    const unexpectedModes = declaredModes.filter((mode) => !catalogModes.includes(mode));
    const missingModes = catalogModes.filter((mode) => !declaredModes.includes(mode));
    if (unexpectedModes.length > 0 || missingModes.length > 0) {
      missing.push(`frontmatter modes differ from product catalog (missing: ${missingModes.join(', ') || 'none'}; unexpected: ${unexpectedModes.join(', ') || 'none'})`);
    }
    if (catalogModes.length > 0 && !roles.includes('source')) {
      missing.push('source role required by published read modes');
    }
    if (Boolean(catalog.sink?.capable) !== roles.includes('target')) {
      missing.push(`target role differs from product catalog (${catalog.sink?.capable ? 'target required' : 'target not declared'})`);
    }
  }

  const undocumentedFields = (catalog.config ?? [])
    .map((field) => field.name)
    .filter((field) => !page.includes(`\`${field}\``) && !page.includes(`${field}:`));
  if (undocumentedFields.length > 0) {
    missing.push(`connection fields not documented: ${undocumentedFields.join(', ')}`);
  }

  const productProfile = productProfiles.get(slug);
  const requiresCdcPath = productProfile
    ? productProfile.modes.includes('cdc')
    : directoryItem?.capabilityAuthority === 'server'
      ? declaredModes.includes('cdc')
      : (catalog.modes ?? []).includes('cdc');
  if (requiresCdcPath && (!/<SourceModeTabs\b/.test(page) || !/value="snapshot-cdc"/.test(page))) {
    missing.push('snapshot + CDC mode path');
  }
  if (requiresCdcPath) {
    const cdcTab = page.match(/<SourceModeTab\s+value="snapshot-cdc"[^>]*>([\s\S]*?)<\/SourceModeTab>/)?.[1] ?? '';
    if (/(?:start with (?:the )?snapshot|as shown in (?:the )?snapshot|snapshot grants above)/i.test(cdcTab)) {
      missing.push('CDC tab depends on the Snapshot tab');
    }
  }

  if (missing.length > 0) failures.push(`${name}: ${missing.join(', ')}`);
}

if (failures.length > 0) {
  console.error(`Connector page coverage check failed (${failures.length} page${failures.length === 1 ? '' : 's'}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (directoryItems.size !== pageNames.length) {
  console.error(`Connector directory has ${directoryItems.size} entries for ${pageNames.length} pages.`);
  process.exit(1);
}

console.log(`Connector page coverage passed: ${maturityCounts.ga} GA, ${maturityCounts.preview} Preview, and ${maturityCounts.deprecated} Deprecated pages; ${catalogBacked} catalog entries present, ${serverAuthoritative} server-authoritative capability contracts, and ${catalogMissing} without a current catalog entry.`);
