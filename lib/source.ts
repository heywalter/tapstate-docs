import { docs } from 'collections/server';
import type { Folder, Item, Node } from 'fumadocs-core/page-tree';
import { loader } from 'fumadocs-core/source';
import { llms } from 'fumadocs-core/source';
import {
  connectorCategories,
  connectorDirectory,
  renderSupportedConnectorMatrixForLLM,
} from './connector-directory';
import {
  docsBaseUrl,
  docsContentRoute,
  docsImageRoute,
  docsRoute,
} from './shared';

function groupConnectorNavigation(node: Folder, folderPath: string): Folder {
  if (folderPath !== 'connectors') return node;

  const pages = new Map(
    node.children
      .filter((child): child is Item => child.type === 'page')
      .map((child) => [child.url, child]),
  );
  const groupedUrls = new Set<string>();
  const groups: Folder[] = connectorCategories.map((category) => {
    const children = connectorDirectory.flatMap((connector) => {
      if (connector.category !== category.id) return [];
      const url = `${docsRoute}/connectors/${connector.slug}`;
      const page = pages.get(url);
      if (!page) return [];
      groupedUrls.add(url);
      return [page];
    });

    return {
      type: 'folder',
      $id: `connector-group-${category.id}`,
      name: category.label,
      description: category.description,
      collapsible: true,
      defaultOpen: false,
      children,
    } satisfies Folder;
  }).filter((group) => group.children.length > 0);

  const directPages = node.children.filter(
    (child): child is Item => child.type === 'page' && !groupedUrls.has(child.url),
  );
  const remainingNodes = node.children.filter((child) => child.type !== 'page') as Node[];

  return {
    ...node,
    children: [...directPages, ...groups, ...remainingNodes],
  };
}

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  pageTree: {
    transformers: [{ folder: groupConnectorNavigation }],
  },
  plugins: [],
});

export function getPageImage(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join('/')}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'content.md'];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join('/')}`,
  };
}

function readAttribute(attrs: string, name: string) {
  return attrs.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
}

function renderConnectorProfileForLLM(attrs: string) {
  const field = (name: string) => readAttribute(attrs, name) ?? 'Not specified';

  return `## Connector profile

| Signal | What it means |
|---|---|
| Category | ${field('category')} |
| Maturity | ${field('maturity')} — ${field('maturityLabel')} |
| Works as | ${field('worksAs')} |
| Capabilities | ${field('capabilities')} |
| Compatibility | ${field('compatibility')} |`;
}

function cleanMdxForLLM(markdown: string) {
  return markdown
    .replace(/^import\s+.+?;\n?/gm, '')
    // The MDX processor can encode the first asterisk of a bold run after inline text.
    .replace(/&#x2A;\*/g, '**')
    .replace(/<Tabs(?:\s[^>]*)?>([\s\S]*?)<\/Tabs>/g, (_match, body: string) => {
      return body.replace(/^ {4}/gm, '');
    })
    .replace(/<Tab\s+[^>]*value="([^"]+)"[^>]*>\n?/g, '\n### $1\n\n')
    .replace(/<\/Tab>\n?/g, '')
    .replace(/<SourceModeTabs(?:\s[^>]*)?>([\s\S]*?)<\/SourceModeTabs>/g, (_match, body: string) => {
      return body.replace(/^ {4}/gm, '');
    })
    .replace(/<SourceModeTab\s+value="([^"]+)"(?:\s+label="([^"]+)")?(?:\s+description="[^"]+")?>\n?/g, (_match, value: string, label?: string) => {
      const fallback = value === 'snapshot' ? 'Full load (Snapshot) preparation' : 'Full load + CDC preparation';
      const labelWithContext = label ? `${label} preparation` : fallback;
      return `\n\n#### ${labelWithContext}\n\n`;
    })
    .replace(/<\/SourceModeTab>\n?/g, '\n\n')
    .replace(/<PreparationSteps>\n?([\s\S]*?)<\/PreparationSteps>/g, (_match, body: string) => {
      let step = 0;
      return body.replace(
        /<PreparationStep\s+title="([^"]+)">\n?([\s\S]*?)<\/PreparationStep>\n?/g,
        (_stepMatch, title: string, content: string) => {
          step += 1;
          const stepContent = content.replace(/^ {2}/gm, '').trim();
          return `##### Step ${step}: ${title}\n\n${stepContent}\n\n`;
        },
      );
    })
    .replace(/<div[^>]*>\n?/g, '')
    .replace(/<\/div>\n?/g, '')
    .replace(/<CardGrid>\n?/g, '')
    .replace(/<\/CardGrid>\n?/g, '')
    .replace(/<LinkCard\s+([\s\S]*?)\/>/g, (_match, attrs: string) => {
      const title = readAttribute(attrs, 'title') ?? 'Untitled';
      const href = readAttribute(attrs, 'href') ?? '#';
      const description = readAttribute(attrs, 'description');
      return `- [${title}](${href})${description ? `: ${description}` : ''}\n`;
    })
    .replace(/<Aside\s+([^>]*)>\n?([\s\S]*?)<\/Aside>/g, (_match, attrs: string, body: string) => {
      const title = readAttribute(attrs, 'title');
      const content = body
        .replace(/^ {2}/gm, '')
        .trim()
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
      return `${title ? `\n> **${title}**\n>` : '\n>'}\n${content}\n`;
    })
    .replace(/<Badge\s+([^>]*)\/>/g, (_match, attrs: string) => {
      const text = readAttribute(attrs, 'text');
      return text ? `(${text})` : '';
    })
    .replace(/<img\s+alt="([^"]*)"\s+src="__img\d+"\s*\/>/g, (_match, alt: string) => {
      return `> **Screenshot:** ${alt}`;
    })
    .replace(/<ValidationStatusGuide\s*\/>/g, `### Interpret the result

- **Configuration accepted:** \`valid: 3 resources in tapstate-work\`. The resource files, references, modes, and recognized field formats were accepted.
- **Changes required:** \`invalid: orders_source.tapstate.yml:12:1 dsl.unknown-field\`. Use the filename, location, diagnostic code, and suggested fix to update the resource.

Next, run the connection in a non-production environment and confirm credentials, network access, permissions, and a representative read or write.`)
    .replace(/<DataPathComparison\s*\/>/g, `### Operational data path comparison

| Approach | Data path | Operating model |
|---|---|---|
| The assembled stack | Source systems → Capture → Broker → Processing → Serving store → Apps, automation & agents | Separate tools and operating boundaries. |
| The tapstate data path | Source systems → tapstate (Capture · Transform · Serve) → Apps, automation & agents | One deployable Capture–Transform–Serve path. |`)
    .replace(/<ProductOverviewHero\s*\/>/g, `Tapstate is an open-source unified operational data engine. It captures production database changes, transforms data incrementally as it moves, and serves fresh, queryable state to applications, APIs, automation, and AI agents.

- **Capture:** Load existing data, then follow committed changes.
- **Transform:** Shape and route data incrementally as it moves.
- **Serve:** Maintain fresh, queryable state for downstream systems.

[Start the quickstart](/docs/overview/quickstart) or [browse connectors](/docs/connectors).`)
    .replace(/<TapStateArchitecture\s*\/>/g, `## Logical architecture

| Plane | Stage | Responsibility |
|---|---|---|
| Control | Author | Define connections and pipelines. |
| Control | Validate | Check resources, references, and connector fields. |
| Control | Operate | Apply, observe, and control lifecycle. |
| Data | Sources | Databases, brokers, files, and APIs. |
| Data | Capture | Read initial data and later changes. |
| Data | Transform | Filter, map, enrich, join, and route. |
| Data | Materialize | Maintain destination-ready current state. |
| Data | Deliver | Write targets or publish streams. |
| Data | Consumers | Applications, APIs, and agents. |

Durable recovery state includes resource versions, checkpoints, schema and mapping state, retries, and operational history.`)
    .replace(/<SupportedConnectorMatrix\s*\/>/g, renderSupportedConnectorMatrixForLLM())
    .replace(/<ConnectorProfile\s+([\s\S]*?)\/>/g, (_match, attrs: string) => {
      return renderConnectorProfileForLLM(attrs);
    })
    .replace(/^\s{2,}(#{1,6}\s.*)$/gm, '$1')
    .replace(/^\s{2,}(\|.*\|)$/gm, '$1')
    .replace(/([^\n])\n(#{2,6}\s)/g, '$1\n\n$2')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

type AIPageMetadata = {
  kind: 'connector' | 'concept' | 'reference' | 'guide';
  id: string;
  category?: string;
  maturity?: 'experimental' | 'preview' | 'ga' | 'deprecated';
  useAs?: Array<'source' | 'target'>;
  modes?: string[];
  aliases?: string[];
};

function absoluteDocsUrl(path: string) {
  return new URL(path, docsBaseUrl).toString();
}

function makeDocumentLinksAbsolute(markdown: string) {
  return markdown.replace(/\]\((\/[^)\s]*)\)/g, (_match, path: string) => {
    return `](${absoluteDocsUrl(path)})`;
  });
}

function getAIPageMetadata(page: (typeof source)['$inferPage']) {
  return (page.data as typeof page.data & { ai?: AIPageMetadata }).ai;
}

function renderAgentMetadata(page: (typeof source)['$inferPage']) {
  const ai = getAIPageMetadata(page);
  if (!ai) return '';

  const fields = [
    ['Content type', ai.kind],
    ['Identifier', ai.id],
    ['Category', ai.category],
    ['Maturity', ai.maturity],
    ['Use as', ai.useAs?.join(', ')],
    ['Modes', ai.modes?.join(', ')],
    ['Aliases', ai.aliases?.join(', ')],
  ].filter((field): field is [string, string] => Boolean(field[1]));

  return `## Agent metadata

${fields.map(([label, value]) => `- ${label}: ${value}`).join('\n')}`;
}

export async function getLLMText(page: (typeof source)['$inferPage']) {
  const processed = makeDocumentLinksAbsolute(
    cleanMdxForLLM(await page.data.getText('processed')),
  );
  const metadata = renderAgentMetadata(page);

  return `# ${page.data.title} (${absoluteDocsUrl(page.url)})

${metadata ? `${metadata}\n\n` : ''}${processed}`;
}

export function getLLMIndex() {
  const index = makeDocumentLinksAbsolute(llms(source).index());
  const [title, ...content] = index.split('\n');

  return [
    title,
    '',
    '> Tapstate product documentation. Prefer page-level Markdown for implementation decisions.',
    '',
    '## Agent guidance',
    '- Connector frontmatter is a compact discovery index; the page body is the canonical reader and agent context.',
    '- Do not infer unavailable UI or runtime behavior from upstream connector documentation.',
    '',
    ...content,
  ].join('\n');
}

export async function getLLMFullText() {
  const scanned = await Promise.all(source.getPages().map(getLLMText));

  return [
    '# Tapstate documentation — complete agent context',
    '',
    '> Generated from the canonical documentation source.',
    '',
    scanned.join('\n\n'),
  ].join('\n');
}
