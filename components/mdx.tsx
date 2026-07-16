import defaultMdxComponents from 'fumadocs-ui/mdx';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Bot, Braces, Cable, CircleAlert, CircleCheck, Database, FileText, GitBranch, Layers3, RadioTower, Store, TableProperties, Wrench } from 'lucide-react';
import type { ReactNode } from 'react';
import type { MDXComponents } from 'mdx/types';
import {
  connectorCategories,
  connectorMaturityCounts,
  getConnectorsByCategory,
  type ConnectorCategoryId,
  type ConnectorMaturity,
} from '@/lib/connector-directory';

type AsideType = 'note' | 'tip' | 'caution' | 'danger';

const asideClassName: Record<AsideType, string> = {
  note: 'border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100',
  tip: 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100',
  caution:
    'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100',
  danger: 'border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100',
};

export function Aside({
  children,
  title,
  type = 'note',
}: {
  children: ReactNode;
  title?: ReactNode;
  type?: AsideType;
}) {
  return (
    <aside className={`my-6 rounded-lg border p-4 ${asideClassName[type] ?? asideClassName.note}`}>
      {title ? <p className="mb-2 font-semibold">{title}</p> : null}
      <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{children}</div>
    </aside>
  );
}

export function LinkCard({
  title,
  description,
  href,
}: {
  title: ReactNode;
  description?: ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border bg-card p-4 text-card-foreground no-underline transition-colors hover:bg-accent/40"
    >
      <p className="mb-2 font-semibold">{title}</p>
      {description ? <p className="m-0 text-sm text-muted-foreground">{description}</p> : null}
    </Link>
  );
}

export function CardGrid({ children }: { children: ReactNode }) {
  return <div className="my-6 grid gap-4 sm:grid-cols-2">{children}</div>;
}

/** A product-led introduction for the What is tapstate page. */
export function ProductOverviewHero() {
  const pillars = [
    { label: 'Capture', text: 'Load existing data, then follow committed changes.', icon: Database },
    { label: 'Transform', text: 'Shape and route data incrementally as it moves.', icon: GitBranch },
    { label: 'Serve', text: 'Maintain fresh, queryable state for downstream systems.', icon: Layers3 },
  ];

  return (
    <section className="not-prose relative mb-14 border-b border-fd-border pb-12 pt-3 sm:pb-14 sm:pt-6">
      <div aria-hidden="true" className="absolute -left-24 -top-20 -z-10 size-72 rounded-full bg-fd-primary/[0.055] blur-3xl" />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(19rem,0.92fr)] lg:items-center lg:gap-14">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-fd-primary">
            Product overview
          </p>
          <h1 className="m-0 max-w-4xl text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.047em] text-fd-foreground md:text-5xl lg:text-[3.6rem]">
            Build and maintain live operational state.
          </h1>
          <p className="mb-0 mt-5 max-w-3xl text-pretty text-base leading-8 text-fd-muted-foreground md:text-lg">
            Tapstate is an open-source unified operational data engine. It captures production database changes, transforms data incrementally as it moves, and serves fresh, queryable state to applications, APIs, automation, and AI agents.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/docs/overview/quickstart" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-fd-primary px-4 text-sm font-semibold text-fd-primary-foreground no-underline transition-colors hover:bg-fd-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">
              Start the quickstart
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link href="/docs/connectors" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-fd-border bg-fd-background px-4 text-sm font-semibold text-fd-foreground no-underline transition-colors hover:border-fd-primary/30 hover:bg-fd-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">
              Browse connectors
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link href="/llms.mdx/docs/overview/what-is-tapstate/content.md" className="inline-flex h-10 items-center justify-center gap-2 px-2 text-sm font-semibold text-fd-muted-foreground no-underline hover:text-fd-foreground">
              <FileText aria-hidden="true" className="size-4" />
              View as Markdown
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-fd-border bg-fd-card shadow-lg shadow-black/[0.04] dark:shadow-black/20">
          <div className="border-b border-fd-border bg-fd-muted/30 px-5 py-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.13em] text-fd-muted-foreground">Capture · Transform · Serve</p>
          </div>
          <ol className="m-0 list-none p-0">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <li key={pillar.label} className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] gap-3 border-b border-fd-border px-5 py-5 last:border-0">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-fd-primary/[0.08] text-fd-primary">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-fd-foreground">{pillar.label}</span>
                    <span className="mt-1 block text-sm leading-6 text-fd-muted-foreground">{pillar.text}</span>
                  </span>
                  <span className="pt-0.5 text-[0.65rem] font-semibold tracking-widest text-fd-muted-foreground">0{index + 1}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

function ArchitectureNode({
  title,
  description,
  icon: Icon,
  accent = false,
}: {
  title: string;
  description: string;
  icon: typeof Database;
  accent?: boolean;
}) {
  return (
    <div className={`min-w-0 rounded-xl border p-3.5 ${accent ? 'border-fd-primary/25 bg-fd-primary/[0.07]' : 'border-fd-border bg-fd-background/85'}`}>
      <div className="flex items-center gap-2">
        <Icon aria-hidden="true" className={`size-4 ${accent ? 'text-fd-primary' : 'text-fd-muted-foreground'}`} />
        <p className="m-0 text-sm font-semibold text-fd-foreground">{title}</p>
      </div>
      <p className="mb-0 mt-2 text-xs leading-5 text-fd-muted-foreground">{description}</p>
    </div>
  );
}

/** Responsive, semantic representation of the logical tapstate architecture. */
export function TapStateArchitecture() {
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-fd-border bg-fd-card shadow-sm shadow-black/[0.03] dark:shadow-none">
      <figcaption className="border-b border-fd-border px-5 py-4">
        <p className="m-0 text-sm font-semibold text-fd-foreground">Logical architecture</p>
        <p className="mb-0 mt-1 text-xs leading-5 text-fd-muted-foreground">One control plane governs the data path and its recovery state.</p>
      </figcaption>

      <div className="p-4 sm:p-5">
        <div className="rounded-xl border border-fd-primary/20 bg-fd-primary/[0.055] p-4">
          <div className="mb-3 flex items-center gap-2">
            <Braces aria-hidden="true" className="size-4 text-fd-primary" />
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-fd-primary">Control plane</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <ArchitectureNode title="Author" description="Define connections and pipelines." icon={Braces} />
            <ArchitectureNode title="Validate" description="Check resources, references, and connector fields." icon={CircleCheck} />
            <ArchitectureNode title="Operate" description="Apply, observe, and control lifecycle." icon={Bot} />
          </div>
        </div>

        <div className="flex justify-center py-3" aria-hidden="true"><span className="h-6 w-px bg-fd-border" /></div>

        <div className="rounded-xl border border-fd-border bg-fd-muted/20 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Cable aria-hidden="true" className="size-4 text-fd-primary" />
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-fd-primary">Data plane</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <ArchitectureNode title="Sources" description="Databases, brokers, files, and APIs." icon={Database} />
            <ArchitectureNode title="Capture" description="Initial data and later changes." icon={RadioTower} accent />
            <ArchitectureNode title="Transform" description="Filter, map, enrich, join, and route." icon={GitBranch} accent />
            <ArchitectureNode title="Materialize" description="Maintain destination-ready current state." icon={Layers3} accent />
            <ArchitectureNode title="Deliver" description="Write targets or publish streams." icon={Cable} accent />
            <ArchitectureNode title="Consumers" description="Applications, APIs, and agents." icon={Bot} />
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-dashed border-fd-border bg-fd-background/60 px-4 py-3">
          <p className="m-0 text-xs font-semibold text-fd-foreground">Durable recovery state</p>
          <p className="mb-0 mt-1 text-xs leading-5 text-fd-muted-foreground">Resource versions · checkpoints · schema and mapping state · retries · operational history</p>
        </div>
      </div>
    </figure>
  );
}

export function Badge({ text, children }: { text?: ReactNode; children?: ReactNode; variant?: string }) {
  return (
    <span className="inline-flex rounded-md border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
      {text ?? children}
    </span>
  );
}

function DataPathNode({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'primary';
}) {
  const className = tone === 'primary'
    ? 'border-sky-200 bg-white text-sky-950 shadow-sm dark:border-sky-800 dark:bg-slate-950 dark:text-sky-100'
    : 'border-fd-border bg-fd-background text-fd-foreground';

  return (
    <span className={`inline-flex min-w-24 shrink-0 items-center justify-center rounded-lg border px-3 py-2 text-center text-xs font-semibold leading-5 ${className}`}>
      {children}
    </span>
  );
}

function DataPathArrow({ tone = 'neutral' }: { tone?: 'neutral' | 'primary' }) {
  return (
    <ArrowRight
      aria-hidden="true"
      className={`size-4 shrink-0 ${tone === 'primary' ? 'text-sky-500 dark:text-sky-300' : 'text-fd-muted-foreground'}`}
      strokeWidth={2}
    />
  );
}

/** A reader-first comparison of an assembled streaming stack and the tapstate product model. */
export function DataPathComparison() {
  return (
    <section aria-label="Operational data path comparison" className="not-prose my-8 overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-sm shadow-black/[0.025] dark:shadow-none">
      <div className="grid divide-y divide-fd-border">
        <section className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="m-0 text-sm font-semibold text-fd-foreground">The assembled stack</h3>
            <p className="m-0 text-xs text-fd-muted-foreground">Separate tools and operating boundaries</p>
          </div>
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-[48rem] items-center gap-2">
              <DataPathNode>Source systems</DataPathNode>
              <DataPathArrow />
              <DataPathNode>Capture</DataPathNode>
              <DataPathArrow />
              <DataPathNode>Broker</DataPathNode>
              <DataPathArrow />
              <DataPathNode>Processing</DataPathNode>
              <DataPathArrow />
              <DataPathNode>Serving store</DataPathNode>
              <DataPathArrow />
              <DataPathNode>Apps, automation &amp; agents</DataPathNode>
            </div>
          </div>
        </section>
        <section className="bg-sky-50/65 p-4 dark:bg-sky-950/20 sm:p-5">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="m-0 text-sm font-semibold text-sky-950 dark:text-sky-100">The tapstate data path</h3>
            <p className="m-0 text-xs text-sky-800/80 dark:text-sky-200/80">One deployable Capture–Transform–Serve path</p>
          </div>
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-[36rem] items-center gap-2">
              <DataPathNode tone="primary">Source systems</DataPathNode>
              <DataPathArrow tone="primary" />
              <div className="flex min-w-72 shrink-0 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-100/70 px-4 py-3 dark:border-sky-800 dark:bg-sky-950/45">
                <span className="text-sm font-semibold text-sky-950 dark:text-sky-100">tapstate</span>
                <span className="h-4 w-px bg-sky-300 dark:bg-sky-700" aria-hidden="true" />
                <span className="text-xs font-medium text-sky-800 dark:text-sky-200">Capture</span>
                <span className="text-sky-400 dark:text-sky-500" aria-hidden="true">·</span>
                <span className="text-xs font-medium text-sky-800 dark:text-sky-200">Transform</span>
                <span className="text-sky-400 dark:text-sky-500" aria-hidden="true">·</span>
                <span className="text-xs font-medium text-sky-800 dark:text-sky-200">Serve</span>
              </div>
              <DataPathArrow tone="primary" />
              <DataPathNode tone="primary">Apps, automation &amp; agents</DataPathNode>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

type ConnectorProfileProps = {
  category: string;
  maturity: string;
  maturityLabel: string;
  worksAs: string;
  capabilities: string;
  compatibility: string;
};

const connectorCategoryAnchors: Record<string, ConnectorCategoryId> = {
  Databases: 'databases',
  'Warehouses & analytics': 'warehouses-analytics',
  'Streaming & messaging': 'streaming-messaging',
  Files: 'files',
  'SaaS, business & commerce APIs': 'saas-business-commerce-apis',
  'Custom & development': 'custom-development',
};

function connectorMaturityTone(maturity: string) {
  const normalized = maturity.trim().toLowerCase();

  if (normalized === 'ga') {
    return {
      badge: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/45 dark:text-emerald-300',
      label: 'text-emerald-800/80 dark:text-emerald-200/80',
    };
  }

  if (normalized === 'deprecated' || normalized === 'unavailable') {
    return {
      badge: 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/45 dark:text-rose-300',
      label: 'text-rose-800/80 dark:text-rose-200/80',
    };
  }

  return {
    badge: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/45 dark:text-amber-200',
    label: 'text-amber-900/80 dark:text-amber-200/80',
  };
}

function ConnectorProfileRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5 py-2.5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-center sm:gap-4">
      <dt className="text-sm font-medium text-fd-muted-foreground">{label}</dt>
      <dd className="m-0 min-w-0 text-sm font-medium text-fd-card-foreground">{children}</dd>
    </div>
  );
}

function ConnectorProfileTags({ value }: { value: string }) {
  const tone = (item: string) => {
    const key = item.trim().toLowerCase();

    if (key === 'source' || key === 'snapshot') {
      return 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/45 dark:text-sky-200';
    }
    if (key === 'target' || key === 'schema discovery') {
      return 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/45 dark:text-violet-200';
    }
    if (key === 'cdc') {
      return 'border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/45 dark:text-cyan-200';
    }
    if (key === 'stream read' || key === 'stream write') {
      return 'border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/45 dark:text-cyan-200';
    }
    if (key === 'schema registry') {
      return 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/45 dark:text-indigo-200';
    }
    if (key === 'ddl capture') {
      return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/45 dark:text-amber-200';
    }
    if (key === 'ddl apply') {
      return 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/45 dark:text-rose-200';
    }

    return 'border-fd-border bg-fd-muted/55 text-fd-foreground';
  };

  return (
    <span className="flex flex-wrap gap-1.5">
      {value.split(',').map((item) => (
        <span
          key={item}
          className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium leading-5 ${tone(item)}`}
        >
          {item.trim()}
        </span>
      ))}
    </span>
  );
}

/** A compact connector summary that remains a structured definition list in LLM output. */
export function ConnectorProfile({
  category,
  maturity,
  maturityLabel,
  worksAs,
  capabilities,
  compatibility,
}: ConnectorProfileProps) {
  const maturityTone = connectorMaturityTone(maturity);

  return (
    <section
      aria-label="Connector profile"
      className="not-prose my-7 rounded-xl border border-fd-border bg-fd-card px-4 shadow-sm shadow-black/[0.025] sm:px-5 dark:shadow-none"
    >
      <h2 className="sr-only">Connector profile</h2>
      <dl className="divide-y divide-fd-border">
        <ConnectorProfileRow label="Category">
          <Link
            href={`/docs/connectors#connector-category-${connectorCategoryAnchors[category] ?? 'databases'}`}
            className="group inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-muted/55 px-2 py-0.5 text-xs font-medium leading-5 text-fd-foreground no-underline transition-colors hover:border-fd-primary/40 hover:text-fd-primary"
          >
            <span>{category}</span>
            <ArrowRight aria-hidden="true" className="size-3 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </Link>
        </ConnectorProfileRow>
        <ConnectorProfileRow label="Maturity">
          <span className="flex flex-wrap items-center gap-2.5">
            <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold leading-5 ${maturityTone.badge}`}>
              <BadgeCheck aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
              {maturity}
            </span>
            <span className={maturityTone.label}>{maturityLabel}</span>
          </span>
        </ConnectorProfileRow>
        <ConnectorProfileRow label="Works as">
          <ConnectorProfileTags value={worksAs} />
        </ConnectorProfileRow>
        <ConnectorProfileRow label="Capabilities">
          <ConnectorProfileTags value={capabilities} />
        </ConnectorProfileRow>
        <ConnectorProfileRow label="Compatibility">
          <span className="inline-flex items-center gap-1.5 text-fd-card-foreground">
            <Database aria-hidden="true" className="size-3.5 text-indigo-500" strokeWidth={2} />
            {compatibility}
          </span>
        </ConnectorProfileRow>
      </dl>
    </section>
  );
}

/** Common validation outcomes followed by the next customer-facing verification step. */
export function ValidationStatusGuide() {
  return (
    <div className="not-prose my-5 overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      <div className="grid gap-px bg-fd-border sm:grid-cols-2">
        <section className="bg-fd-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <CircleCheck aria-hidden="true" className="size-4" strokeWidth={2.25} />
            Configuration accepted
          </div>
          <code className="block rounded-md bg-emerald-50 px-2.5 py-2 text-xs text-emerald-950 dark:bg-emerald-950/35 dark:text-emerald-100">
            valid: 3 resources in tapstate-work
          </code>
          <p className="mb-0 mt-2 text-xs leading-5 text-fd-muted-foreground">
            The resource files, references, modes, and recognized field formats were accepted.
          </p>
        </section>
        <section className="bg-fd-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-300">
            <CircleAlert aria-hidden="true" className="size-4" strokeWidth={2.25} />
            Changes required
          </div>
          <code className="block whitespace-pre-wrap rounded-md bg-rose-50 px-2.5 py-2 text-xs leading-5 text-rose-950 dark:bg-rose-950/35 dark:text-rose-100">
            {`invalid: orders_source.tapstate.yml:12:1  dsl.unknown-field
Unknown field 'unexpected' at unexpected.`}
          </code>
          <p className="mb-0 mt-2 text-xs leading-5 text-fd-muted-foreground">
            Use the filename, location, diagnostic code, and suggested fix to update the resource.
          </p>
        </section>
      </div>
      <p className="m-0 border-t border-fd-border bg-fd-muted/25 px-4 py-3 text-xs leading-5 text-fd-muted-foreground">
        Next, run the connection in a non-production environment and confirm credentials, network access, permissions, and a representative read or write.
      </p>
    </div>
  );
}

const categoryPresentation: Record<
  ConnectorCategoryId,
  { icon: typeof Database; iconClassName: string }
> = {
  databases: {
    icon: Database,
    iconClassName: 'bg-sky-50 text-sky-700 dark:bg-sky-950/45 dark:text-sky-300',
  },
  'warehouses-analytics': {
    icon: TableProperties,
    iconClassName: 'bg-violet-50 text-violet-700 dark:bg-violet-950/45 dark:text-violet-300',
  },
  'streaming-messaging': {
    icon: RadioTower,
    iconClassName: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/45 dark:text-cyan-300',
  },
  files: {
    icon: FileText,
    iconClassName: 'bg-amber-50 text-amber-800 dark:bg-amber-950/45 dark:text-amber-200',
  },
  'saas-business-commerce-apis': {
    icon: Store,
    iconClassName: 'bg-rose-50 text-rose-700 dark:bg-rose-950/45 dark:text-rose-300',
  },
  'custom-development': {
    icon: Wrench,
    iconClassName: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  },
};

function DirectoryMaturity({ maturity }: { maturity: ConnectorMaturity }) {
  const presentation = maturity === 'ga'
    ? {
        label: 'GA',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/45 dark:text-emerald-300',
      }
    : maturity === 'deprecated'
      ? {
          label: 'Deprecated',
          className: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/45 dark:text-rose-300',
        }
      : {
          label: 'Preview',
          className: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/45 dark:text-amber-200',
        };

  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${presentation.className}`}>
      {presentation.label}
    </span>
  );
}

/** A compact, filter-free connector index. The canonical data lives in connector-directory.ts. */
export function SupportedConnectorMatrix() {
  const maturityCounts = connectorMaturityCounts();

  return (
    <section aria-label="Supported connectors" className="not-prose my-8">
      <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-fd-muted-foreground">
        <span className="font-medium text-fd-foreground">{maturityCounts.ga + maturityCounts.preview} active connectors</span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5"><DirectoryMaturity maturity="ga" /> {maturityCounts.ga}</span>
        <span className="inline-flex items-center gap-1.5"><DirectoryMaturity maturity="preview" /> {maturityCounts.preview}</span>
      </div>

      <div className="space-y-9">
        {connectorCategories.map((category) => {
          const Icon = categoryPresentation[category.id].icon;
          const connectors = getConnectorsByCategory(category.id).filter((connector) => connector.maturity !== 'deprecated');

          return (
            <section key={category.id} aria-labelledby={`connector-category-${category.id}`} className="border-t border-fd-border pt-5">
              <header className="mb-3 flex items-start gap-3">
                <span className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${categoryPresentation[category.id].iconClassName}`}>
                  <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
                </span>
                <div>
                  <h2 id={`connector-category-${category.id}`} className="m-0 text-base font-semibold tracking-tight text-fd-foreground">
                    {category.label}
                  </h2>
                  <p className="mb-0 mt-1 text-sm leading-6 text-fd-muted-foreground">{category.description}</p>
                </div>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
                  <thead className="border-b border-fd-border text-xs font-medium uppercase tracking-[0.08em] text-fd-muted-foreground">
                    <tr>
                      <th className="px-0 py-2.5 font-medium">Connector</th>
                      <th className="px-3 py-2.5 font-medium">Maturity</th>
                      <th className="px-3 py-2.5 font-medium">Works as</th>
                      <th className="px-3 py-2.5 font-medium">Read mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fd-border/80">
                    {connectors.map((connector) => (
                      <tr key={connector.slug} className="transition-colors hover:bg-fd-accent/40">
                        <th className="px-0 py-2.5 font-medium text-fd-foreground">
                          <Link href={`/docs/connectors/${connector.slug}`} className="group inline-flex items-center gap-1.5 text-fd-primary underline decoration-fd-primary/25 underline-offset-4 transition-colors hover:decoration-fd-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">
                            <span>{connector.title}</span>
                            <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                          </Link>
                        </th>
                        <td className="px-3 py-2.5"><DirectoryMaturity maturity={connector.maturity} /></td>
                        <td className="px-3 py-2.5 text-fd-muted-foreground">
                          {connector.useAs.length > 0
                            ? connector.useAs.map((role) => role[0].toUpperCase() + role.slice(1)).join(' + ')
                            : 'Not declared'}
                        </td>
                        <td className="px-3 py-2.5 text-fd-muted-foreground">
                          {connector.modes.length > 0
                            ? connector.modes.join(' · ')
                            : connector.useAs.includes('source')
                              ? 'Not declared'
                              : connector.useAs.includes('target')
                                ? '—'
                                : 'Not declared'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}

        {maturityCounts.deprecated > 0 ? (
          <section aria-labelledby="connector-category-legacy" className="border-t border-fd-border pt-5">
            <header className="mb-3">
              <h2 id="connector-category-legacy" className="m-0 text-base font-semibold tracking-tight text-fd-foreground">Legacy connectors</h2>
              <p className="mb-0 mt-1 text-sm leading-6 text-fd-muted-foreground">Kept for existing deployments. Choose the named replacement for new pipelines.</p>
            </header>
            <div className="grid gap-3 sm:grid-cols-2">
              {connectorCategories.flatMap((category) => getConnectorsByCategory(category.id))
                .filter((connector) => connector.maturity === 'deprecated')
                .map((connector) => (
                  <Link key={connector.slug} href={`/docs/connectors/${connector.slug}`} className="flex items-center justify-between gap-4 rounded-xl border border-fd-border bg-fd-card px-4 py-3 text-fd-foreground no-underline transition-colors hover:border-fd-primary/30 hover:bg-fd-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">
                    <span>
                      <span className="block text-sm font-semibold">{connector.title}</span>
                      <span className="mt-1 block text-xs text-fd-muted-foreground">Migration guidance and existing configuration reference</span>
                    </span>
                    <DirectoryMaturity maturity="deprecated" />
                  </Link>
                ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Aside,
    CardGrid,
    LinkCard,
    Badge,
    ProductOverviewHero,
    TapStateArchitecture,
    DataPathComparison,
    ConnectorProfile,
    ValidationStatusGuide,
    SupportedConnectorMatrix,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
