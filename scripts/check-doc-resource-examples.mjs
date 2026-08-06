// Validates YAML resource examples and runs workspace validation against the product CLI.
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const classpath = process.env.TAPSTATE_CLI_CLASSPATH;
if (!classpath) {
  console.error('Set TAPSTATE_CLI_CLASSPATH to the product CLI jar and dependency directory.');
  process.exit(2);
}

const java = process.env.TAPSTATE_JAVA ?? 'java';
const docsDir = new URL('../content/docs/', import.meta.url);
const helper = new URL('./ValidateDslExample.java', import.meta.url);
const files = (await readdir(docsDir, { recursive: true }))
  .filter((name) => /\.(?:md|mdx)$/.test(name))
  .sort();

const failures = [];
let checked = 0;
let workspaceChecked = 0;
const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'tapstate-doc-examples-'));

for (const name of files) {
  const file = new URL(name, docsDir);
  const markdown = await readFile(file, 'utf8');
  const fence = /```ya?ml([^\n]*)\n([\s\S]*?)```/g;
  const workspaceResources = [];

  for (const match of markdown.matchAll(fence)) {
    const meta = match[1];
    const yaml = match[2];
    if (!/^version:\s*tapstate\/v1\s*$/m.test(yaml)) continue;

    checked += 1;
    const line = markdown.slice(0, match.index).split('\n').length + 1;
    if (!/^kind:\s*(source|pipeline|transform|view|serve)\s*$/m.test(yaml)) {
      failures.push(`${name}:${line}: missing a valid resource kind`);
      continue;
    }

    const result = spawnSync(java, ['-cp', classpath, helper.pathname], {
      encoding: 'utf8',
      input: yaml,
      maxBuffer: 1024 * 1024,
    });
    if (result.error) {
      failures.push(`${name}:${line}: could not launch parser: ${result.error.message}`);
      continue;
    }
    if (result.status !== 0) {
      const diagnostic = (result.stderr || result.stdout).trim().split('\n').slice(0, 4).join(' ');
      failures.push(`${name}:${line}: ${diagnostic || `parser exited ${result.status}`}`);
    }

    if (!/\bstructure-only\b/.test(meta)) {
      workspaceResources.push({ yaml, line });
    }
  }

  if (workspaceResources.length > 0) {
    const workspace = path.join(tempRoot, String(workspaceChecked));
    await mkdir(workspace);
    await Promise.all(workspaceResources.map(({ yaml }, index) => (
      writeFile(path.join(workspace, `example-${index + 1}.tap.yml`), yaml)
    )));
    const result = spawnSync(java, ['-cp', classpath, 'io.tapstate.cli.Cli', 'validate', workspace], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    });
    workspaceChecked += 1;
    if (result.error) {
      failures.push(`${name}: could not launch workspace validator: ${result.error.message}`);
    } else if (result.status !== 0) {
      const diagnostic = (result.stderr || result.stdout).trim().split('\n').slice(0, 4).join(' ');
      failures.push(`${name}:${workspaceResources[0].line}: workspace validation failed: ${diagnostic || `validator exited ${result.status}`}`);
    }
  }
}

await rm(tempRoot, { recursive: true, force: true });

if (checked === 0) {
  console.error('No tapstate/v1 YAML resource examples found.');
  process.exit(1);
}

if (failures.length > 0) {
  console.error(`Documentation resource example check failed (${failures.length} of ${checked}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Documentation resource examples passed: ${checked} parser-validated blocks and ${workspaceChecked} cross-resource workspaces across ${files.length} Markdown files.`);
