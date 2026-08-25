import { docs } from 'collections/server';
import type { Folder, Item, Node } from 'fumadocs-core/page-tree';
import { loader } from 'fumadocs-core/source';
import { llms } from 'fumadocs-core/source';
import {
  connectorCategories,
  connectorDirectory,
  getConnectorDocumentationStatus,
  getConnectorProductProfile,
  renderConnectorDirectoryForLLM,
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
      if (getConnectorDocumentationStatus(connector.slug) !== 'current') return [];
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

  const children = groups.length === 1
    ? [...directPages, ...groups[0].children, ...remainingNodes]
    : [...directPages, ...groups, ...remainingNodes];

  return {
    ...node,
    children,
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

/**
 * Public documentation policy for generated pages and machine-readable
 * surfaces. Connector pages without a product profile are preparation
 * material only; they stay in the source tree for history and future review,
 * but must not be emitted as public documentation.
 */
export function isPublicDocPage(page: (typeof source)['$inferPage']) {
  if (page.slugs[0] !== 'connectors' || page.slugs.length < 2) return true;
  return getConnectorDocumentationStatus(page.slugs[1]) !== 'unlisted';
}

export function getPublicDocPages() {
  return source.getPages().filter(isPublicDocPage);
}

function isPublicPageTreeItem(item: Item) {
  const page = source.getNodePage(item);
  return !page || isPublicDocPage(page);
}

function filterPublicPageTreeNode(node: Node): Node | null {
  if (node.type === 'page') return isPublicPageTreeItem(node) ? node : null;
  if (node.type !== 'folder') return node;

  const index = node.index && isPublicPageTreeItem(node.index)
    ? node.index
    : undefined;
  const children = node.children.flatMap((child) => {
    const publicChild = filterPublicPageTreeNode(child);
    return publicChild ? [publicChild] : [];
  });

  if (!index && children.length === 0) return null;
  return { ...node, index, children };
}

function readAttribute(attrs: string, name: string) {
  return attrs.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
}

function renderConnectorProfileForLLM(attrs: string) {
  const field = (name: string) => readAttribute(attrs, name);
  const rows = [
    `| Category | ${field('category') ?? 'Not specified'} |`,
    `| Guide maturity | ${field('maturity') ?? 'Not specified'} — ${field('maturityLabel') ?? 'Not specified'} |`,
    field('worksAs') ? `| Role in this guide | ${field('worksAs')} |` : null,
    field('capabilities') ? `| Capabilities | ${field('capabilities')} |` : null,
    `| Compatibility | ${field('compatibility') ?? 'Not specified'} |`,
  ].filter(Boolean);

  return `## Connector profile

| Signal | What it means |
|---|---|
${rows.join('\n')}`;
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

- **Configuration accepted:** \`valid: 3 resources in tapstate-work\`. The resource shape, references, and applicable catalog rules were accepted. Runtime availability was not checked.
- **Changes required:** \`invalid: orders_source.tap.yml:12:1 dsl.unknown-field\`. Use the filename, location, diagnostic code, and suggested fix to update the resource.

Next, run the connection in a non-production environment and confirm credentials, network access, permissions, and a representative read or write.`)
    .replace(/<DataPathComparison\s*\/>/g, `### Operational data path comparison

| Approach | Data path | Operating model |
|---|---|---|
| The assembled stack | Source systems → Capture → Broker → Processing → Serving store → Apps, automation & agents | Separate tools and operating boundaries. |
| The tapstate target path | Source systems → tapstate (Capture · Transform · Serve) → Apps, automation & agents | Target Capture–Transform–Serve operating model. |`)
    .replace(/<ProductOverviewHero\s*\/>/g, `Tapstate is an open-source unified operational data engine in preview. It builds and maintains live operational state—an Operational State Layer—for applications, APIs, automation, and AI agents. The v0.2.1 local playground explores a MySQL-to-MongoDB snapshot and CDC workflow.

- **Capture:** Load existing data, then follow committed changes.
- **Transform:** Filter, map, script, and merge data as it moves.
- **Serve:** Write current state to a downstream system.

[Try tapstate locally](/docs/overview/quickstart-online) or [browse connectors](/docs/connectors).`)
    .replace(/<PreviewArchitecture\s*\/>/g, `### Current preview architecture diagram

| Path | Components | Current behavior |
|---|---|---|
| Control | \`.tap.yml\` workspace → tapstate CLI → single-node server | The CLI validates locally and submits authenticated control requests to the server over HTTP. |
| Data | MySQL → single-node server (Capture & transform) → declared view → MongoDB managed state store | The local playground materializes an initial snapshot followed by CDC. A separate \`serve.sync\` can deliver the same pipeline output to an external target. The runtime wires \`filter\`, \`map\`, \`js\`, \`union\`, and \`nest\`. |`)
    .replace(/<TapStateArchitecture\s*\/>/g, `### Target architecture diagram

This diagram describes design direction, not the current preview implementation boundary.

| Plane | Stage | Responsibility |
|---|---|---|
| Control | Author | Define connections and pipelines. |
| Control | Validate | Check resources, references, and connector fields. |
| Control | Operate | Apply, observe, and control lifecycle. |
| Data | Sources | Databases, brokers, files, and APIs. |
| Data | Capture | Read initial data and later changes. |
| Data | Transform | Filter, map, script, union, and assemble related records with nest. |
| Data | Materialize | Maintain destination-ready current state. |
| Data | Deliver | Write targets or publish streams. |
| Data | Consumers | Applications, APIs, and agents. |

Durable recovery state includes resource versions, checkpoints, schema and mapping state, retries, and operational history.`)
    .replace(/<CliServerWorkflow\s*\/>/g, `### CLI and server responsibilities

- **Offline authoring (no server):** The CLI works with a local workspace to create and inspect resources, and to run 'new', 'validate', 'explain', 'ls', and 'desc'.
- **Connected operation (server required):** The CLI sends authenticated requests to a tapstate server for 'apply', 'test', 'discover', 'start', 'status', 'metrics', and 'logs'.`)
    .replace(/<McpConnectionFlow\s*\/>/g, `### MCP connection path

The MCP host (such as Codex or Claude Code) starts 'tapstate mcp' over **stdio**. The local gateway then calls the tapstate server over **HTTP(S)**, passing the scoped 'TAPSTATE_TOKEN' for authentication. The gateway does not replace or start the server.`)
    .replace(/<ConnectorDirectoryMatrix\s*\/>/g, renderConnectorDirectoryForLLM())
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

const llmProductOverview = [
  '> tapstate is a unified operational data engine that builds and maintains an Operational State Layer.',
  '>',
  '> Its product model captures changes, transforms records in flight, and delivers current operational state to applications, APIs, automation, and AI agents through one governed Capture–Transform–Serve data path. It is intended for teams that would otherwise assemble separate CDC, broker, stream-processing, and serving products for the same path. This describes the product model; it does not mean every surface is available in the current preview.',
  '>',
  '> The current preview is a prerelease, single-node, in-memory runtime. The documented end-to-end path is a local MySQL-to-MongoDB snapshot followed by CDC. Use the linked page-level documentation for current maturity, roles, modes, limitations, and setup requirements.',
].join('\n');

function getAIPageMetadata(page: (typeof source)['$inferPage']) {
  return (page.data as typeof page.data & { ai?: AIPageMetadata }).ai;
}

function renderAgentMetadata(page: (typeof source)['$inferPage']) {
  const ai = getAIPageMetadata(page);
  if (!ai) return '';

  const connectorDocumentationStatus = ai.kind === 'connector'
    ? getConnectorDocumentationStatus(page.slugs.at(-1) ?? '')
    : undefined;
  const connectorProductProfile = ai.kind === 'connector'
    ? getConnectorProductProfile(page.slugs.at(-1) ?? '')
    : undefined;
  const connectorCatalogEntry = ai.kind === 'connector'
    ? connectorDirectory.find((entry) => entry.slug === (page.slugs.at(-1) ?? ''))
    : undefined;
  const statusExplanation = connectorDocumentationStatus === 'current'
    ? 'current connector directory'
    : connectorDocumentationStatus === 'roadmap'
      ? 'roadmap reference; not a current product contract'
      : connectorDocumentationStatus === 'unlisted'
        ? 'not published in the public connector documentation'
        : undefined;
  const fields = [
    ['Content type', ai.kind],
    ['Identifier', ai.id],
    ['Documentation status', statusExplanation],
    [connectorDocumentationStatus === 'roadmap' ? 'Planned role' : 'Published role', connectorProductProfile?.useAs.join(', ')],
    ['Category', ai.category],
    ['Guide maturity', ai.maturity],
    ['Catalog metadata roles', connectorCatalogEntry?.useAs.join(', ')],
    ['Catalog metadata read modes', connectorCatalogEntry?.modes.join(', ')],
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
  const renderer = llms(source);
  const documentationMap = makeDocumentLinksAbsolute(
    source.getPageTree().children.flatMap((node) => {
      const publicNode = filterPublicPageTreeNode(node);
      return publicNode ? [renderer.indexNode(publicNode)] : [];
    }).join('\n'),
  ).trim();

  return [
    '# Tapstate documentation',
    '',
    llmProductOverview,
    '',
    '## When to use tapstate',
    '',
    '- Keep operational state current for applications, APIs, automation, or AI agents.',
    '- Reduce the coordination cost of operating separate CDC, broker, stream-processing, and serving systems.',
    '- Maintain a reviewable Capture–Transform–Serve path across source and target systems.',
    '- Offload reads, migrate while a source remains active, or publish governed operational feeds.',
    '',
    `See [Use cases](${absoluteDocsUrl('/docs/overview/use-cases')}) and [tapstate vs. a streaming stack](${absoluteDocsUrl('/docs/overview/vs-streaming-stack')}) for tradeoffs and verification questions.`,
    '',
    '## Start here',
    '',
    `- [What is tapstate?](${absoluteDocsUrl('/docs/overview/what-is-tapstate')})`,
    `- [Install the CLI](${absoluteDocsUrl('/docs/overview/install')})`,
    `- [Local playground](${absoluteDocsUrl('/docs/overview/quickstart-online')})`,
    `- [Quickstart](${absoluteDocsUrl('/docs/overview/quickstart')})`,
    `- [Architecture](${absoluteDocsUrl('/docs/overview/architecture')})`,
    '',
    '## Connector status',
    '',
    `- Current product path: [MySQL source](${absoluteDocsUrl('/docs/connectors/mysql')}) with Snapshot and CDC into a [MongoDB target](${absoluteDocsUrl('/docs/connectors/mongodb')}).`,
    `- Roadmap references: [PostgreSQL capture](${absoluteDocsUrl('/docs/connectors/postgresql')}) and [Kafka / Confluent delivery](${absoluteDocsUrl('/docs/connectors/kafka')}). They do not imply a release date or current product contract.`,
    '- Other connector preparation materials are not published in the public documentation site or combined agent context.',
    '',
    '## Agent guidance',
    '',
    '- Prefer page-level Markdown for implementation decisions; this file is a discovery index.',
    '- Treat connector frontmatter as compact metadata and use the page body for the canonical explanation.',
    '- Check maturity, roles, modes, limitations, and setup guidance together.',
    '- Do not infer unavailable UI or runtime behavior from upstream connector documentation.',
    '',
    '## Documentation map',
    '',
    documentationMap,
  ].join('\n');
}

export async function getLLMFullText() {
  const pages = getPublicDocPages();
  const scanned = await Promise.all(pages.map(getLLMText));

  return [
    '# Tapstate documentation — complete agent context',
    '',
    llmProductOverview,
    '',
    '> Generated from the canonical documentation source.',
    '',
    scanned.join('\n\n'),
  ].join('\n');
}
