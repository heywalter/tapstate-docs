import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Bot, Braces, Cable, CircleAlert, CircleCheck, Database, FileText, GitBranch, Info, KeyRound, Layers3, RadioTower, Server, TerminalSquare } from 'lucide-react';
import type { ReactNode } from 'react';
import type { MDXComponents } from 'mdx/types';
import {
  connectorMaturityCounts,
  getConnectorProductProfile,
  getConnectorsByDocumentationStatus,
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
    { label: 'Transform', text: 'Filter, map, script, and merge data as it moves.', icon: GitBranch },
    { label: 'Serve', text: 'Write current state to a downstream system.', icon: Layers3 },
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
            Tapstate is an open-source unified operational data engine in preview. It builds and maintains live operational state—an Operational State Layer—for applications, APIs, automation, and AI agents. The Quickstart assembles MySQL orders and PostgreSQL shipments into a MongoDB document, then keeps it current with CDC.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/docs/overview/quickstart" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-fd-primary px-4 text-sm font-semibold text-fd-primary-foreground no-underline transition-colors hover:bg-fd-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">
              Run the quickstart
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

/** Shows the one end-to-end path available in the current local preview. */
export function PreviewArchitecture() {
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-fd-border bg-fd-card shadow-sm shadow-black/[0.03] dark:shadow-none">
      <figcaption className="border-b border-fd-border px-5 py-4">
        <p className="m-0 text-sm font-semibold text-fd-foreground">Current preview architecture</p>
        <p className="mb-0 mt-1 text-xs leading-5 text-fd-muted-foreground">A runnable, single-node path that assembles MySQL and PostgreSQL changes into MongoDB state.</p>
      </figcaption>
      <section aria-label="Current preview control and data paths" className="grid gap-2 rounded-xl border border-fd-border bg-fd-muted/20 p-4 sm:grid-cols-[minmax(0,1fr)_2rem_minmax(17rem,1.25fr)_2rem_minmax(0,1fr)] sm:grid-rows-[auto_auto_auto_auto_auto_auto_auto] sm:gap-x-2 sm:gap-y-2 sm:p-5">
        <p className="order-1 mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-fd-primary sm:col-start-1 sm:row-start-1 sm:mb-0">Control path</p>
        <div className="order-2 sm:col-start-3 sm:row-start-2">
          <WorkflowNode title=".tap.yml workspace" description="Source and pipeline resources." icon={FileText} />
        </div>
        <div className="order-3 sm:col-start-3 sm:row-start-3">
          <WorkflowVerticalArrow label="validate / apply" />
        </div>
        <div className="order-4 sm:col-start-3 sm:row-start-4">
          <WorkflowNode title="tapstate CLI" description="Offline authoring and authenticated control requests." icon={TerminalSquare} accent />
        </div>
        <div className="order-5 sm:col-start-3 sm:row-start-5">
          <WorkflowVerticalArrow label="Submit (HTTP)" />
        </div>
        <p className="order-6 mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-fd-primary sm:col-start-1 sm:row-start-6 sm:mb-0 sm:self-start">Data path</p>
        <div className="order-7 sm:col-start-1 sm:row-start-7">
          <WorkflowNode title="MySQL + PostgreSQL" description="Independent initial snapshots and later CDC." icon={Database} />
        </div>
        <div className="order-8 sm:col-start-2 sm:row-start-7">
          <WorkflowArrow />
        </div>
        <div className="order-9 sm:col-start-3 sm:row-start-7">
          <WorkflowNode title="Single-node server" subtitle="Capture & transform" description="Registers artifacts, runs pipelines, and reports status." icon={Server} accent />
        </div>
        <div className="order-10 sm:col-start-4 sm:row-start-7">
          <WorkflowArrow />
        </div>
        <div className="order-11 sm:col-start-5 sm:row-start-7">
          <WorkflowNode title="Managed MongoDB state" description="The Quickstart materializes its view here." icon={Layers3} />
        </div>
      </section>
    </figure>
  );
}

/** Responsive, semantic representation of the target tapstate architecture. */
export function TapStateArchitecture() {
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-fd-border bg-fd-card shadow-sm shadow-black/[0.03] dark:shadow-none">
      <figcaption className="border-b border-fd-border px-5 py-4">
        <p className="m-0 text-sm font-semibold text-fd-foreground">Target logical architecture</p>
        <p className="mb-0 mt-1 text-xs leading-5 text-fd-muted-foreground">Design direction, not the current preview implementation boundary.</p>
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
            <ArchitectureNode title="Transform" description="Filter, map, script, union, and assemble related records with nest." icon={GitBranch} accent />
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

/** A reader-first comparison of an assembled streaming stack and the tapstate target model. */
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
            <h3 className="m-0 text-sm font-semibold text-sky-950 dark:text-sky-100">The tapstate target path</h3>
            <p className="m-0 text-xs text-sky-800/80 dark:text-sky-200/80">Target Capture–Transform–Serve operating model</p>
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

function WorkflowNode({
  title,
  subtitle,
  description,
  icon: Icon,
  accent = false,
}: {
  title: string;
  subtitle?: string;
  description: string;
  icon: typeof Database;
  accent?: boolean;
}) {
  return (
    <div className={`min-w-0 flex-1 rounded-xl border p-4 ${accent ? 'border-fd-primary/25 bg-fd-primary/[0.07]' : 'border-fd-border bg-fd-background'}`}>
      <div className="flex items-center gap-2">
        <Icon aria-hidden="true" className={`size-4 ${accent ? 'text-fd-primary' : 'text-fd-muted-foreground'}`} />
        <p className="m-0 text-sm font-semibold text-fd-foreground">{title}</p>
      </div>
      {subtitle ? <p className="mb-0 mt-1.5 text-xs font-semibold leading-5 text-fd-primary">{subtitle}</p> : null}
      <p className={`mb-0 text-xs leading-5 text-fd-muted-foreground ${subtitle ? 'mt-1' : 'mt-2'}`}>{description}</p>
    </div>
  );
}

function WorkflowArrow({ label }: { label?: string }) {
  return (
    <span className="flex shrink-0 flex-col items-center justify-center gap-1 py-1 text-[0.65rem] font-medium text-fd-muted-foreground sm:px-1">
      {label ? <span>{label}</span> : null}
      <ArrowRight aria-hidden="true" className="size-4 rotate-90 sm:rotate-0" />
    </span>
  );
}

function WorkflowVerticalArrow({ label }: { label: string }) {
  return (
    <span className="flex shrink-0 flex-col items-center justify-center gap-1 py-1 text-[0.65rem] font-medium text-fd-muted-foreground">
      <span>{label}</span>
      <ArrowRight aria-hidden="true" className="size-4 rotate-90" />
    </span>
  );
}

function QuickstartFlowArrow({ label, delays = [0] }: { label: string; delays?: number[] }) {
  return (
    <span className="flex shrink-0 flex-col items-center justify-center gap-1 py-1 text-center text-[0.65rem] font-medium text-fd-muted-foreground lg:px-1">
      <span>{label}</span>
      <span aria-hidden="true" className="relative flex h-9 w-8 items-center justify-center lg:h-8 lg:w-12">
        <span className="absolute h-full w-px bg-fd-border lg:h-px lg:w-full" />
        {delays.map((delay) => (
          <span key={delay} className="quickstart-flow-pulse absolute size-2 rounded-full bg-fd-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-fd-primary)_16%,transparent)]" style={{ animationDelay: `${delay}ms` }} />
        ))}
        <ArrowRight className="absolute bottom-[-0.2rem] size-4 rotate-90 text-fd-primary lg:bottom-auto lg:right-[-0.2rem] lg:rotate-0" />
      </span>
    </span>
  );
}

function QuickstartEventCard({
  source,
  table,
  rows,
}: {
  source: string;
  table: string;
  rows: Array<Array<[string, string]>>;
}) {
  return (
    <div className="rounded-lg border border-fd-border bg-fd-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database aria-hidden="true" className="size-3.5 text-fd-primary" />
          <p className="m-0 text-xs font-semibold text-fd-foreground">{source}</p>
        </div>
        <code className="rounded bg-fd-muted px-1.5 py-0.5 text-[0.6rem] text-fd-muted-foreground">{table}</code>
      </div>
      <div className="mt-2.5 overflow-x-auto rounded-md border border-fd-border/70 bg-fd-muted/35 px-2.5 py-2 font-mono">
        <p className="m-0 whitespace-nowrap text-[0.52rem] uppercase tracking-[0.04em] text-fd-muted-foreground">
          {rows[0].map(([field]) => field).join(' · ')}
        </p>
        {rows.map((row, rowIndex) => (
          <p key={rowIndex} className="quickstart-source-row m-0 mt-1 whitespace-nowrap rounded px-1 py-0.5 text-[0.6rem] font-medium text-fd-foreground" style={{ animationDelay: `${rowIndex * 500}ms` }}>
            {row.map(([, value]) => value).join(' · ')}
          </p>
        ))}
      </div>
    </div>
  );
}

/** Shows the concrete data path started by the v0.3.0 Quickstart. */
export function QuickstartDataFlow() {
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-fd-border bg-fd-card shadow-sm shadow-black/[0.03] dark:shadow-none">
      <figcaption className="border-b border-fd-border px-5 py-4">
        <p className="m-0 text-sm font-semibold text-fd-foreground">From two databases to one current order</p>
        <p className="mb-0 mt-1 text-xs leading-5 text-fd-muted-foreground">Real playground values; the complete document appears in the verification step below.</p>
      </figcaption>
      <div className="grid gap-2 p-3 sm:p-4 lg:grid-cols-[minmax(0,1.08fr)_3rem_minmax(0,0.82fr)_3rem_minmax(0,1.22fr)] lg:items-stretch">
        <section aria-label="Source database records" className="grid content-start gap-2 rounded-xl border border-fd-border bg-fd-muted/20 p-2.5">
          <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-fd-primary">Source records</p>
          <QuickstartEventCard
            source="MySQL"
            table="orders"
            rows={[[['id', '1'], ['customer', 'alice'], ['amount', '10.00']]]}
          />
          <QuickstartEventCard
            source="PostgreSQL"
            table="shipments"
            rows={[
              [['id', '1'], ['order_id', '1'], ['carrier', 'dhl'], ['status', 'delivered']],
              [['id', '2'], ['order_id', '1'], ['carrier', 'ups'], ['status', 'in_transit']],
            ]}
          />
        </section>
        <QuickstartFlowArrow label="Snapshot + CDC" delays={[0, 650]} />
        <section className="quickstart-engine-node relative grid content-center overflow-hidden rounded-xl border border-fd-primary/25 bg-fd-primary/[0.065] p-3.5">
          <div className="relative flex items-start gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg border border-fd-primary/25 bg-fd-background text-fd-primary shadow-sm">
              <Server aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-sm font-semibold text-fd-foreground">Single-node server</p>
              <p className="mb-0 mt-0.5 text-[0.65rem] font-semibold text-fd-primary">Capture &amp; transform</p>
            </div>
          </div>
          <div className="quickstart-nest-stage relative mt-3 rounded-lg border border-fd-primary/25 bg-fd-background/80 px-2.5 py-2.5 text-center">
            <p className="m-0 text-[0.65rem] font-semibold text-fd-primary">nest</p>
            <code className="mt-2 block text-[0.58rem] leading-4 text-fd-muted-foreground">shipments.order_id<br /><span aria-hidden="true">↓</span><span className="sr-only"> matches </span><br />orders.id</code>
          </div>
        </section>
        <QuickstartFlowArrow label="Materialize" delays={[2200]} />
        <section className="quickstart-state-node rounded-xl border border-fd-primary/25 bg-fd-primary/[0.065] p-3.5">
          <div className="flex items-center gap-2">
            <Layers3 aria-hidden="true" className="size-4 text-fd-primary" />
            <div>
              <p className="m-0 text-sm font-semibold text-fd-foreground">views.order_state</p>
              <p className="mb-0 mt-0.5 text-[0.65rem] font-semibold text-fd-primary">Managed MongoDB state</p>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-fd-border bg-fd-background/85 p-3 text-[0.62rem] leading-4">
            <div className="grid grid-cols-3 gap-2 border-b border-fd-border pb-2 font-mono">
              <p className="m-0"><span className="block text-[0.5rem] uppercase text-fd-muted-foreground">id</span><span className="font-semibold text-fd-foreground">1</span></p>
              <p className="m-0"><span className="block text-[0.5rem] uppercase text-fd-muted-foreground">customer</span><span className="font-semibold text-fd-foreground">alice</span></p>
              <p className="m-0"><span className="block text-[0.5rem] uppercase text-fd-muted-foreground">amount</span><span className="font-semibold text-fd-foreground">10.00</span></p>
            </div>
            <div className="quickstart-state-update mt-2 rounded px-1.5 py-1">
              <p className="m-0 font-semibold text-fd-foreground">shipments <span className="font-normal text-fd-muted-foreground">· 2</span></p>
              <p className="m-0 mt-1 font-mono text-fd-muted-foreground">#1 · dhl · delivered</p>
              <p className="m-0 font-mono text-fd-muted-foreground">#2 · ups · in_transit</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.58rem]">
            <span className="text-fd-muted-foreground">Read with</span>
            <Link href="/docs/reference/cli#read-data-from-a-declared-source" className="rounded-full border border-fd-border bg-fd-background px-2 py-0.5 font-semibold text-fd-foreground no-underline hover:border-fd-primary/35">CLI</Link>
            <Link href="/docs/reference/rest-api#read-data-through-a-declared-source" className="rounded-full border border-fd-border bg-fd-background px-2 py-0.5 font-semibold text-fd-foreground no-underline hover:border-fd-primary/35">REST</Link>
            <Link href="/docs/reference/mcp#tools" className="rounded-full border border-fd-primary/25 bg-fd-primary/[0.08] px-2 py-0.5 font-semibold text-fd-primary no-underline hover:border-fd-primary/45">MCP · AI agents</Link>
          </div>
        </section>
      </div>
    </figure>
  );
}

/** Shows which CLI work is local and which work requires a running server. */
export function CliServerWorkflow() {
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-fd-border bg-fd-card shadow-sm shadow-black/[0.03] dark:shadow-none">
      <figcaption className="border-b border-fd-border px-5 py-4">
        <p className="m-0 text-sm font-semibold text-fd-foreground">CLI and server responsibilities</p>
        <p className="mb-0 mt-1 text-xs leading-5 text-fd-muted-foreground">Author locally; connect to a server only when an operation needs the control plane or runtime.</p>
      </figcaption>
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
        <section className="rounded-xl border border-fd-border bg-fd-muted/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="m-0 text-sm font-semibold text-fd-foreground">Offline authoring</h3>
            <span className="rounded-full border border-fd-border bg-fd-background px-2.5 py-1 text-[0.65rem] font-semibold text-fd-muted-foreground">No server</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <WorkflowNode title="CLI" description="Create and inspect resources." icon={TerminalSquare} />
            <WorkflowArrow />
            <WorkflowNode title="Local workspace" description="Run new, validate, explain, ls, and desc." icon={FileText} accent />
          </div>
        </section>
        <section className="rounded-xl border border-fd-primary/20 bg-fd-primary/[0.04] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="m-0 text-sm font-semibold text-fd-foreground">Connected operation</h3>
            <span className="rounded-full border border-fd-primary/20 bg-fd-primary/[0.07] px-2.5 py-1 text-[0.65rem] font-semibold text-fd-primary">Server required</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <WorkflowNode title="CLI" description="Send authenticated control requests." icon={TerminalSquare} />
            <WorkflowArrow />
            <WorkflowNode title="tapstate server" description="Apply, test, discover, run, and observe." icon={Server} accent />
          </div>
        </section>
      </div>
    </figure>
  );
}

/** Shows the local stdio gateway between an MCP host and a tapstate server. */
export function McpConnectionFlow() {
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-fd-border bg-fd-card shadow-sm shadow-black/[0.03] dark:shadow-none">
      <figcaption className="border-b border-fd-border px-5 py-4">
        <p className="m-0 text-sm font-semibold text-fd-foreground">MCP connection path</p>
        <p className="mb-0 mt-1 text-xs leading-5 text-fd-muted-foreground">The host starts a local gateway; the server authenticates every control-plane request.</p>
      </figcaption>
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <WorkflowNode title="MCP host" description="Codex, Claude Code, or another MCP client." icon={Bot} />
          <WorkflowArrow label="stdio" />
          <WorkflowNode title="tapstate mcp" description="Local gateway from the complete CLI bundle." icon={TerminalSquare} accent />
          <WorkflowArrow label="HTTP(S)" />
          <WorkflowNode title="tapstate server" description="Checks the token, exposes tools, and performs operations." icon={Server} />
        </div>
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-fd-border bg-fd-muted/25 px-4 py-3">
          <KeyRound aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-fd-primary" />
          <p className="m-0 text-xs leading-5 text-fd-muted-foreground">The MCP host receives a scoped machine token through <code className="text-[0.7rem]">TAPSTATE_TOKEN</code>. It never needs the tapstate administrator password.</p>
        </div>
      </div>
    </figure>
  );
}

type ConnectorProfileProps = {
  category: string;
  maturity: string;
  maturityLabel: string;
  worksAs?: string;
  capabilities?: string;
  compatibility: string;
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
          <span className="inline-flex rounded-md border border-fd-border bg-fd-muted/55 px-2 py-0.5 text-xs font-medium leading-5 text-fd-foreground">
            {category}
          </span>
        </ConnectorProfileRow>
        <ConnectorProfileRow label="Guide maturity">
          <span className="flex flex-wrap items-center gap-2.5">
            <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold leading-5 ${maturityTone.badge}`}>
              <BadgeCheck aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
              {maturity}
            </span>
            <span className={maturityTone.label}>{maturityLabel}</span>
          </span>
        </ConnectorProfileRow>
        {worksAs ? (
          <ConnectorProfileRow label="Role in this guide">
            <ConnectorProfileTags value={worksAs} />
          </ConnectorProfileRow>
        ) : null}
        {capabilities ? (
          <ConnectorProfileRow label="Capabilities">
            <ConnectorProfileTags value={capabilities} />
          </ConnectorProfileRow>
        ) : null}
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
            The resource shape, references, and applicable catalog rules were accepted. Runtime availability was not checked.
          </p>
        </section>
        <section className="bg-fd-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-300">
            <CircleAlert aria-hidden="true" className="size-4" strokeWidth={2.25} />
            Changes required
          </div>
          <code className="block whitespace-pre-wrap rounded-md bg-rose-50 px-2.5 py-2 text-xs leading-5 text-rose-950 dark:bg-rose-950/35 dark:text-rose-100">
            {`invalid: orders_source.tap.yml:12:1  dsl.unknown-field
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

const connectorDirectoryTermHelp: Record<string, string> = {
  source: 'Reads data from the listed system.',
  target: 'Writes pipeline data to the listed system.',
  snapshot: 'Reads the selected data once.',
  cdc: 'Reads an initial snapshot, then captures later committed changes.',
  stream: 'Continuously reads or writes a message stream.',
  api: 'Reads records through the system API.',
  file: 'Reads a file-based source.',
};

const connectorDirectoryTermLabels: Record<string, string> = {
  cdc: 'CDC',
  api: 'API',
};

function ConnectorDirectoryTerm({
  label,
  help,
  displayLabel = label,
}: {
  label: string;
  help: string;
  displayLabel?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`${label}: ${help}`}
        closeDelay={100}
        delay={120}
        openOnHover
        className="group inline-flex items-center gap-1 rounded-md px-1 py-0.5 font-medium text-fd-foreground transition-colors hover:bg-fd-accent hover:text-fd-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
      >
        <span>{displayLabel}</span>
        <Info aria-hidden="true" className="size-3.5 text-fd-muted-foreground transition-colors group-hover:text-fd-primary" strokeWidth={2.25} />
      </PopoverTrigger>
      <PopoverContent role="tooltip" sideOffset={8} className="w-64 border-fd-border bg-fd-popover p-3 shadow-xl">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-fd-muted-foreground">{label}</p>
        <p className="mb-0 mt-1.5 text-sm leading-5 text-fd-popover-foreground">{help}</p>
      </PopoverContent>
    </Popover>
  );
}

function ConnectorDirectoryTerms({
  terms,
  separator,
  emptyHelp,
}: {
  terms: string[];
  separator: string;
  emptyHelp: string;
}) {
  if (terms.length === 0) {
    return (
      <ConnectorDirectoryTerm displayLabel="—" label="Not reported" help={emptyHelp} />
    );
  }

  return (
    <span className="inline-flex flex-wrap gap-x-1">
      {terms.map((term, index) => {
        const key = term.toLowerCase();
        const label = connectorDirectoryTermLabels[key] ?? key[0].toUpperCase() + key.slice(1);
        const help = connectorDirectoryTermHelp[key] ?? `Uses the ${label} mode.`;

        return (
          <span key={term} className="inline-flex items-center">
            {index > 0 ? <span aria-hidden="true" className="mr-1">{separator}</span> : null}
            <ConnectorDirectoryTerm label={label} help={help} />
          </span>
        );
      })}
    </span>
  );
}

/** A compact connector maturity index. The canonical data lives in connector-directory.ts. */
export function ConnectorDirectoryMatrix() {
  const currentConnectors = getConnectorsByDocumentationStatus('current');
  const maturityCounts = connectorMaturityCounts(currentConnectors);
  const sections = [
    {
      status: 'current' as const,
      title: 'Current connector path',
      description: 'Connector roles published for the current MySQL- and PostgreSQL-to-MongoDB operational-state path.',
      icon: CircleCheck,
      iconClassName: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-300',
    },
  ];

  return (
    <section aria-label="Connector guide directory" className="not-prose my-8">
      <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-fd-muted-foreground">
        <span className="font-medium text-fd-foreground">{maturityCounts.ga + maturityCounts.preview + maturityCounts.deprecated} current connectors</span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5"><DirectoryMaturity maturity="ga" /> {maturityCounts.ga}</span>
        {maturityCounts.preview > 0 ? (
          <span className="inline-flex items-center gap-1.5"><DirectoryMaturity maturity="preview" /> {maturityCounts.preview}</span>
        ) : null}
        {maturityCounts.deprecated > 0 ? (
          <span className="inline-flex items-center gap-1.5"><DirectoryMaturity maturity="deprecated" /> {maturityCounts.deprecated}</span>
        ) : null}
      </div>

      <div className="space-y-9">
        {sections.map((section) => {
          const Icon = section.icon;
          const connectors = getConnectorsByDocumentationStatus(section.status);

          return (
            <section key={section.status} aria-labelledby={`connector-status-${section.status}`} className="border-t border-fd-border pt-5">
              <header className="mb-3 flex items-start gap-3">
                <span className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${section.iconClassName}`}>
                  <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
                </span>
                <div>
                  <h2 id={`connector-status-${section.status}`} className="m-0 text-base font-semibold tracking-tight text-fd-foreground">
                    {section.title}
                  </h2>
                  <p className="mb-0 mt-1 text-sm leading-6 text-fd-muted-foreground">{section.description}</p>
                </div>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
                  <thead className="border-b border-fd-border text-xs font-medium uppercase tracking-[0.08em] text-fd-muted-foreground">
                    <tr>
                      <th className="px-0 py-2.5 font-medium">Connector</th>
                      <th className="px-3 py-2.5 font-medium">Guide maturity</th>
                      <th className="px-3 py-2.5 font-medium">{section.status === 'current' ? 'Published role' : 'Planned role'}</th>
                      <th className="px-3 py-2.5 font-medium">{section.status === 'current' ? 'Read mode' : 'Planned read mode'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fd-border/80">
                    {connectors.map((connector) => {
                      const profile = getConnectorProductProfile(connector.slug);
                      return (
                        <tr key={connector.slug} className="transition-colors hover:bg-fd-accent/40">
                          <th className="px-0 py-2.5 font-medium text-fd-foreground">
                            <Link href={`/docs/connectors/${connector.slug}`} className="group inline-flex items-center gap-1.5 text-fd-primary underline decoration-fd-primary/25 underline-offset-4 transition-colors hover:decoration-fd-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">
                              <span>{profile?.displayTitle ?? connector.title}</span>
                              <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                            </Link>
                          </th>
                          <td className="px-3 py-2.5"><DirectoryMaturity maturity={connector.maturity} /></td>
                          <td className="px-3 py-2.5 text-fd-muted-foreground">
                            <ConnectorDirectoryTerms
                              terms={profile?.useAs ?? []}
                              separator="+"
                              emptyHelp="No role is published for this connector."
                            />
                          </td>
                          <td className="px-3 py-2.5 text-fd-muted-foreground">
                            <ConnectorDirectoryTerms
                              terms={profile?.modes ?? []}
                              separator="·"
                              emptyHelp="Read modes do not apply to this published target role."
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}

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
    PreviewArchitecture,
    TapStateArchitecture,
    DataPathComparison,
    QuickstartDataFlow,
    CliServerWorkflow,
    McpConnectionFlow,
    ConnectorProfile,
    ValidationStatusGuide,
    ConnectorDirectoryMatrix,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
