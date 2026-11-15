---
title: Resources and pipelines
description: Understand the tapstate resource model and how reusable declarations compose into a pipeline
ai:
  kind: concept
  id: resources-and-pipelines
  aliases: [tapstate dsl, tapstate resources, tapstate pipeline, tapstate yaml]
---

Tapstate describes connections, transforms, and pipeline outputs as
declarative resources. In Cloud, you
[build a pipeline in the web application](/docs/guides/build-a-pipeline) and
can inspect the generated definition at any time via **Inspect Plan**
(**DSL Preview**). On self-hosted servers and in local workspaces, you can also
author `*.tap.yml` files with `version: tapstate/v1` directly.

For file-based authoring, start with
[Create your own workspace](/docs/overview/create-workspace). For exact field
shapes, use the [resource grammar](/docs/reference/dsl-grammar).

## Draft, published configuration, and run

A **draft** is saved authoring work. It can be incomplete and does not run.
Compiling a draft checks whether it can produce a valid pipeline definition.
**Result Preview** goes further: it reads a bounded source sample and shows the
transformed result without writing to the destination.

**Publishing** a draft stores its runnable configuration as an artifact. In
Cloud, selecting **Start pipeline** saves the draft, checks and publishes its
configuration, and requests a run; applying `*.tap.yml` files through the CLI
stores artifacts directly without starting a pipeline or replacing an active
run.

A **run** executes a published pipeline revision. If you publish changes while a
pipeline is running, stop and start deliberately to use the new revision,
choosing whether to keep or clear state first. See
[Manage pipelines](/docs/guides/manage-pipelines) (or
[Apply and run a pipeline](/docs/guides/apply-and-run) for the CLI).

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

## Why use a declarative model

Whether edited visually in Cloud or stored as `.tap.yml` files in Git, a shared
resource contract provides:

- stable IDs and explicit references across connections, transforms, and views;
- reviewable diffs for human review or AI-proposed changes;
- secret separation instead of committed credentials;
- editor validation from the release-matched Schema and deterministic diagnostics;
- a consistent abstraction for Cloud web authoring, automation, and AI assistants.

## What validation proves

Offline validation catches resource shape, reference, and catalog-rule errors.
It does not connect to an external system, install connector artifacts, or prove
that every Schema-declared feature is implemented by the current runtime.

After validation, exercise connectivity and representative data behavior in a
non-production deployment. See the [resource grammar](/docs/reference/dsl-grammar)
for the exact validation boundary.
