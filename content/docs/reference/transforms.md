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
| `nest` | Accepted | Refused by the current pipeline DAG builder |
| `join` | Accepted | Refused by the current pipeline DAG builder |

## `filter`

```yaml
- id: active-only
  from: [orders]
  type: filter
  expr: "after.status == 'active' && op != 'd'"
```

`expr` is a CEL boolean expression. Offline validation compiles and type-checks
supported expressions but does not evaluate them against connector records.

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
    embed:
      - from: orders
        on:
          customer_id: customer_id
        as: array
        path: orders
```

The Schema describes the Nest declaration, but the current preview runtime
refuses this stateful transform. Keep it out of runnable preview pipelines.

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
