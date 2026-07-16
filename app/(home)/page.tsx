import type { Metadata } from 'next';
import Link from 'next/link';
import { FullSearchTrigger } from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import {
  ArrowRight,
  Bot,
  Braces,
  Cable,
  CircleHelp,
  Database,
  FileText,
  Layers3,
  RadioTower,
  Rocket,
  TerminalSquare,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tapstate documentation',
  description:
    'Learn how tapstate captures database changes, transforms data in flight, and serves live operational state.',
};

const tasks = [
  {
    eyebrow: 'New here',
    title: 'Understand the model',
    description: 'Learn how Capture, Transform, and Serve work together in one deployable data path.',
    href: '/docs/overview/what-is-tapstate',
    linkLabel: 'Read the overview',
    icon: Layers3,
  },
  {
    eyebrow: 'Preparing a system',
    title: 'Configure a connector',
    description: 'Find the permissions, network access, capture modes, and limitations for your system.',
    href: '/docs/connectors',
    linkLabel: 'Browse connectors',
    icon: Cable,
  },
  {
    eyebrow: 'Ready to build',
    title: 'Create your first data path',
    description: 'Define connections and a pipeline as reviewable resources, then validate the workspace.',
    href: '/docs/overview/quickstart',
    linkLabel: 'Start the quickstart',
    icon: Rocket,
  },
];

const connectorGroups = [
  { label: 'Databases', description: 'Relational and document stores', icon: Database },
  { label: 'Streams', description: 'Event and message systems', icon: RadioTower },
  { label: 'APIs', description: 'SaaS and HTTP services', icon: Braces },
  { label: 'Files', description: 'Structured file formats', icon: FileText },
];

const popularConnectors = [
  { label: 'MySQL', href: '/docs/connectors/mysql' },
  { label: 'PostgreSQL', href: '/docs/connectors/postgresql' },
  { label: 'MongoDB', href: '/docs/connectors/mongodb' },
  { label: 'Oracle', href: '/docs/connectors/oracle' },
  { label: 'Kafka', href: '/docs/connectors/kafka' },
];

const secondaryLinks = [
  {
    title: 'Resource reference',
    description: 'Fields, syntax, and complete examples for tapstate resources.',
    href: '/docs/reference/dsl-grammar',
    icon: TerminalSquare,
  },
  {
    title: 'Troubleshooting',
    description: 'Resolve validation, configuration, and connectivity problems.',
    href: '/docs/guides/troubleshooting',
    icon: CircleHelp,
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
  return (
    <main className="min-h-screen bg-fd-background text-fd-foreground">
      <section className="border-b border-fd-border bg-fd-background">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 md:px-8 md:pb-20 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-fd-primary">
              Documentation
            </p>
            <h1 className="mt-5 text-balance text-[2.65rem] font-semibold leading-[1.06] tracking-[-0.045em] sm:text-5xl md:text-[3.6rem]">
              Capture, transform, and serve operational data.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-fd-muted-foreground md:text-lg md:leading-8">
              Tapstate is an open-source unified operational data engine. It builds and maintains live operational state from production databases for applications, APIs, automation, and AI agents.
            </p>

            <div className="mx-auto mt-8 max-w-2xl">
              <FullSearchTrigger
                aria-label="Search tapstate documentation"
                className="h-14 w-full cursor-pointer rounded-xl border-fd-border bg-fd-card px-4 text-left text-base text-fd-muted-foreground shadow-sm transition-[border-color,box-shadow,background-color] duration-200 hover:border-fd-primary/35 hover:bg-fd-card hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 [&_kbd]:bg-fd-muted [&_kbd]:px-2 [&_svg]:size-5 [&_svg]:text-fd-primary"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
              <span className="text-fd-muted-foreground">Popular:</span>
              {popularConnectors.map((connector) => (
                <Link
                  key={connector.href}
                  href={connector.href}
                  className="cursor-pointer font-medium text-fd-foreground no-underline underline-offset-4 transition-colors duration-200 hover:text-fd-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                >
                  {connector.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
            {tasks.map((task) => {
              const Icon = task.icon;
              return (
                <Link
                  key={task.href}
                  href={task.href}
                  className="group flex min-h-60 cursor-pointer flex-col rounded-2xl border border-fd-border bg-fd-card p-6 text-fd-foreground no-underline shadow-sm outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-fd-primary/30 hover:bg-fd-card hover:shadow-lg hover:shadow-black/[0.05] focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 dark:hover:shadow-black/20"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl border border-fd-primary/15 bg-fd-primary/[0.07] text-fd-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-fd-muted-foreground">
                    {task.eyebrow}
                  </span>
                  <span className="mt-2 block text-xl font-semibold tracking-[-0.025em]">{task.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-fd-muted-foreground">{task.description}</span>
                  <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold text-fd-primary transition-colors group-hover:text-fd-foreground">
                    {task.linkLabel}
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.15em] text-fd-primary">Connector guides</p>
            <h2 className="mb-0 mt-3 text-3xl font-semibold tracking-[-0.035em]">Prepare the system you already use.</h2>
            <p className="mb-0 mt-3 max-w-2xl text-base leading-7 text-fd-muted-foreground">
              Each guide brings permissions, capture preparation, supported operations, limitations, and connection fields into one place.
            </p>
          </div>
          <ArrowLink href="/docs/connectors">View all connectors</ArrowLink>
        </div>

        <div className="mt-8 grid overflow-hidden rounded-2xl border border-fd-border bg-fd-card sm:grid-cols-2 lg:grid-cols-4">
          {connectorGroups.map((group, index) => {
            const Icon = group.icon;
            return (
              <Link
                key={group.label}
                href="/docs/connectors"
                className={`group cursor-pointer p-5 text-fd-foreground no-underline outline-none transition-colors duration-200 hover:bg-fd-muted/55 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-ring ${
                  index > 0 ? 'border-t border-fd-border sm:border-t-0 sm:border-l' : ''
                } ${index === 2 ? 'sm:border-l-0 sm:border-t lg:border-l lg:border-t-0' : ''}`}
              >
                <Icon className="size-5 text-fd-primary" aria-hidden="true" />
                <span className="mt-5 flex items-center justify-between gap-3 text-base font-semibold">
                  {group.label}
                  <ArrowRight className="size-4 text-fd-muted-foreground transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-fd-primary" aria-hidden="true" />
                </span>
                <span className="mt-1 block text-sm leading-6 text-fd-muted-foreground">{group.description}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-fd-border bg-fd-muted/25">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] lg:items-center lg:gap-16 lg:py-16">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.15em] text-fd-primary">Continue building</p>
            <h2 className="mb-0 mt-3 text-3xl font-semibold tracking-[-0.035em]">From a valid connection to a reviewable workspace.</h2>
            <p className="mb-0 mt-3 max-w-2xl text-base leading-7 text-fd-muted-foreground">
              Use the reference when you need exact resource syntax, and troubleshooting when a prepared system still does not validate as expected.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {secondaryLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group cursor-pointer rounded-xl border border-fd-border bg-fd-background p-4 text-fd-foreground no-underline outline-none transition-[border-color,background-color] duration-200 hover:border-fd-primary/30 hover:bg-fd-card focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="size-5 text-fd-primary" aria-hidden="true" />
                      <span className="font-semibold">{item.title}</span>
                      <ArrowRight className="ml-auto size-4 text-fd-muted-foreground transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-fd-primary" aria-hidden="true" />
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-fd-muted-foreground">{item.description}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-fd-border bg-fd-background p-6 shadow-sm">
            <span className="flex size-10 items-center justify-center rounded-xl border border-fd-primary/15 bg-fd-primary/[0.07] text-fd-primary">
              <Bot className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mb-0 mt-5 text-xl font-semibold tracking-[-0.025em]">Documentation for people and agents</h2>
            <p className="mb-0 mt-2 text-sm leading-6 text-fd-muted-foreground">
              The same canonical pages are available through the site, llms.txt, and page-level Markdown.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
              <ArrowLink href="/docs/for-ai/llms">AI-ready docs</ArrowLink>
              <ArrowLink href="/llms.txt">Open llms.txt</ArrowLink>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-fd-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <p className="m-0">tapstate documentation</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/docs" className="cursor-pointer text-fd-muted-foreground no-underline transition-colors hover:text-fd-foreground">All docs</Link>
          <Link href="/docs/connectors" className="cursor-pointer text-fd-muted-foreground no-underline transition-colors hover:text-fd-foreground">Connectors</Link>
          <Link href="/docs/reference/dsl-grammar" className="cursor-pointer text-fd-muted-foreground no-underline transition-colors hover:text-fd-foreground">Reference</Link>
        </div>
      </footer>
    </main>
  );
}
