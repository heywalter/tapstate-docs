---
title: pipeline
description: Define a tapstate pipeline that connects source and target resources, selects data, and applies transforms.
sidebar:
  order: 3
ai:
  kind: reference
  id: pipeline-resource
  aliases: [tapstate pipeline reference, pipeline yaml, sync target]
---

`pipeline` is the runnable composition unit. It references one or more `source`
resources, wires transforms, optionally materializes a view, and declares a
serve surface.

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
      source: warehouse
      write_mode: upsert
      ddl: fail
metadata:
  description: Keep active orders current
```

## Fields

### `source`

A source resource ID or an array of IDs. Every referenced resource must exist
in the validated workspace.

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
forms include `from`.

### `serve`

Either an inline publish surface or a reference to a reusable `kind: serve`
resource. An inline block can contain `sync`, `query`, and `push`.

`sync` and `push` are not top-level pipeline fields. They belong inside
`pipeline.serve` or a reusable `serve` resource.

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

The current preview's local demo declares an inline `serve.sync` pipeline from
MySQL to MongoDB. Schema acceptance of reusable views, `query`, `push`, Nest, or
Join does not by itself prove that the current runtime executes that surface.
