---
title: Resources and pipelines
description: Understand the documented tapstate resource model and how a pipeline references source and target connections
ai:
  kind: concept
  id: resources-and-pipelines
  aliases: [tapstate dsl, tapstate resources, tapstate pipeline, tapstate yaml]
---

Tapstate uses declarative `.tapstate.yml` resources with `version: tapstate/v1` to describe a data path.

If this is your first pipeline, begin with the [Quickstart](/docs/overview/quickstart). For connector-specific fields, use the [connector directory](/docs/connectors). For exact resource syntax, see the [DSL grammar reference](/docs/reference/dsl-grammar).

## Resource relationships

Two documented resource kinds define the basic authoring model:

- A `source` resource identifies a connector and its configuration. When it has a read `mode`, it can supply records to a pipeline. Without a read mode, it can supply target connection configuration.
- A `pipeline` resource references a source, applies documented policies or transforms, and identifies one or more delivery targets.

```text
source connection ──┐
                    ├── pipeline ──→ target connection
target connection ──┘
```

The current file format stores both source and target connection settings in a `kind: source` resource. A target connection omits the source read mode and is referenced by a pipeline output.

## Example relationship

```yaml
version: tapstate/v1
kind: pipeline
id: active-users
source: mysql-prod
transforms:
  - name: filter-active
    filter: "record.status == 'active'"
sync:
  - source: users
    target:
      connection: profile-store
      collection: user_profiles
```

Connection resources with the IDs `mysql-prod` and `profile-store` complete these references.

## Why use declarative resources

Ordinary files provide:

- reviewable changes in Git;
- stable IDs and explicit references;
- secret placeholders instead of committed credentials;
- editor assistance from a schema;
- deterministic diagnostics;
- a common context for people, automation, and AI assistants.

Validation can catch resource and reference errors before a run. Network access, permissions, and source or target behavior still need to be tested in the environment where the pipeline runs.

## Authoring lifecycle

A safe resource workflow is:

1. Choose the connector role and mode.
2. Prepare the external source or target.
3. Create or edit resources.
4. Review IDs, references, fields, and secrets.
5. Validate the workspace.
6. Exercise connectivity and data behavior in a non-production deployment.

Continue with the [Quickstart](/docs/overview/quickstart) for a complete relationship, or use [Troubleshooting](/docs/guides/troubleshooting) when validation succeeds but connectivity or data movement still fails.
