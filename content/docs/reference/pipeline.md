---
title: pipeline
description: Define a tapstate pipeline that selects source data, applies transforms, and materializes or delivers the result.
sidebar:
  order: 3
ai:
  kind: reference
  id: pipeline-resource
  aliases: [tapstate pipeline reference, pipeline yaml, sync target]
---

`pipeline` is the runnable composition unit. It references one or more `source`
resources, wires transforms, and can declare a `view`, a `serve` surface, or
both. A declared view is the complete instruction to materialize the pipeline
output into tapstate's managed state store; it does not need a `serve` block.

```yaml title="pipeline/orders-sync.tap.yml" structure-only
version: tapstate/v1
kind: pipeline
id: orders-sync
source: orders
settings:
  read_mode: snapshot_and_cdc
  start_from: latest
  error_policy: fail
  batch_size: 1000
  parallelism: 1
transforms:
  - id: active-orders
    from: [orders]
    type: filter
    expr: "after.status == 'active'"
serve:
  from: active-orders
  sync:
    - id: warehouse-write
      source: reporting-target
      write_mode: upsert
      ddl: fail
metadata:
  description: Keep active orders current
```

## Fields

### `source`

A source resource ID or an array of IDs. Every referenced resource must exist
in the validated workspace. A source can select multiple tables; that selection
lives in the referenced source's `tables` field, not in `pipeline.source`.

When a source omits `tables`, tapstate selects every table in its latest
discovered schema. Discover the source before applying or starting a pipeline
that relies on this automatic selection. If two sources select tables with the
same name, use a qualified `source_id.table` reference where a pipeline step or
serve declaration names that table.

For example, keep the connection IDs in `source`, then qualify the table names
in a transform input:

```yaml
source: [east_orders, west_orders]
transforms:
  - id: combine-orders
    from: [east_orders.orders, west_orders.orders]
    type: union
```

See [source](/docs/reference/source#tables) for selector syntax and runtime
limits.

### `transforms`

An ordered list of inline steps or reusable transform references.

```yaml
transforms:
  - id: active-orders
    from: [orders]
    type: filter
    expr: "after.status == 'active'"
  - id: shape-orders
    from: [active-orders]
    use: public-order-shape
```

An inline step requires `id`, `from`, and one transform body. A reusable step
requires `use` and `from`; `id` is optional. See
[transforms](/docs/reference/transforms).

### `view`

Either an inline view or a reference to a reusable `kind: view` resource. Both
forms include `from`. Declaring the view is the complete materialization
instruction: tapstate writes the selected pipeline output to the managed state
store, so a view-only pipeline does not need a `serve` block.

The view's `primary_key` identifies one materialized record. It is required by
the current runtime and must match the identity of the stream that feeds the
view. The current preview materializes the warm database layer; see
[view and serve](/docs/reference/view-and-serve) for storage and key limits.

### `serve`

Either an inline publish surface or a reference to a reusable `kind: serve`
resource. `serve.sync` delivers the pipeline output to a system outside
tapstate through the named target connection. It is separate from the managed
state store used by a view. An inline block can also contain `query` and `push`
declarations, although those surfaces are not part of the current public
preview path.

`sync` and `push` are not top-level pipeline fields. They belong inside
`pipeline.serve` or a reusable `serve` resource.

### `view` and `serve` together

When a pipeline declares both blocks, they are independent outputs of the same
pipeline. The view materializes its records into the managed state store, while
each `serve.sync` writes those records to its external target. Adding a serve
block does not replace the view, and a view does not make external delivery
implicit.

### `settings`

| Field | Accepted value | Default |
|---|---|---|
| `read_mode` | `snapshot_and_cdc`, `cdc_only`, `snapshot_only` | `snapshot_and_cdc` |
| `start_from` | `earliest`, `latest`, or an ISO-8601 timestamp | `latest` |
| `error_policy` | `fail`, `skip`, `dead_letter` | `fail` |
| `batch_size` | integer | `1000` |
| `parallelism` | integer | `1` |
| `schedule` | cron-style string; bounded reads only | — |

`read_mode` applies to a pipeline reading a `mode: cdc` source:

- `snapshot_and_cdc` performs an initial snapshot, then follows changes;
- `cdc_only` skips the initial snapshot;
- `snapshot_only` performs one bounded pass and stops.

`start_from` applies to the incremental tail. A value accepted by offline
validation still needs runtime and connector verification.

## Runtime boundary

The current preview's local playground declares an inline `view` for the
MySQL-to-MongoDB path. The runtime also executes `nest` document assembly and
can deliver a separate external `serve.sync` output. Schema acceptance of
`query`, `push`, or `join` does not by itself prove that the current public
preview executes that surface.
