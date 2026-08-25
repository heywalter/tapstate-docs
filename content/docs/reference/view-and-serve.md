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

A `view` materializes pipeline output into tapstate's managed state store. A
`serve` surface delivers output to systems outside tapstate. A pipeline can use
either one or both; declaring a view does not require a serve block.

## `kind: view`

```yaml title="view/customer-state.tap.yml"
version: tapstate/v1
kind: view
id: customer-state
primary_key: customer_id
storage:
  warm:
    collection: customers
    indexes: [email]
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

For runtime materialization, `primary_key` is required and must be one column
that matches the identity of the stream feeding the view. The current preview
materializes the warm database layer. The Schema also describes `hot` and
`cold`, but this release refuses those tiers instead of materializing them.

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

These shapes come from the v1 Schema. The released preview's local playground
declares an inline `view` for MySQL to MongoDB; the rows are written to the
managed state store without a serve block. A separate `serve.sync` can deliver
the same pipeline output to an external target, and both outputs can coexist.
Reusable view and serve references are resolved before the runtime builds the
pipeline. Schema acceptance alone does not prove that query endpoints or push
delivery are executable in the current public preview.
