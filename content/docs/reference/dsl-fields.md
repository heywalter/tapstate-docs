---
title: DSL Fields Reference
description: Field lookup for the documented tapstate resource contract
sidebar:
  order: 2
ai:
  kind: reference
  id: dsl-fields
  aliases: [tapstate fields, tapstate schema, yaml field reference]
---

This table is a documentation lookup. Confirm exact field acceptance with the resource schema supplied with your tapstate version.

| Field | Type | Required | Default | Enum |
|---|---|---|---|---|
| `PipelineResource.experimental` | object | no |  |  |
| `PipelineResource.id` | string | yes |  |  |
| `PipelineResource.kind` | const | yes |  | `pipeline` |
| `PipelineResource.metadata` | object | no |  |  |
| `PipelineResource.metadata.description` | string | no |  |  |
| `PipelineResource.metadata.labels` | object | no |  |  |
| `PipelineResource.serve` | object | no |  |  |
| `PipelineResource.settings` | object | no |  |  |
| `PipelineResource.settings.batch_size` | integer | no | 1000 |  |
| `PipelineResource.settings.error_policy` | string | no | fail | `dead_letter`, `fail`, `skip` |
| `PipelineResource.settings.parallelism` | integer | no | 1 |  |
| `PipelineResource.settings.schedule` | string | no |  |  |
| `PipelineResource.source` | array<string>\|string | yes |  |  |
| `PipelineResource.transforms` | array<object> | no |  |  |
| `PipelineResource.version` | const | yes |  | `tapstate/v1` |
| `PipelineResource.view` | object | no |  |  |
| `ServeResource.experimental` | object | no |  |  |
| `ServeResource.id` | string | yes |  |  |
| `ServeResource.kind` | const | yes |  | `serve` |
| `ServeResource.metadata` | object | no |  |  |
| `ServeResource.metadata.description` | string | no |  |  |
| `ServeResource.metadata.labels` | object | no |  |  |
| `ServeResource.push` | array<object> | no |  |  |
| `ServeResource.query` | array<object> | no |  |  |
| `ServeResource.sync` | array<object> | no |  |  |
| `ServeResource.version` | const | yes |  | `tapstate/v1` |
| `SourceResource.config` | object | no |  |  |
| `SourceResource.connector` | string | yes |  |  |
| `SourceResource.experimental` | object | no |  |  |
| `SourceResource.id` | string | yes |  |  |
| `SourceResource.kind` | const | yes |  | `source` |
| `SourceResource.metadata` | object | no |  |  |
| `SourceResource.metadata.description` | string | no |  |  |
| `SourceResource.metadata.labels` | object | no |  |  |
| `SourceResource.mode` | string | no |  | `api`, `cdc`, `file`, `snapshot`, `stream` |
| `SourceResource.options` | object | no |  |  |
| `SourceResource.srs` | object | no |  |  |
| `SourceResource.srs.key` | string | no |  |  |
| `SourceResource.srs.queryable` | boolean | no |  |  |
| `SourceResource.srs.retention` | string | no |  |  |
| `SourceResource.srs.schema_evolution` | string | no |  | `ignore`, `track` |
| `SourceResource.tables` | array<object\|string> | no |  |  |
| `SourceResource.version` | const | yes |  | `tapstate/v1` |
| `TransformResource.experimental` | object | no |  |  |
| `TransformResource.id` | string | yes |  |  |
| `TransformResource.kind` | const | yes |  | `transform` |
| `TransformResource.metadata` | object | no |  |  |
| `TransformResource.metadata.description` | string | no |  |  |
| `TransformResource.metadata.labels` | object | no |  |  |
| `TransformResource.options` | object | no |  |  |
| `TransformResource.version` | const | yes |  | `tapstate/v1` |
| `ViewResource.experimental` | object | no |  |  |
| `ViewResource.id` | string | yes |  |  |
| `ViewResource.kind` | const | yes |  | `view` |
| `ViewResource.metadata` | object | no |  |  |
| `ViewResource.metadata.description` | string | no |  |  |
| `ViewResource.metadata.labels` | object | no |  |  |
| `ViewResource.primary_key` | string | no |  |  |
| `ViewResource.schema` | object | no |  |  |
| `ViewResource.schema.enforce` | boolean | no |  |  |
| `ViewResource.schema.evolution` | string | no |  |  |
| `ViewResource.storage` | object | no |  |  |
| `ViewResource.storage.cold` | object | no |  |  |
| `ViewResource.storage.cold.partition_by` | array<string> | no |  |  |
| `ViewResource.storage.hot` | object | no |  |  |
| `ViewResource.storage.hot.ttl` | string | yes |  |  |
| `ViewResource.storage.warm` | object | no |  |  |
| `ViewResource.storage.warm.collection` | string | yes |  |  |
| `ViewResource.storage.warm.indexes` | array<string> | no |  |  |
| `ViewResource.version` | const | yes |  | `tapstate/v1` |
