// Checks that release docs use the supported installer/playground entry points and
// keep versioned release assets aligned with the product release.
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const cliReleaseVersion = '0.4.3';
const cliReleaseTag = `v${cliReleaseVersion}`;
const minorReleaseSeries = 'v0.4';
const productDir = process.env.TAPSTATE_PRODUCT_DIR;
const installPath = new URL('../content/docs/overview/install.mdx', import.meta.url);
const quickstartPath = new URL('../content/docs/overview/quickstart.mdx', import.meta.url);
const releasePath = new URL('../content/docs/releases/v0.4.mdx', import.meta.url);
const releasesMetaPath = new URL('../content/docs/releases/meta.json', import.meta.url);

const install = await readFile(installPath, 'utf8');
const quickstart = await readFile(quickstartPath, 'utf8');
const release = await readFile(releasePath, 'utf8');
const releasesMeta = JSON.parse(await readFile(releasesMetaPath, 'utf8'));
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
    `https://github.com/tapstate/tapstate/releases/download/${cliReleaseTag}/tapstate-${cliReleaseVersion}-darwin-arm64.tar.gz`,
  ],
  [
    'release page',
    release,
    'https://github.com/tapstate/tapstate/releases',
  ],
  [
    'current release assets',
    release,
    `https://github.com/tapstate/tapstate/releases/tag/${cliReleaseTag}`,
  ],
  ['Quickstart MySQL source', quickstart, 'MySQL'],
  ['Quickstart PostgreSQL source', quickstart, 'PostgreSQL'],
  ['Quickstart managed view', quickstart, 'views.order_state'],
];

for (const [label, source, expected] of expectedDocs) {
  if (!source.includes(expected)) failures.push(`${label} is not pinned to ${expected}`);
}

if (!releasesMeta.pages || releasesMeta.pages[0] !== 'v0.4') {
  failures.push('Release metadata does not list v0.4 as the current release page');
}

if (quickstart.includes('v0.4.1') || quickstart.includes("The stack's server image remains pinned to v0.3.0")) {
  failures.push('Quickstart documentation still contains the obsolete v0.4.1 + v0.3.0 version mismatch description');
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

  if (!script.includes('/download/connectors-preview')) {
    failures.push('product Quickstart no longer uses the documented connector preview asset path');
  }

  const composeServerMatch = compose.match(/image:\s+ghcr\.io\/tapstate\/tapstate:(\S+)/);
  const scriptCliMatch = script.match(/CLI_VERSION="([^"]+)"/);

  if (!composeServerMatch) {
    failures.push('product Quickstart server image tag could not be found');
  }
  if (!scriptCliMatch) {
    failures.push('product direct Quickstart script CLI pin could not be found');
  }
  if (
    !script.includes('image: ghcr.io/tapstate/tapstate:${CLI_VERSION}') &&
    composeServerMatch &&
    scriptCliMatch &&
    composeServerMatch[1] !== scriptCliMatch[1]
  ) {
    failures.push(`product Quickstart CLI pin (${scriptCliMatch[1]}) does not match server image (${composeServerMatch[1]})`);
  }
}

if (failures.length > 0) {
  console.error('Release contract check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (process.env.TAPSTATE_VERIFY_REMOTE_LINKS === '1') {
  const remoteScripts = [
    ['https://install.tapstate.dev/cli', 'PINNED_VERSION'],
    ['https://install.tapstate.dev', 'CLI_VERSION'],
  ];

  for (const [url, variable] of remoteScripts) {
    let response;
    try {
      response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      console.error(`Remote installer check failed for ${url}: ${error.message}`);
      process.exit(1);
    }
    if (!response.ok) {
      console.error(`Remote installer check failed for ${url}: HTTP ${response.status}`);
      process.exit(1);
    }

    const script = await response.text();
    const match = script.match(new RegExp(`^${variable}="([^"]+)"`, 'm'));
    if (!match) {
      console.error(`Remote installer check failed for ${url}: ${variable} is missing`);
      process.exit(1);
    }
    if (match[1] !== cliReleaseVersion) {
      console.error(
        `Remote installer check failed for ${url}: ${variable} is ${match[1]}, expected ${cliReleaseVersion}`,
      );
      process.exit(1);
    }
  }

  const urls = [
    `https://github.com/tapstate/tapstate/releases/tag/${cliReleaseTag}`,
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
  `Release contract passed for CLI ${cliReleaseTag} and minor series ${minorReleaseSeries}${productDir ? ' with product Quickstart cross-check' : ''}.`,
);
