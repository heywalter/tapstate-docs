---
title: view and serve
description: Reference for reusable view materialization and serve surface resources
sidebar:
  order: 5
ai:
  kind: reference
  id: view-and-serve
  aliases: [tapstate view, tapstate serve, serve sync, serve query, serve push]
---

`view` and `serve` are reusable definition resources. They do not declare their
own input wiring; a pipeline supplies `from`.

## `kind: view`

```yaml title="view/customer-state.tap.yml"
version: tapstate/v1
kind: view
id: customer-state
primary_key: customer_id
storage:
  hot:
    ttl: 15m
  warm:
    collection: customers
    indexes: [email]
  cold:
    partition_by: [region]
schema:
  enforce: true
  evolution: additive
```

Reference the definition from a pipeline:

```yaml
view:
  use: customer-state
  from: shaped-customers
```

An inline view uses the same `primary_key`, `storage`, and `schema` fields and
also requires `id` and `from`.

## `kind: serve`

```yaml title="serve/customer-outputs.tap.yml"
version: tapstate/v1
kind: serve
id: customer-outputs
sync:
  - id: customer-store
    source: warehouse
    write_mode: upsert
    ddl: fail
query:
  - type: rest
    backend: customer-store
push:
  - id: customer-events
    source: event-bus
    topic: customer-events
```

Reference the definition from a pipeline:

```yaml
serve:
  use: customer-outputs
  from: customer-state
```

An inline serve block uses the same `sync`, `query`, and `push` arrays and
requires `from`.

### `sync`

Each element requires a target connection ID in `source` and can include:

- `id`;
- `write_mode`: `upsert` or `append`;
- `ddl`: `apply`, `ignore`, or `fail`;
- target table rename rules;
- connector-owned `options`.

#### Rename target tables

`rename` changes the target table or collection name without changing the
pipeline output fields:

```yaml
serve:
  from: shaped-orders
  sync:
    - id: warehouse-write
      source: warehouse
      write_mode: upsert
      rename:
        map:
          ORDERS: orders_current
        case: lower
        prefix: odp_
        suffix: _v1
```

An exact entry in `map` has priority. For every other table, tapstate applies
`case` first and then adds `prefix` and `suffix`. Accepted `case` values are
`upper`, `lower`, `camel`, and `pascal`.

### `query`

Each element requires `type`: `rest`, `graphql`, or `mcp`. `backend` can name a
`sync` element that provides the query backend.

### `push`

Each element requires a target connection ID in `source` and can include `id`,
`topic`, `format`, and connector-owned `options`.

## Runtime boundary

These shapes come from the v1 Schema. The released preview's local demo declares
inline `serve.sync` for MySQL to MongoDB. Schema acceptance alone does not prove
that reusable views, query endpoints, or push delivery are executable in your
runtime version.
