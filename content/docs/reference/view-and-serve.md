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

## Current preview boundary

The `v0.3.0` Quickstart uses an inline `view` to materialize MySQL and
PostgreSQL data in the managed store. `serve.sync` delivers pipeline output to
an external target and can coexist with a view.

The v1 Schema also accepts `serve.query` and `serve.push`. They are
declaration shapes, not executable surfaces in the current preview. Use the
CLI, REST API, or MCP for bounded state inspection; those read surfaces are not
a stable application-facing data API.

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

The following resource shows the v1 Schema shape. In the current preview, use
the `sync` block for external delivery; do not use `query` or `push` to
configure a live endpoint or delivery path.

```yaml title="serve/customer-outputs.tap.yml" structure-only
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

#### Choose a write mode

`upsert` is the default. It requires every selected source table to have a
primary key in its discovered schema so tapstate can identify updates and
deletes. A unique index does not satisfy this check, and a key declared only on
the target does not replace the source key.

Use `append` only for insert-only delivery. It does not apply source updates or
deletes as keyed changes. Although the v1 grammar accepts `tables[].pk`, the
current runtime does not use that field as a primary-key override.

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

The Schema accepts `type`: `rest`, `graphql`, or `mcp`. Its optional `backend`
field can name a `sync` element. The current preview does not execute
`serve.query`; use the read surfaces described above for inspection.

### `push`

The Schema accepts a target connection ID in `source` and can include `id`,
`topic`, `format`, and connector-owned `options`. The current preview does not
execute `serve.push`.
