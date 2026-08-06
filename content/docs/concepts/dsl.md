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
- `view` holds reusable materialization settings.
- `serve` holds reusable sync, query, and push declarations.
- `pipeline` wires sources, transforms, a view, and a serve surface into a task.

```text
source ──→ pipeline ──→ serve.sync ──→ target connection
              │
              ├── transform (inline or reusable)
              └── view (inline or reusable)
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
serve:
  from: filter-active
  sync:
    - source: profile-store
      write_mode: upsert
```

`mysql-prod` and `profile-store` are both `kind: source` resources.
`mysql-prod` includes a read `mode`; `profile-store` does not.

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
