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
    definitions: ['Metadata', 'SourceRef.Spec', 'TableRef.Spec', 'Srs'],
  },
  {
    title: 'Pipeline wiring and settings',
    definitions: ['Settings', 'Step.Inline', 'Step.Use', 'ViewBlock.Inline', 'ViewBlock.Use', 'ServeBlock.Inline', 'ServeBlock.Use'],
  },
  {
    title: 'Node execution',
    definitions: ['ExecutionSpec', 'BatchSpec'],
  },
  {
    title: 'Transform bodies',
    definitions: [
      'TransformBody.Filter',
      'TransformBody.MapProjection',
      'TransformBody.Js',
      'TransformBody.Union',
      'TransformBody.Unwind',
      'TransformBody.Nest',
      'NestStateStorage',
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
      'SyncElement',
      'RenameSpec',
      'QueryElement',
      'PushElement',
    ],
  },
];

const descriptionOverrides = {
  'ViewResource.on_full_load': 'Treatment of existing view rows before a new full load. Continuation from retained state and CDC-only runs do not clear rows; an explicit full rebuild after cache loss applies this policy.',
  'ViewBlock.Inline.on_full_load': 'Treatment of existing view rows before a new full load. Continuation from retained state and CDC-only runs do not clear rows; an explicit full rebuild after cache loss applies this policy.',
  'SyncElement.on_full_load': 'Treatment of existing target rows before a new full load. Continuation from retained state and CDC-only runs do not clear rows; an explicit full rebuild after cache loss applies this policy.',
  'Settings.parallelism': 'Legacy field. Parses for compatibility but has no runtime effect; set execution.parallelism on each node.',
  'Settings.batch_size': 'Legacy field. Parses for compatibility but has no runtime effect; set execution.batch.max_records on each node.',
  'TableRef.Spec.pk': 'Primary-key override accepted by the grammar. The current runtime does not execute this field; an upsert still requires a primary key in the discovered source schema.',
  'Srs.key': 'Optional identifier that overrides automatic mining-chain derivation. Reuse a value only when compatible CDC sources must share one replay store.',
  'TransformBody.Nest.entries_in_memory': 'Maximum entries kept in memory at each nest level (deployment default 4,000; positive integer, minimum 271 for an explicit override, consistent across all nest steps in a pipeline). Additional entries use the configured backing layer. Omit to use the deployment default.',
  'TransformBody.Nest.max_elements_per_document': 'Maximum embedded elements allowed in one assembled document (deployment default 20,000). Exceeding the limit fails the pipeline. Omit to use the deployment default.',
  'NestRoot.trackKeyChanges': 'When true, moves the assembled document when its root key changes. Requires the source to provide a before image.',
  'Embed.trackKeyChanges': 'When true, moves an embedded subtree when its array key, parent key, or child-reference key changes. Requires the source to provide a before image.',
  'TransformBody.Nest.state': 'Durable state placement for self-hosted deployments; absent uses the deployment default. Rejected in Cloud with control.state-database-unavailable.',
  'NestStateStorage.database': 'MongoDB database holding this nest\'s state, shape record, and dead letters in self-hosted deployments. Rejected in Cloud.',
  'SyncElement.write_mode': 'How rows are written to the target. Upsert requires a primary key in each selected source table\'s discovered schema; append is for insert-only delivery.',
  'QueryElement.backend': 'Reserved: the sync id whose sink would serve this query as an API. Omit for parallel egress from the view store.',
};

const valueDefinitions = ['SourceRef', 'TableRef', 'FromClause', 'FromRef', 'FieldRule', 'PushFormat'];

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
    const description = descriptionOverrides[`${name}.${field}`]
      ?? spec.description
      ?? resolved.description;
    return `| \`${name}.${field}\` | ${cell(typeOf(spec))} | ${required.has(field) ? 'yes' : 'no'} | ${cell(defaultValue)} | ${cell(values.map((value) => `\`${value}\``).join(', '))} | ${cell(description)} |`;
  });

  if (name === 'TransformResource') {
    const bodyTypes = defs.TransformBody.oneOf.map((variant) => resolve(variant).properties.type.const);
    rows.push(`| \`TransformResource.<body>\` | one transform body | yes | — | ${bodyTypes.map((type) => `\`${type}\``).join(', ')} | Reusable transform logic selected by the \`type\` discriminator. |`);
  }

  return rows.join('\n');
}

function renderValueDefinition(name) {
  const definition = defs[name];
  if (!definition) throw new Error(`Schema definition not found: ${name}`);
  const description = descriptionOverrides[name] ?? definition.description;
  return `| \`${name}\` | ${cell(typeOf(definition))} | — | — | — | ${cell(description)} |`;
}

const body = [
  ...sections.map((section) => `## ${section.title}

| Field | Type | Required | Default | Accepted values | Description |
|---|---|---|---|---|---|
${section.definitions.map(renderDefinition).join('\n')}`),
  `## Shared value shapes

| Type | Shape | Required | Default | Accepted values | Description |
|---|---|---|---|---|---|
${valueDefinitions.map(renderValueDefinition).join('\n')}`,
].join('\n\n');

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

Use this page when you are authoring or reviewing a \`.tap.yml\` file and need an
exact field name, type, required flag, default, or accepted value. Start with
[Resource grammar](/docs/reference/dsl-grammar) to choose a resource kind, then
use the matching table here to complete or check its YAML.

These tables describe the Cloud and v0.8 runtime resource schema. For earlier
v0.7 self-hosted workspaces, use the schema bundled with that server and a
matching CLI; newer fields listed here are not supported by v0.7 clients.

The tables are generated from the \`tapstate-v1.schema.json\` used by the
Cloud and v0.8 runtime. They describe what that YAML contract accepts;
they do not prove that every declared field or surface is available in the
current preview runtime. For the execution boundary, see [Resource grammar](/docs/reference/dsl-grammar#declaration-and-execution-are-different-checks).

${body}

## Field naming constraints and document stores

Field and table names follow standard SQL naming identifiers. When writing to document stores (such as MongoDB):

- **Dots in column names**: A column name containing a dot (such as \`price.usd\`) is written as a literal dotted field key. In document stores like MongoDB, querying by path interprets the dot as navigation into a nested document, which will not match literal dotted keys unless explicitly escaped. Furthermore, MongoDB indexes cannot be created on keys containing literal dots.
- **Apply-time advisory**: When applying a pipeline that maps dotted column names to a document-store sink, tapstate reports an advisory diagnostic \`schema.column-name-reads-as-a-path\` (Severity: WARNING). This warning does not refuse the pipeline or block execution, but alerts you to the querying and indexing limitation. If you plan to query or index the field, rename the column at the source or use a \`map\` transform step to alias the dot to an underscore (for example, \`price_usd\`) before writing to the target.

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
