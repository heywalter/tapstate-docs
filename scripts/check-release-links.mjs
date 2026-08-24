// Checks that release docs use the supported installer/playground entry points and
// keep versioned release assets aligned with the product release.
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const releaseVersion = '0.2.0';
const releaseTag = `v${releaseVersion}`;
const productDir = process.env.TAPSTATE_PRODUCT_DIR;
const installPath = new URL('../content/docs/overview/install.mdx', import.meta.url);
const quickstartPath = new URL('../content/docs/overview/quickstart-online.mdx', import.meta.url);
const releasePath = new URL('../content/docs/releases/v0.2.0.mdx', import.meta.url);
const install = await readFile(installPath, 'utf8');
const quickstart = await readFile(quickstartPath, 'utf8');
const release = await readFile(releasePath, 'utf8');
const currentReleaseDocs = `${install}\n${quickstart}\n${release}`;
const failures = [];

const expectedDocs = [
  [
    'CLI installer endpoint',
    install,
    'https://install.tapstate.dev/cli',
  ],
  [
    'Playground endpoint',
    quickstart,
    'https://install.tapstate.dev',
  ],
  [
    'release archive',
    install,
    `https://github.com/tapstate/tapstate/releases/download/${releaseTag}/tapstate-${releaseVersion}-darwin-arm64.tar.gz`,
  ],
  [
    'release page',
    release,
    `https://github.com/tapstate/tapstate/releases/tag/${releaseTag}`,
  ],
  [
    'Quickstart connector preview assets',
    quickstart,
    'https://github.com/tapstate/tapstate/releases/tag/connectors-preview',
  ],
  [
    'release connector preview assets',
    release,
    'https://github.com/tapstate/tapstate/releases/tag/connectors-preview',
  ],
  [
    'Quickstart pinned server image',
    quickstart,
    `ghcr.io/tapstate/tapstate:${releaseVersion}`,
  ],
  [
    'release pinned server image',
    release,
    `ghcr.io/tapstate/tapstate:${releaseVersion}`,
  ],
];

for (const [label, source, expected] of expectedDocs) {
  if (!source.includes(expected)) failures.push(`${label} is not pinned to ${expected}`);
}

if (/raw\.githubusercontent\.com\/tapstate\/tapstate\/main\//.test(currentReleaseDocs)) {
  failures.push('current release documentation contains a moving raw main URL');
}
if (/github\.com\/tapstate\/tapstate\/releases\/latest/.test(currentReleaseDocs)) {
  failures.push('current release documentation contains a floating latest-release URL');
}

if (productDir) {
  const compose = await readFile(
    path.join(productDir, 'deploy/quickstart/docker-compose.yml'),
    'utf8',
  );
  const script = await readFile(
    path.join(productDir, 'deploy/quickstart/quickstart.sh'),
    'utf8',
  );

  if (!compose.includes(`image: ghcr.io/tapstate/tapstate:${releaseVersion}`)) {
    failures.push(`product Quickstart is not pinned to ghcr.io/tapstate/tapstate:${releaseVersion}`);
  }
  if (!script.includes('/download/connectors-preview')) {
    failures.push('product Quickstart no longer uses the documented connector preview asset path');
  }
  if (!script.includes(`CLI_VERSION="${releaseVersion}"`)) {
    failures.push(`product Quickstart CLI pin is not ${releaseVersion}`);
  }
}

if (failures.length > 0) {
  console.error('Release contract check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (process.env.TAPSTATE_VERIFY_REMOTE_LINKS === '1') {
  const urls = [
    'https://install.tapstate.dev/cli',
    'https://install.tapstate.dev',
    `https://github.com/tapstate/tapstate/releases/tag/${releaseTag}`,
    'https://github.com/tapstate/tapstate/releases/tag/connectors-preview',
  ];

  for (const url of urls) {
    let response;
    try {
      response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      console.error(`Remote release link check failed for ${url}: ${error.message}`);
      process.exit(1);
    }
    if (!response.ok) {
      console.error(`Remote release link check failed for ${url}: HTTP ${response.status}`);
      process.exit(1);
    }
  }
}

console.log(
  `Release contract passed for ${releaseTag}${productDir ? ' with product Quickstart cross-check' : ''}.`,
);
