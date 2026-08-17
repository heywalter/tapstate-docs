// Generates the DSL fields reference doc from the product JSON schema.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const schemaPath = process.env.TAPSTATE_SCHEMA_PATH;
if (!schemaPath) {
  console.error('Set TAPSTATE_SCHEMA_PATH to tapstate-v1.schema.json.');
  process.exit(2);
}

const outputPath = new URL('../content/docs/reference/dsl-fields.md', import.meta.url);
const schema = JSON.parse(await readFile(path.resolve(schemaPath), 'utf8'));
const defs = schema.$defs ?? {};

const sections = [
  {
    title: 'Top-level resources',
    definitions: ['SourceResource', 'PipelineResource', 'TransformResource', 'ViewResource', 'ServeResource'],
  },
  {
    title: 'Source and shared fields',
    definitions: ['Metadata', 'TableRef.Spec', 'Srs'],
  },
  {
    title: 'Pipeline wiring and settings',
    definitions: ['Settings', 'Step.Inline', 'Step.Use', 'ViewBlock.Inline', 'ViewBlock.Use', 'ServeBlock.Inline', 'ServeBlock.Use'],
  },
  {
    title: 'Transform bodies',
    definitions: [
      'TransformBody.Filter',
      'TransformBody.MapProjection',
      'TransformBody.Js',
      'TransformBody.Union',
      'TransformBody.Nest',
      'NestRoot',
      'Embed',
      'TransformBody.Join',
    ],
  },
  {
    title: 'View and serve fields',
    definitions: [
      'Storage',
      'Storage.Hot',
      'Storage.Warm',
      'Storage.Cold',
      'ViewSchema',
      'SyncElement',
      'QueryElement',
      'PushElement',
    ],
  },
];

function refName(ref) {
  return ref?.replace('#/$defs/', '');
}

function resolve(node) {
  if (!node?.$ref) return node;
  return defs[refName(node.$ref)] ?? node;
}

function enumValues(node) {
  const resolved = resolve(node);
  if (resolved.const !== undefined) return [resolved.const];
  if (Array.isArray(resolved.enum)) return resolved.enum;
  if (Array.isArray(resolved.oneOf) && resolved.oneOf.every((item) => item.const !== undefined)) {
    return resolved.oneOf.map((item) => item.const);
  }
  return [];
}

function typeOf(node) {
  if (node.$ref) return `\`${refName(node.$ref)}\``;
  if (node.const !== undefined) return 'constant';
  if (node.type === 'array') return `array<${typeOf(node.items ?? {})}>`;
  if (node.type) return node.type;
  if (Array.isArray(node.oneOf)) {
    return node.oneOf.map((item) => {
      if (item.$ref) return `\`${refName(item.$ref)}\``;
      return typeOf(item);
    }).join(' or ');
  }
  return 'value';
}

function cell(value) {
  if (value === undefined || value === null || value === '') return '—';
  return String(value).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
}

function renderDefinition(name) {
  const definition = defs[name];
  if (!definition) throw new Error(`Schema definition not found: ${name}`);

  const required = new Set(definition.required ?? []);
  const properties = definition.properties ?? {};
  const rows = Object.entries(properties).map(([field, spec]) => {
    const values = enumValues(spec);
    const resolved = resolve(spec);
    const defaultValue = spec.default ?? resolved.default;
    return `| \`${name}.${field}\` | ${cell(typeOf(spec))} | ${required.has(field) ? 'yes' : 'no'} | ${cell(defaultValue)} | ${cell(values.map((value) => `\`${value}\``).join(', '))} | ${cell(spec.description ?? resolved.description)} |`;
  });

  if (name === 'TransformResource') {
    rows.push('| `TransformResource.<body>` | one transform body | yes | — | `filter`, `map`, `js`, `union`, `nest`, `join` | Reusable transform logic selected by the `type` discriminator. |');
  }

  return rows.join('\n');
}

const body = sections.map((section) => `## ${section.title}

| Field | Type | Required | Default | Accepted values | Description |
|---|---|---|---|---|---|
${section.definitions.map(renderDefinition).join('\n')}`).join('\n\n');

const generated = `---
title: DSL fields reference
description: Schema-generated field lookup for the tapstate/v1 resource contract
sidebar:
  order: 2
ai:
  kind: reference
  id: dsl-fields
  aliases: [tapstate fields, tapstate schema, yaml field reference]
---

This lookup is generated from the product \`tapstate-v1.schema.json\`. Regenerate
it with the Schema from the same product revision whenever the contract changes.
Descriptions record declaration semantics, not runtime availability.

${body}

## Runtime boundary

Schema acceptance does not prove that a connector artifact is installed or that
the current runtime executes every declared transform, view, or serve surface.
See the [resource grammar](/docs/reference/dsl-grammar) for the current preview
execution boundary.
`;

if (process.argv.includes('--check')) {
  const current = await readFile(outputPath, 'utf8');
  if (current !== generated) {
    console.error('DSL fields reference is out of date. Run pnpm dsl:fields with TAPSTATE_SCHEMA_PATH set.');
    process.exit(1);
  }
  console.log(`DSL fields reference matches ${path.resolve(schemaPath)}.`);
} else {
  await writeFile(outputPath, generated);
  console.log(`Generated ${outputPath.pathname} from ${path.resolve(schemaPath)}.`);
}
