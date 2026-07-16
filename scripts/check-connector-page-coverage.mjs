import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const catalogDir = process.env.TAPSTATE_CATALOG_DIR;

if (!catalogDir) {
  console.error('Set TAPSTATE_CATALOG_DIR to the product catalog directory before running this check.');
  process.exit(2);
}

const docsDir = new URL('../content/docs/connectors/', import.meta.url);
const pageNames = (await readdir(docsDir)).filter((name) => name.endsWith('.mdx') && name !== 'index.mdx');
const coreSections = {
  profile: /<ConnectorProfile\b/,
  capabilities: /\bcapabilities="[^"]+"/,
  beforeYouBegin: /^## Before you begin/m,
  createConnection: /^## Create a connection/m,
  validateConfiguration: /^## Validate the configuration/m,
  limitations: /^## Limitations/m,
  reference: /^## Reference/m,
  validationExamples: /<ValidationStatusGuide\s*\/>/,
};

const internalMigrationLanguage = /(?:catalog-declared|code-backed|bundled catalog|current catalog|upstream (?:guide|page|connector|platform|baseline))/i;
const internalEvidenceLanguage = /(?:optional approval filters|local validation boundary|connector implementation|deployed runtime|runtime contract|connector contract|connection contract|product surface|does not invent|runtime representation|resource placement[^.\n]*pending|inherited spelling|documented baseline|packaged connector)/i;
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
let serverContract = 0;

for (const name of pageNames) {
  const page = await readFile(new URL(name, docsDir), 'utf8');
  const id = frontmatterValue(page, 'id');
  if (!id) {
    failures.push(`${name}: missing ai.id`);
    continue;
  }

  const roles = frontmatterList(page, 'useAs');
  const declaredModes = frontmatterList(page, 'modes');
  const missing = Object.entries(coreSections)
    .filter(([section, pattern]) => section !== 'validationExamples' && !pattern.test(page))
    .map(([section]) => section);

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
    serverContract += 1;
    if (missing.length > 0) failures.push(`${name}: ${missing.join(', ')}`);
    continue;
  }

  catalogBacked += 1;
  if (!coreSections.validationExamples.test(page)) missing.push('validationExamples');
  const catalogModes = catalog.modes ?? [];

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

  const undocumentedFields = (catalog.config ?? [])
    .map((field) => field.name)
    .filter((field) => !page.includes(`\`${field}\``) && !page.includes(`${field}:`));
  if (undocumentedFields.length > 0) {
    missing.push(`connection fields not documented: ${undocumentedFields.join(', ')}`);
  }

  if ((catalog.modes ?? []).includes('cdc') && (!/<SourceModeTabs\b/.test(page) || !/value="snapshot-cdc"/.test(page))) {
    missing.push('snapshot + CDC mode path');
  }
  if ((catalog.modes ?? []).includes('cdc')) {
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

console.log(`Connector page coverage passed: ${catalogBacked} catalog-backed guides and ${serverContract} server-contract guides use the canonical structure.`);
