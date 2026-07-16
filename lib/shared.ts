export const appName = 'tapstate';

function configuredSiteUrl() {
  const value = process.env.TAPSTATE_SITE_URL?.trim();
  if (!value) return 'https://tapstate.dev';

  try {
    return new URL(value).origin;
  } catch {
    throw new Error('TAPSTATE_SITE_URL must be an absolute URL, for example https://preview.docs.example.com.');
  }
}

/**
 * Build-time public origin. Set it to the deployed preview URL so canonical
 * links, sitemaps, structured data, and LLM links never point at production.
 */
export const docsBaseUrl = configuredSiteUrl();

/**
 * Indexing is opt-in. Preview builds remain private to search engines unless
 * the production deployment explicitly sets TAPSTATE_SITE_INDEXABLE=true.
 */
export const isSiteIndexable = process.env.TAPSTATE_SITE_INDEXABLE === 'true';

export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';
