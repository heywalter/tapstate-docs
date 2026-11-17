import type { Metadata } from 'next';
import Link from 'next/link';
import { FullSearchTrigger } from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import {
  ArrowRight,
  Bot,
  Braces,
  Cloud,
  Database,
  GitBranch,
  Layers3,
  Plus,
  Server,
  TerminalSquare,
} from 'lucide-react';
import {
  getConnectorProductProfile,
  getConnectorsByDocumentationStatus,
} from '@/lib/connector-directory';

export const metadata: Metadata = {
  title: 'Tapstate documentation',
  description:
    'Learn how tapstate captures database changes, transforms data in flight, and serves live operational state.',
};

const entryCards = [
  {
    eyebrow: 'Hosted service',
    title: 'Cloud quickstart',
    description:
      'Connect MongoDB Atlas, load supplied sample tables, and inspect an assembled Order 360 document.',
    href: '/docs/quickstart',
    linkLabel: 'Start in Cloud',
    icon: Cloud,
  },
  {
    eyebrow: 'Open-source · Docker',
    title: 'Local playground',
    description:
      'Start MySQL, PostgreSQL, MongoDB, and the tapstate engine locally in one command and test live CDC.',
    href: '/docs/overview/quickstart',
    linkLabel: 'Run locally',
    icon: TerminalSquare,
  },
  {
    eyebrow: 'Product model',
    title: 'What is tapstate?',
    description:
      'Learn how Capture, Transform, and Serve work together in one reviewable operational data path.',
    href: '/docs/overview/what-is-tapstate',
    linkLabel: 'Read the overview',
    icon: Layers3,
  },
];

const connectorLogos: Record<string, string> = {
  mysql: '/images/connectors/logos/mysql.svg',
  postgresql: '/images/connectors/logos/postgresql.svg',
  oracle: '/images/connectors/logos/oracle.svg',
  sqlserver: '/images/connectors/logos/sqlserver.svg',
  db2: '/images/connectors/logos/db2.svg',
  db2i: '/images/connectors/logos/db2i.svg',
  mongodb: '/images/connectors/logos/mongodb.svg',
};

const directoryColumns = [
  {
    title: 'Build and validate',
    icon: GitBranch,
    links: [
      {
        label: 'Build a pipeline',
        description: 'Connect sources, configure transforms or Nest, preview records, and start runs.',
        href: '/docs/guides/build-a-pipeline',
      },
      {
        label: 'Observe a pipeline',
        description: 'Check runtime throughput, snapshot progress, logs, and target views.',
        href: '/docs/guides/observe-a-pipeline',
      },
      {
        label: 'Validate pipeline data',
        description: 'Run full count or field comparisons on direct table-to-collection syncs.',
        href: '/docs/guides/validate-pipeline-data',
      },
    ],
  },
  {
    title: 'Deploy and manage',
    icon: Server,
    links: [
      {
        label: 'Manage Cloud',
        description: 'Organizations, Cluster readiness, outbound IP allowlists, and billing.',
        href: '/docs/manage',
      },
      {
        label: 'Alerts and notifications',
        description: 'Inspect Cluster alerts, maintenance silences, and organization email policies.',
        href: '/docs/manage/alerts',
      },
      {
        label: 'Recover runtime storage',
        description: 'Coordinate lost durable-cache recovery and rebuild affected pipelines.',
        href: '/docs/manage/storage-recovery',
      },
      {
        label: 'Self-hosting',
        description: 'Initialize three-layer storage, register connectors, and plan upgrades.',
        href: '/docs/self-hosted',
      },
    ],
  },
  {
    title: 'Reference and support',
    icon: Braces,
    links: [
      {
        label: 'Resource grammar',
        description: 'Declarative tapstate/v1 layout, resource kinds, inline transforms, and references.',
        href: '/docs/reference/dsl-grammar',
      },
      {
        label: 'CLI reference',
        description: 'Offline workspace commands, connected REPL sessions, and one-shot flags.',
        href: '/docs/reference/cli',
      },
      {
        label: 'REST API',
        description: 'Authenticated control-plane endpoints and preview response contracts.',
        href: '/docs/reference/rest-api',
      },
      {
        label: 'Troubleshooting',
        description: 'Isolate validation, network, start-check, and data-movement issues.',
        href: '/docs/guides/troubleshooting',
      },
    ],
  },
];

function ArrowLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-fd-primary no-underline outline-none transition-colors duration-200 hover:text-fd-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2"
    >
      {children}
      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

export default function HomePage() {
  const publishedConnectors = getConnectorsByDocumentationStatus('current');
  const sourceConnectors = publishedConnectors.filter((item) =>
    getConnectorProductProfile(item.slug)?.useAs.includes('source'),
  );
  const sourceSlugs = new Set(sourceConnectors.map((item) => item.slug));
  const orderedConnectors = [
    ...sourceConnectors,
    ...publishedConnectors.filter(
      (item) => !sourceSlugs.has(item.slug) && getConnectorProductProfile(item.slug)?.useAs.includes('target'),
    ),
  ];

  return (
    <main className="min-h-screen bg-fd-background text-fd-foreground">
      <section className="border-b border-fd-border bg-fd-background">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 md:px-8 md:pb-20 md:pt-22">
          <div className="mx-auto max-w-3xl text-center">
            <p className="m-0 text-xs font-semibold tracking-[0.16em] text-fd-primary uppercase">
              Documentation
            </p>
            <h1 className="mt-4 text-balance text-[2.5rem] font-semibold leading-[1.06] tracking-[-0.045em] sm:text-5xl md:text-[3.5rem]">
              Capture, transform, and serve operational data.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-fd-muted-foreground md:text-lg md:leading-8">
              Tapstate captures database changes and maintains current results for applications and AI agents. Start in tapstate Cloud with the web application, or run the open-source engine yourself.
            </p>

            <div className="mx-auto mt-8 max-w-xl">
              <FullSearchTrigger
                aria-label="Search tapstate documentation"
                className="h-13 w-full cursor-pointer rounded-xl border-fd-border bg-fd-card px-4 text-left text-base text-fd-muted-foreground shadow-xs transition-[border-color,box-shadow,background-color] duration-200 hover:border-fd-primary/35 hover:bg-fd-card hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 [&_kbd]:bg-fd-muted [&_kbd]:px-2 [&_svg]:size-5 [&_svg]:text-fd-primary"
              />
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
            {entryCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group flex flex-col rounded-2xl border border-fd-border bg-fd-card p-6 text-fd-foreground no-underline shadow-2xs outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-fd-primary/35 hover:shadow-md hover:shadow-black/[0.04] focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 dark:hover:shadow-black/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl border border-fd-primary/15 bg-fd-primary/[0.07] text-fd-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-medium text-fd-muted-foreground">
                      {card.eyebrow}
                    </span>
                  </div>
                  <span className="mt-5 block text-xl font-semibold tracking-[-0.025em]">
                    {card.title}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-fd-muted-foreground">
                    {card.description}
                  </span>
                  <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold text-fd-primary transition-colors group-hover:text-fd-foreground">
                    {card.linkLabel}
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <div className="max-w-2xl">
          <p className="m-0 text-xs font-semibold tracking-[0.15em] text-fd-primary uppercase">
            Supported connectors
          </p>
          <h2 className="mb-0 mt-3 text-3xl font-semibold tracking-[-0.035em]">
            Connect operational and enterprise databases.
          </h2>
          <p className="mb-0 mt-3 text-base leading-7 text-fd-muted-foreground">
            Capture initial snapshots and ongoing CDC from MySQL, PostgreSQL, Oracle, SQL Server, and IBM Db2 systems, and maintain live views in MongoDB or MongoDB Atlas. Check the connector directory for version scope, managed-service limits, and connectors that require separate registration.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {orderedConnectors.map((connector) => {
            const profile = getConnectorProductProfile(connector.slug);
            const isTarget = profile?.useAs.includes('target');
            const logoSrc = connectorLogos[connector.slug];
            const subtitle = isTarget
              ? 'Target · Views & state'
              : profile?.availability === 'separately-registered'
                ? 'Source · Register separately'
                : 'Source · Snapshot + CDC';

            return (
              <Link
                key={connector.slug}
                href={`/docs/connectors/${connector.slug}`}
                className="group flex items-center gap-3.5 rounded-xl border border-fd-border bg-fd-card p-3.5 text-fd-foreground no-underline outline-none transition-[border-color,box-shadow,background-color] duration-150 hover:border-fd-primary/35 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-fd-ring"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-fd-border/80 bg-white p-2 shadow-2xs dark:border-white/15 dark:bg-slate-100">
                  {logoSrc ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoSrc}
                        alt=""
                        aria-hidden="true"
                        className="size-full object-contain"
                      />
                    </>
                  ) : (
                    <Database className="size-5 text-fd-primary" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-fd-foreground transition-colors group-hover:text-fd-primary">
                    {profile?.displayTitle ?? connector.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-fd-muted-foreground">
                    {subtitle}
                  </span>
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-fd-muted-foreground/60 transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-fd-primary"
                  aria-hidden="true"
                />
              </Link>
            );
          })}

          <Link
            href="/docs/connectors"
            className="group flex items-center gap-3.5 rounded-xl border border-dashed border-fd-border bg-fd-muted/25 p-3.5 text-fd-foreground no-underline outline-none transition-[border-color,background-color] duration-150 hover:border-fd-primary/40 hover:bg-fd-muted/50 focus-visible:ring-2 focus-visible:ring-fd-ring"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-fd-primary/20 bg-fd-primary/[0.08] text-fd-primary transition-colors group-hover:bg-fd-primary/[0.14]">
              <Plus className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-fd-foreground transition-colors group-hover:text-fd-primary">
                All connectors
              </span>
              <span className="mt-0.5 block truncate text-xs text-fd-muted-foreground">
                Compatibility, RDS &amp; setup
              </span>
            </span>
            <ArrowRight
              className="size-4 shrink-0 text-fd-primary transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>

      <section className="border-y border-fd-border bg-fd-muted/20">
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <div className="max-w-2xl">
            <p className="m-0 text-xs font-semibold tracking-[0.15em] text-fd-primary uppercase">
              Explore by workflow
            </p>
            <h2 className="mb-0 mt-3 text-3xl font-semibold tracking-[-0.035em]">
              Build, observe, and manage your data path.
            </h2>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3 lg:gap-10">
            {directoryColumns.map((column) => {
              const Icon = column.icon;
              return (
                <div key={column.title}>
                  <div className="flex items-center gap-2.5 border-b border-fd-border pb-3">
                    <Icon className="size-4 text-fd-primary" aria-hidden="true" />
                    <h3 className="m-0 text-sm font-semibold tracking-[-0.01em] text-fd-foreground">
                      {column.title}
                    </h3>
                  </div>
                  <ul className="m-0 mt-2 divide-y divide-fd-border/60 list-none p-0">
                    {column.links.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="group block py-3.5 no-underline outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-fd-ring"
                        >
                          <span className="flex items-center justify-between gap-2 text-sm font-semibold text-fd-foreground transition-colors group-hover:text-fd-primary">
                            {item.label}
                            <ArrowRight
                              className="size-3.5 shrink-0 text-fd-muted-foreground transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-fd-primary"
                              aria-hidden="true"
                            />
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-fd-muted-foreground">
                            {item.description}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col justify-between gap-4 rounded-2xl border border-fd-border bg-fd-card px-5 py-4 sm:px-6 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3.5 sm:items-center">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-fd-primary/15 bg-fd-primary/[0.07] text-fd-primary">
                <Bot className="size-4.5" aria-hidden="true" />
              </span>
              <div>
                <p className="m-0 text-sm font-semibold text-fd-foreground">
                  Documentation for people and agents
                </p>
                <p className="mb-0 mt-0.5 text-sm leading-6 text-fd-muted-foreground">
                  The same canonical pages are published as HTML,{' '}
                  <code className="rounded bg-fd-muted px-1.5 py-0.5 font-mono text-xs text-fd-foreground">llms.txt</code>,
                  and page-level Markdown.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <ArrowLink href="/docs/for-ai/llms">AI-ready docs</ArrowLink>
              <ArrowLink href="/llms.txt">Open llms.txt</ArrowLink>
              <ArrowLink href="/docs/reference/mcp">MCP integration</ArrowLink>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-fd-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <p className="m-0">tapstate documentation</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/docs" className="cursor-pointer text-fd-muted-foreground no-underline transition-colors hover:text-fd-foreground">All docs</Link>
          <Link href="/docs/quickstart" className="cursor-pointer text-fd-muted-foreground no-underline transition-colors hover:text-fd-foreground">Cloud quickstart</Link>
          <Link href="/docs/overview/quickstart" className="cursor-pointer text-fd-muted-foreground no-underline transition-colors hover:text-fd-foreground">Local playground</Link>
          <Link href="/docs/connectors" className="cursor-pointer text-fd-muted-foreground no-underline transition-colors hover:text-fd-foreground">Connectors</Link>
          <Link href="/docs/reference/dsl-grammar" className="cursor-pointer text-fd-muted-foreground no-underline transition-colors hover:text-fd-foreground">Reference</Link>
          <Link href="/docs/releases/v0.8" className="cursor-pointer text-fd-muted-foreground no-underline transition-colors hover:text-fd-foreground">Releases</Link>
        </div>
      </footer>
    </main>
  );
}
