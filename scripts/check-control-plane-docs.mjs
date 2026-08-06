// Cross-checks the REST API reference doc against product controller classes.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const productDir = process.env.TAPSTATE_PRODUCT_DIR;

if (!productDir) {
  console.error('Set TAPSTATE_PRODUCT_DIR to the tapstate product checkout before running this check.');
  process.exit(2);
}

const controllerDir = path.join(
  productDir,
  'control/rest-api/src/main/java/io/tapstate/control/restapi',
);
const referencePath = new URL('../content/docs/reference/rest-api.mdx', import.meta.url);
const javaFiles = (await readdir(controllerDir)).filter((name) => name.endsWith('.java'));
const implementation = new Set();
const websocketPaths = new Set();

for (const name of javaFiles) {
  const source = await readFile(path.join(controllerDir, name), 'utf8');
  const prefix = /^@RestController\s*$/m.test(source) ? '/api' : '';

  for (const match of source.matchAll(
    /@(Get|Post|Put|Delete|Patch)Mapping\(\s*"([^"]+)"/g,
  )) {
    implementation.add(`${match[1].toUpperCase()} ${prefix}${match[2]}`);
  }

  if (name === 'PipelineStreamConfiguration.java') {
    for (const match of source.matchAll(/"(\/api\/pipelines\/\*\/(?:status\/watch|logs\/follow))"/g)) {
      websocketPaths.add(match[1].replace('*', '{id}'));
    }
  }
}

const reference = await readFile(referencePath, 'utf8');
const documented = new Set();

for (const line of reference.split('\n')) {
  const match = line.match(
    /^\|\s*`(GET|POST|PUT|DELETE|PATCH)`\s*\|\s*`(\/[^`]+)`\s*\|/,
  );
  if (match) documented.add(`${match[1]} ${match[2]}`);
}

const failures = [];
const missingHttp = [...implementation].filter((endpoint) => !documented.has(endpoint));
const staleHttp = [...documented].filter((endpoint) => !implementation.has(endpoint));

if (missingHttp.length > 0) {
  failures.push(`HTTP endpoints missing from REST reference: ${missingHttp.sort().join(', ')}`);
}
if (staleHttp.length > 0) {
  failures.push(`REST reference endpoints absent from product controllers: ${staleHttp.sort().join(', ')}`);
}

const documentedWebsockets = new Set(
  [...reference.matchAll(/`(\/api\/pipelines\/\{id\}\/(?:status\/watch|logs\/follow))`/g)]
    .map((match) => match[1]),
);
const missingWebsockets = [...websocketPaths]
  .filter((endpoint) => !documentedWebsockets.has(endpoint));
const staleWebsockets = [...documentedWebsockets]
  .filter((endpoint) => !websocketPaths.has(endpoint));

if (missingWebsockets.length > 0) {
  failures.push(`WebSocket endpoints missing from REST reference: ${missingWebsockets.sort().join(', ')}`);
}
if (staleWebsockets.length > 0) {
  failures.push(`REST reference WebSockets absent from product configuration: ${staleWebsockets.sort().join(', ')}`);
}

if (failures.length > 0) {
  console.error('Control-plane documentation check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Control-plane documentation passed: ${implementation.size} HTTP and ${websocketPaths.size} WebSocket endpoints documented.`,
);
