import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * tapstate "Live Slice" mark + two-tone wordmark.
 * Dim bars use --ts-logo-dim (theme-aware, defined in global.css);
 * "state" uses --color-fd-primary so it is mint on dark and accent-ink on light.
 */
const logo = (
  <>
    <svg
      viewBox="0 0 64 64"
      width="22"
      height="22"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="8" y="13" width="34" height="9" rx="4.5" fill="var(--ts-logo-dim)" />
      <rect x="22" y="27.5" width="34" height="9" rx="4.5" fill="#2DD4BF" />
      <rect x="8" y="42" width="34" height="9" rx="4.5" fill="var(--ts-logo-dim)" />
    </svg>
    <span style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
      tap<span style={{ color: 'var(--color-fd-primary)' }}>state</span>
    </span>
  </>
);

const docsLogo = (
  <>
    {logo}
    <span aria-hidden="true" className="mx-1 h-4 w-px bg-fd-border" />
    <span className="text-sm font-medium text-fd-muted-foreground">Docs</span>
  </>
);

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: logo,
      url: '/',
    },
    links: [
      {
        text: 'Docs',
        url: '/docs',
        active: 'url',
      },
      {
        text: 'Quickstart',
        url: '/docs/overview/quickstart',
        active: 'url',
      },
      {
        text: 'Connectors',
        url: '/docs/connectors',
        active: 'nested-url',
      },
      {
        text: 'Reference',
        url: '/docs/reference/dsl-grammar',
        active: 'nested-url',
      },
    ],
  };
}

export function docsOptions(): BaseLayoutProps {
  return {
    ...baseOptions(),
    nav: {
      title: docsLogo,
      url: '/',
    },
    links: [],
  };
}
