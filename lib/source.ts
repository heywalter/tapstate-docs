import { organizeDocsNavigation } from './docs-navigation';
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
    ? node.children
    : [...directPages, ...groups, ...remainingNodes];

  return {
    ...node,
    children,
  };
}

// Keep the existing guide routes while shortening version-specific upgrade labels.
function groupUpgradeNavigation(node: Folder, folderPath: string): Folder {
  if (folderPath !== 'self-hosted') return node;

  return {
    ...node,
    children: node.children.map((child) => {
      if (child.type !== 'page' || !child.url.startsWith(`${docsRoute}/guides/upgrade-to-`)) {
        return child;
      }
      return {
        ...child,
        name: typeof child.name === 'string'
          ? child.name.replace(/^Upgrade to /, 'To ')
          : child.name,
      };
    }),
  };
}

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  pageTree: {
    transformers: [
      { folder: groupConnectorNavigation },
      { folder: groupUpgradeNavigation },
      { root: organizeDocsNavigation },
    ],
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

/** Keep structured breadcrumbs aligned with the route-preserving sidebar. */
export function getDocumentationSection(pageUrl: string) {
  function contains(node: Node): boolean {
    if (node.type === 'page') return node.url === pageUrl;
    return node.type === 'folder'
      && (node.index?.url === pageUrl || node.children.some(contains));
  }
  function firstPage(node: Node): Item | undefined {
    if (node.type === 'page') return node;
    if (node.type !== 'folder') return undefined;
    if (node.index) return node.index;
    for (const child of node.children) {
      const page = firstPage(child);
      if (page) return page;
    }
  }
  for (const node of source.getPageTree().children) {
    const group = filterPublicPageTreeNode(node);
    if (!group || group.type !== 'folder' || !contains(group)) continue;
    const entry = firstPage(group);
    if (entry && typeof group.name === 'string') {
      return { label: group.name, href: entry.url };
    }
  }
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
    .replace(/<Accordions(?:\s[^>]*)?>\n?/g, '')
    .replace(/<\/Accordions>\n?/g, '')
    .replace(/<Accordion\s+([^>]*)>\n?/g, (_match, attrs: string) => {
      const title = readAttribute(attrs, 'title') ?? 'Details';
      return `\n### ${title}\n\n`;
    })
    .replace(/<\/Accordion>\n?/g, '\n')
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
    .replace(/<figure\b[^>]*data-diagram="order-state"[^>]*>([\s\S]*?)<\/figure>/g, (_match, body: string) => {
      return body
        .replace(/<div\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/div>/g, '')
        .replace(/<code>([\s\S]*?)<\/code>/g, '`$1`')
        .replace(/<br\s*\/?>/g, ' ')
        .replace(/<(p|figcaption)\b[^>]*>([\s\S]*?)<\/\1>/g, (_tag, _name: string, text: string) => {
          return `${text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()}\n`;
        })
        .replace(/<[^>]+>/g, '')
        .split('\n')
        .map((line: string) => line.trim())
        .filter(Boolean)
        .join('\n');
    })
    .replace(/<div[^>]*>\n?/g, '')
    .replace(/<\/div>\n?/g, '')
    .replace(/^[ \t]*<span\s+id="[^"]*"(?:\s+aria-hidden="true")?\s*\/>\n?/gm, '')
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
    .replace(/\[<img\s+alt="([^"]*)"\s+src="__img\d+"\s*\/>\]\(([^)]+)\)/g, (_match, alt: string, href: string) => {
      return `> **Image:** [${alt}](${href})`;
    })
    .replace(/<img\s+alt="([^"]*)"\s+src="__img\d+"\s*\/>/g, (_match, alt: string) => {
      return `> **Image:** ${alt}`;
    })
    .replace(/<ValidationStatusGuide\s*\/>/g, `### Interpret the result

- **Configuration accepted:** \`valid: 3 resources in tapstate-work\`. The resource shape, references, and applicable catalog rules were accepted. Runtime availability was not checked.
- **Changes required:** \`invalid: orders_source.tap.yml:12:1 dsl.unknown-field\`. Use the filename, location, diagnostic code, and suggested fix to update the resource.

Next, run the connection in a non-production environment and confirm credentials, network access, permissions, and a representative read or write.`)
    .replace(/<DataPathComparison\s*\/>/g, `### Operational data path comparison

| Approach | Data path | Operating model |
|---|---|---|
| The assembled stack | Source systems → Capture (CDC connectors) → Broker (Topics & partitions) → Processing (Stream jobs & state) → Serving store (Sink glue & views) → Apps, automation & agents | Separate tools & handoffs: coordinate offsets, schemas and serialization, retries, and separate monitoring across four boundaries. |
| The tapstate target path | Source systems → tapstate (01 Capture · 02 Transform · 03 Serve) → Apps, automation & agents | Target Capture–Transform–Serve model: one deployable data path sharing checkpoints and recovery, pipeline and schema contracts, and unified preview and monitoring. |`)
    .replace(/<ProductOverviewHero\s*\/>/g, `Tapstate captures database changes, transforms data in flight, and maintains current results for applications and AI agents. Start in tapstate Cloud with the web application, or run the open-source engine yourself.

- **Capture:** Load existing data, then follow committed changes.
- **Transform:** Filter, map, script, and merge data as it moves.
- **Serve:** Write current state to a downstream system.

[Run the Quickstart](/docs/quickstart), [browse connectors](/docs/connectors), or [run tapstate yourself](/docs/self-hosted).`)
    .replace(/<PreviewArchitecture\s*\/>/g, `### Current preview architecture diagram

| Path | Components | Current behavior |
|---|---|---|
| Control | Web draft or \`.tap.yml\` workspace → tapstate control plane | Use the web application to save drafts, preview sample results, publish, start pipelines, and inspect monitoring, validation, and logs. Self-hosted servers also support CLI, REST, and MCP where exposed. |
| Data | Database sources (MySQL, PostgreSQL, Oracle, SQL Server, Db2) → tapstate (Capture & transform) → MongoDB / Atlas state | Runs initial snapshots followed by CDC, applies transforms such as \`nest\`, maintains durable checkpoints in Atlas Durable cache (or MongoDB on self-hosted), and materializes operational views in MongoDB Atlas or MongoDB. |`)
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
    .replace(/<QuickstartDataFlow\s*\/>/g, `### Quickstart data flow

The playground starts from its published seed data: MySQL \`orders\` row \`{ id: 1, customer: "alice", amount: 10.00 }\` and PostgreSQL \`shipments\` rows \`{ id: 1, order_id: 1, carrier: "dhl", status: "delivered" }\` and \`{ id: 2, order_id: 1, carrier: "ups", status: "in_transit" }\`. Neither database can join a table in the other.

The single-node tapstate server captures both sources through an initial snapshot followed by CDC. Its \`nest\` transform matches \`shipments.order_id\` to \`orders.id\` and materializes one current document per order in the managed MongoDB-backed \`views.order_state\` collection. Order 1 contains the MySQL fields plus both complete shipment rows under a \`shipments\` array.

The same state is available through the interactive tapstate CLI, the authenticated REST data-browser endpoints, and MCP tools such as \`data_browser_collections\` and \`data_browser_find\` for AI agents. All three surfaces call the running tapstate server; none replaces or starts it.`)
    .replace(/<CliServerWorkflow\s*\/>/g, `### CLI and server responsibilities

- **Offline authoring (no server):** The CLI works with a local workspace to create and inspect resources, and to run 'add', 'validate', 'explain', 'ls', and 'desc'.
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
  '> Tapstate captures database changes, transforms data in flight, and maintains current results for applications and AI agents.',
  '>',
  '> Start with the Cloud Quickstart and shared Build a pipeline guide. Self-hosting covers the local playground and deployments you manage. Use the canonical pages for prerequisites, connector scope, and data verification; software release notes do not identify a Cloud deployment version.',
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
    `- [Quickstart](${absoluteDocsUrl('/docs/quickstart')})`,
    `- [Connect data sources](${absoluteDocsUrl('/docs/connectors')})`,
    `- [Preview limits](${absoluteDocsUrl('/docs/limits')})`,
    `- [Organizations and Clusters](${absoluteDocsUrl('/docs/manage/organizations')})`,
    `- [Plans and billing](${absoluteDocsUrl('/docs/manage/billing')})`,
    `- [Self-hosting](${absoluteDocsUrl('/docs/self-hosted')})`,
    `- [Explore the local order-state demo](${absoluteDocsUrl('/docs/overview/order-state-demo')})`,
    `- [Install the CLI](${absoluteDocsUrl('/docs/overview/install')})`,
    `- [Create your own workspace](${absoluteDocsUrl('/docs/overview/create-workspace')})`,
    `- [Architecture](${absoluteDocsUrl('/docs/overview/architecture')})`,
    '',
    '## Connector status',
    '',
    `- [Connector guides](${absoluteDocsUrl('/docs/connectors')}) provide shared database preparation and configuration references. Directory status and guide maturity do not establish Cloud connector availability or successful data delivery.`,
    '- Other connector preparation materials are not published in the public documentation site or combined agent context and do not imply a product contract.',
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
