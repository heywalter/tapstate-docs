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

The local quickstart uses an inline `view` to materialize MySQL and
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
```

Reference the definition from a pipeline:

```yaml
view:
  use: customer-state
  from: shaped-customers
```

An inline view uses the same `primary_key` and `storage` fields and
also requires `id` and `from`.

For runtime materialization, `primary_key` is required and must be one column
that identifies the output row. The current preview
materializes the warm database layer. The Schema also describes `hot` and
`cold`, but this release refuses those tiers instead of materializing them.

Set optional `execution` on an inline view or the reusable View resource.
The `view.use` reference does not accept an execution override. View sinks
default to cluster-wide parallelism `4`; see
[Node execution](/docs/reference/pipeline#node-execution).

### View write and full-load policies

These fields apply to Cloud and v0.8 runtimes (with a matching CLI and schema).
Older v0.7 self-hosted releases can accept a different set of fields; use the
schema bundled with your server when authoring local files.

An inline View and a reusable `kind: view` accept `write_mode` (`upsert` by
default, or `append`) and `on_full_load` (`append` by default, `clear`, or `fail`).
The same target-policy meanings apply as for `serve.sync`. Canonical YAML omits
these fields at their defaults.

A new full load into an existing target may ask for a decision before it starts.
Choosing clear also persists that policy. Continuing from retained state and
CDC-only runs do not clear rows. An explicitly confirmed full rebuild after
cache loss is a new full load and applies its selected target policy, including
clear. See [Start checks](/docs/guides/apply-and-run#start-checks),
[Review start checks](/docs/guides/build-a-pipeline#review-start-checks), and
[runtime storage recovery](/docs/manage/storage-recovery).

Review [Completed snapshot loads](/docs/guides/apply-and-run#completed-snapshot-loads)
and verify actual target rows on an independent test target before using Clear
to replace existing data.

### View schema compatibility

Views do not accept `schema:` in v0.6. Remove it from local definitions; validate
and apply otherwise return `dsl.unknown-field`. Stored definitions are cleaned
during upgrade. This does not remove connector `config.schema` settings.

### Explicit View keys

An explicitly selected View key can use a unique identity supported by the
discovered source model. It is not an arbitrary key override. Updates and
deletes must supply that key in the before image; otherwise the write is refused
with `engine.view-key-missing-from-before-image`.

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
- `on_full_load`: `append` (default), `clear`, or `fail`;
- target table rename rules;
- reserved `options` (`{}`, must be empty in this release);
- node-level `execution` for parallelism and batching.

For schema-change events, `ddl: fail` rejects the event when it reaches the
target. Both `ignore` and `apply` skip the event; `apply` does not alter the
target schema. These policies only act on events the source actually emits.
Plan schema changes separately and follow the
[Preview schema-change guidance](/docs/limits#table-and-column-changes).

Sync sinks default to cluster-wide parallelism `4`. Set execution on each
`sync` element; it is not a setting on the containing `serve` block.

`on_full_load` controls existing target rows before a new full load. `append`
keeps them, `clear` removes them, and `fail` refuses a nonempty target.
Continuation from retained state and CDC-only runs do not clear target rows.
An explicit full rebuild after cache loss applies the full-load policy.
The connector must expose the capabilities needed by the selected policy.

Before starting a pipeline that writes a View or uses `serve.sync`, discover the schema for each
pipeline source. Applying the resources does not perform that discovery. If a
source schema is missing, the start is refused before data-plane components
start, the pipeline reaches `FAILED`, and its failure code is
`actuation.source-schema-not-discovered`.

Discover the missing source schema. If the pipeline reached `FAILED`, stop it
with state retained, wait for `STOPPED`, then start it again; a direct start
from `FAILED` is refused. See [Lifecycle transitions](/docs/guides/apply-and-run#lifecycle-transitions).
This precondition applies to both View and sync outputs.

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

Rename rules apply to the table reaching the sink. After a Nest or Join,
that can be the assembled output's name rather than an input table name. Use
[resolved output locations](/docs/reference/rest-api#locate-a-materialized-collection)
to locate the resulting collection.

An exact entry in `map` has priority. For every other table, tapstate applies
`case` first and then adds `prefix` and `suffix`. Accepted `case` values are
`upper`, `lower`, `camel`, and `pascal`.

### `query`

The Schema accepts `type`: `rest`, `graphql`, or `mcp`. Its optional `backend`
field can name a `sync` element. The current preview does not execute
`serve.query`; use the read surfaces described above for inspection.

### `push`

The Schema accepts a target connection ID in `source` and can include `id`,
`topic`, `format`, and reserved `options` (`{}`). The current preview does not
execute `serve.push`.
