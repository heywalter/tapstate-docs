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
      execution:
        parallelism: 4
        batch:
          max_records: 1024
          max_wait: 0ms
metadata:
  description: Keep active orders current
```

## Fields

### `source`

A source resource ID or an array of IDs. Every referenced resource must exist
in the validated workspace. Blank or newly initialized draft pipelines specify
an empty array (`source: []`) while assembling the pipeline structure before input
sources are attached. The sources can use different connectors; for
example, one pipeline can read MySQL orders and PostgreSQL shipments. A source
can select multiple tables; that selection lives in the referenced source's
`tables` field, not in `pipeline.source`.

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

In Cloud and v0.8, set `write_mode` and `on_full_load` on the inline View or reusable View
resource, rather than on `view.use`. Defaults are `upsert` and `append`.
Review [View write policies](/docs/reference/view-and-serve#view-write-and-full-load-policies),
[Start checks](/docs/guides/apply-and-run#start-checks), and
[Review start checks](/docs/guides/build-a-pipeline#review-start-checks) before a fresh load
into a populated target.

### `serve`

Either an inline publish surface or a reference to a reusable `kind: serve`
resource. `serve.sync` delivers the pipeline output to a system outside
tapstate through the named target connection. It is separate from the managed
state store used by a view. An inline block can also contain `query` and `push`
declarations, although those surfaces are not part of the current public
preview path.

For sync write modes and their source-key requirements, see
[view and serve](/docs/reference/view-and-serve#choose-a-write-mode).

`sync` and `push` are not top-level pipeline fields. They belong inside
`pipeline.serve` or a reusable `serve` resource.

### `view` and `serve` together

When a pipeline declares both blocks, they are independent outputs of the same
pipeline. The view materializes the output selected by `view.from` into the
managed state store, while each `serve.sync` delivers the output selected by
`serve.from` to its external target. The two blocks use the same output only
when their `from` values resolve to the same pipeline node. Adding a serve block
does not replace the view, and a view does not make external delivery implicit.

### `settings`

| Field | Accepted value | Default |
|---|---|---|
| `read_mode` | `snapshot_and_cdc`, `cdc_only`, `snapshot_only` | `snapshot_and_cdc` |
| `start_from` | `earliest`, `latest`, or an ISO-8601 timestamp | `latest` |
| `error_policy` | `fail`, `skip`, `dead_letter` | `fail` |
| `schedule` | cron-style string; bounded reads only | — |

`read_mode` applies to a pipeline reading a `mode: cdc` source:

- `snapshot_and_cdc` performs an initial snapshot, then follows changes;
- `cdc_only` skips the initial snapshot;
- `snapshot_only` reads the selected rows once without continuing with CDC.

`start_from` applies to the incremental tail. A value accepted by offline
validation still needs runtime and connector verification.

The legacy `settings.parallelism` and `settings.batch_size` fields still parse,
but have no runtime effect in v0.7. Server-side planning reports
`dsl.setting-has-no-effect`. Use node-level `execution` instead.

### Node execution

Set `execution` on a Source resource, an inline or referenced transform step,
an inline view, a reusable View resource, or each `serve.sync` element:

```yaml
transforms:
  - id: active-orders
    from: [orders]
    type: filter
    expr: "after.status == 'active'"
    execution:
      parallelism: 2
      batch:
        max_records: 1024
        max_wait: 10ms
```

| Field | Accepted value | Default |
|---|---|---|
| `parallelism` | Integer from 1 to 1024; target total processors across the cluster | Sources and transforms: `1`; view and sync sinks: `4` |
| `batch.max_records` | Integer from 1 to 65536 | `1024` |
| `batch.max_wait` | Whole-number duration in `ms`, `s`, or `m`, from `0ms` to `60s` | `0ms` |

Parallelism is a cluster-wide target. The effective count depends on the node
and participating members and can differ from the requested value. Sources
currently run with one reader even when a larger value is requested;
server-side planning reports `dsl.source-read-not-split`. Offline `validate`
can accept these settings without displaying the advisories.

A batch closes when either limit is reached. `0ms` adds no wait: it still
batches records that have already arrived, up to `max_records`.

Do not put `execution` on the pipeline itself or a reusable Transform
definition. A reusable transform's execution belongs on the pipeline step
that references it. A `view: { use: ... }` reference cannot override execution;
set it on the referenced View resource.

## Runtime boundary

The local quickstart reads MySQL and PostgreSQL sources,
executes `nest` document assembly, and materializes an inline `view` in its
managed store. `serve.sync` is the separate surface for delivery to an external
target. Schema acceptance of reusable views, `query`, or `push` does not mean
the current runtime executes them; `join` runs in preview with restricted
inputs (see [Transform reference](/docs/reference/transforms#join)).
