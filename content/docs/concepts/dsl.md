---
title: Resources and pipelines
description: Understand the tapstate resource model and how reusable declarations compose into a pipeline
ai:
  kind: concept
  id: resources-and-pipelines
  aliases: [tapstate dsl, tapstate resources, tapstate pipeline, tapstate yaml]
---

Tapstate uses declarative `*.tap.yml` files with `version: tapstate/v1`.

If this is your first runnable pipeline, begin with the
[offline workspace walkthrough](/docs/overview/quickstart). For exact field shapes, use the
[resource grammar](/docs/reference/dsl-grammar).

## Five resource kinds

- `source` owns connector configuration. A read source has `mode`; a target
  connection omits it.
- `transform` holds reusable, input-independent logic.
- `view` holds reusable materialization settings for tapstate's managed state store.
- `serve` holds reusable external sync, query, and push declarations.
- `pipeline` wires sources and transforms to a view, a serve surface, or both.

```text
source ──→ pipeline ──→ view ──→ managed state store
              │
              ├── transform (inline or reusable)
              └── serve.sync ──→ external target connection
```

## Example relationship

```yaml title="pipeline/active-users.tap.yml" structure-only
version: tapstate/v1
kind: pipeline
id: active-users
source: mysql-prod
settings:
  read_mode: snapshot_and_cdc
transforms:
  - id: filter-active
    from: [users]
    type: filter
    expr: "after.status == 'active'"
view:
  id: profile-state
  from: filter-active
  primary_key: id
```

`mysql-prod` is the read source in this example. The view consumes the
`filter-active` transform; if you add `serve.sync`, its `source` names the
external target connection that receives the same pipeline result.

Declaring `view` is the complete instruction to materialize the current
pipeline result; no `serve` block is required. Add `serve.sync` when the same
result must also be delivered to a system outside tapstate. If both are
declared, the view and the external serve output are independent consumers of
the pipeline result.

## Why use resource files

Ordinary files provide:

- reviewable changes in Git;
- stable IDs and explicit references;
- secret placeholders instead of committed credentials;
- editor assistance from the release-matched Schema;
- deterministic diagnostics;
- a common context for people, automation, and AI assistants.

## What validation proves

Offline validation catches resource shape, reference, and catalog-rule errors.
It does not connect to an external system, install connector artifacts, or prove
that every Schema-declared feature is implemented by the current runtime.

After validation, exercise connectivity and representative data behavior in a
non-production deployment. See the [resource grammar](/docs/reference/dsl-grammar)
for the exact validation boundary.
