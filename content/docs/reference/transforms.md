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
```

`nest` assembles related streams into documents and keeps them updated as source
records change. Set `trackKeyChanges: true` on the root to move a whole document
when its root key changes. Set it on a child to move embedded data when its array
key, parent key, or child-pointer key changes. Both forms require the source
connector to provide a before image.

### Related guides

- [Assemble documents with nest](/docs/guides/assemble-documents-with-nest) for
  a complete MySQL-to-MongoDB authoring and verification sequence.
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
