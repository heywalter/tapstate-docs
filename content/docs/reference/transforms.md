---
title: transforms
description: Reference for inline and reusable transform shapes
sidebar:
  order: 4
ai:
  kind: reference
  id: transforms
  aliases: [tapstate transforms, pipeline filter, pipeline javascript, map fields]
---

The v1 grammar defines six transform bodies. A transform can be declared inline
in `pipeline.transforms` or as a reusable `kind: transform` resource.

An inline step adds `id` and `from`:

```yaml
transforms:
  - id: active-orders
    from: [orders]
    type: filter
    expr: "after.status == 'active'"
```

A reusable definition contains only pure logic:

```yaml title="transform/public-order-shape.tap.yml"
version: tapstate/v1
kind: transform
id: public-order-shape
type: map
fields:
  customer_name: $customer
  internal_note: false
```

Reference it from a pipeline:

```yaml
transforms:
  - id: public-shape
    from: [orders]
    use: public-order-shape
```

## Runtime status

| Type | Schema | Current preview runtime |
|---|---|---|
| `filter` | Accepted | Wired |
| `map` | Accepted | Wired |
| `js` | Accepted | Wired |
| `union` | Accepted | Wired |
| `nest` | Accepted | Wired |
| `join` | Accepted | Refused by the current pipeline DAG builder |

## `filter`

```yaml
- id: active-only
  from: [orders]
  type: filter
  expr: "after.status == 'active' && op != 'd'"
```

`expr` is a CEL boolean expression. Expressions that read `after.<field>` or
`before.<field>` require a discovered schema for every source that can reach the
step. Apply each source connection first, run `discover-schema <source-id>`,
then apply the pipeline. Offline validation compiles supported expressions but
does not evaluate them against connector records.

## `map`

```yaml
- id: shape-order
  from: [active-only]
  type: map
  fields:
    customer_name: $customer
    internal_note: false
    source_system: tapstate
    label: "=after.customer + ' <' + src + '>'"
```

Each field rule can rename a field (`$old_name`), drop it (`false`), set a
literal value, or compute a value with an `=<CEL>` expression. Fields not listed
pass through.

A computed rule that reads `after.<field>` or `before.<field>` uses the same
discovered-schema type gate as `filter`. Columns whose types cannot be mapped to
CEL without loss may still pass through unchanged, but cannot participate in a
computed expression. See [Troubleshooting](/docs/guides/troubleshooting#row-expression-schema-and-type-errors)
for the corresponding diagnostic codes.

## `js`

```yaml
- id: normalize-order
  from: [orders]
  type: js
  script: |
    function process(record, ctx) {
      if (record.after) {
        record.after.processed = true;
      }
      return record;
    }
```

The runtime uses GraalVM JavaScript and sends every event through the step. Test
scripts with representative insert, update, delete, and non-row events.

## `union`

```yaml
- id: all-orders
  from: [online-orders, store-orders]
  type: union
```

`union` explicitly merges multiple upstream streams.

## `nest`

```yaml
- id: customer-documents
  from:
    customers: customers
    orders: orders
    tiers: customer_tiers
  type: nest
  primary_key: customer_id
  root:
    from: customers
    key: [customer_id]
    mode: upsert
    trackKeyChanges: true
    embed:
      - from: orders
        on:
          customer_id: customer_id
        as: array
        path: orders
        arrayKey: [order_id]
        trackKeyChanges: true
      - from: tiers
        on:
          tier_id: tier_id
        as: object
        path: tier
        key: [tier_id]
```

`nest` assembles related streams into documents and keeps them updated as source
records change. Its aliases can refer to tables from different pipeline sources,
such as a MySQL root table and a PostgreSQL child table. Set `trackKeyChanges: true` on the root to move a whole document
when its root key changes. Set it on a child to move embedded data when its array
key, parent key, or child-pointer key changes. Both forms require the source
connector to provide a before image.

### Embed configuration and pointed-at relationships

Each `embed` block attaches an auxiliary stream to the document:

- `key`: An array of strings (`string[]`) that explicitly identifies a row in
  the embedded stream. When omitted, `nest` defaults to the stream's declared
  primary key. If the stream declares no key and has multiple unique indexes,
  `nest` refuses the configuration with `nest.key-ambiguous`.
- **Relationship direction (`on`)**: `nest` infers join direction from the `on`
  mapping by checking which side matches the stream's row identity. When the
  parent record holds a foreign key pointing to the child's identity key, it
  forms a *pointed-at* relationship (parent points to a shared child row).
- **Pointed-at row lifecycle**:
  - **Shared storage**: A row referenced by multiple parent documents is stored
    once in state and shared across them.
  - **Unblocking arrival**: Documents waiting for a referenced row do not block;
    they emit without the embedded slice and update once the referenced row arrives.
  - **Deletion**: When a referenced row is deleted, it is removed from all
    documents pointing to it.
  - **Repointing**: Updating a parent's pointer unbinds the old referenced row
    and attaches the new one.

### Nest diagnostics

The engine validates nest topologies and enforces bounds at runtime:

- `nest.key-ambiguous`: The embed declares no `key`, and the source table has no
  primary key but multiple candidate unique indexes. Provide `key: [...]` explicitly.
- `nest.reference-fanout-limit-exceeded`: More documents point to a single
  referenced row than the configured fanout capacity limit permits.
- `nest.referenced-level-carries-embeds`: A pointed-at referenced level itself
  declares nested `embed` definitions.

### Related guides

- [Assemble documents with nest](/docs/guides/assemble-documents-with-nest) for
  a complete MySQL-and-PostgreSQL authoring and verification sequence.
- [Handle structural key changes with nest](/docs/guides/nest-structural-key-changes)
  before enabling `trackKeyChanges`.
- [Plan nest capacity and delivery behavior](/docs/guides/nest-throughput) for
  whole-document writes, final-state delivery, and capacity planning.

## `join`

```yaml
- id: customer-order-summary
  from:
    customers: customers
    orders: orders
  type: join
  engine: duckdb
  sql: |
    SELECT c.customer_id, c.name, count(o.id) AS order_count
    FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.customer_id
    GROUP BY c.customer_id, c.name
```

The Schema describes the Join declaration, but the current preview runtime
refuses this stateful transform. Keep it out of runnable preview pipelines.
