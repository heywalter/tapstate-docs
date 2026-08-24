---
title: DSL fields reference
description: Schema-generated field lookup for the tapstate/v1 resource contract
sidebar:
  order: 2
ai:
  kind: reference
  id: dsl-fields
  aliases: [tapstate fields, tapstate schema, yaml field reference]
---

Use this page when you are authoring or reviewing a `.tap.yml` file and need an
exact field name, type, required flag, default, or accepted value. Start with
[Resource grammar](/docs/reference/dsl-grammar) to choose a resource kind, then
use the matching table here to complete or check its YAML.

The tables are generated from the `tapstate-v1.schema.json` shipped with the
documented release. They describe what that release's YAML contract accepts;
they do not prove that every declared field or surface is available in the
current preview runtime. For the execution boundary, see [Resource grammar](/docs/reference/dsl-grammar#declaration-and-execution-are-different-checks).

## Top-level resources

| Field | Type | Required | Default | Accepted values | Description |
|---|---|---|---|---|---|
| `SourceResource.version` | constant | yes | — | `tapstate/v1` | The grammar version; always "tapstate/v1". |
| `SourceResource.kind` | constant | yes | — | `source` | Resource kind discriminator. |
| `SourceResource.id` | string | yes | — | — | Unique resource id across the workspace; must not contain a dot. |
| `SourceResource.metadata` | `Metadata` | no | — | — | Optional labels and free-text description. |
| `SourceResource.connector` | string | yes | — | — | Id of the connector this source reads through (e.g. mysql, kafka). |
| `SourceResource.config` | object | no | — | — | Connector connection config; keys are connector-specific. |
| `SourceResource.mode` | `SourceMode` | no | — | `cdc`, `snapshot`, `stream`, `file`, `api` | Read mode; may be omitted when the source is only a connection supplier. |
| `SourceResource.tables` | array<`TableRef`> | no | — | — | Tables to read: bare names, /regex/ patterns, or per-table objects. |
| `SourceResource.options` | object | no | — | — | Connector-specific source options; the read mode and start position live in pipeline settings. |
| `SourceResource.srs` | `Srs` | no | — | — | Shared Record Store configuration; only valid on cdc sources. |
| `SourceResource.experimental` | object | no | — | — | Experimental fields, exempt from the v1 compatibility freeze. |
| `PipelineResource.version` | constant | yes | — | `tapstate/v1` | The grammar version; always "tapstate/v1". |
| `PipelineResource.kind` | constant | yes | — | `pipeline` | Resource kind discriminator. |
| `PipelineResource.id` | string | yes | — | — | Unique resource id across the workspace; must not contain a dot. |
| `PipelineResource.metadata` | `Metadata` | no | — | — | Optional labels and free-text description. |
| `PipelineResource.source` | string or array<string> | yes | — | — | Ids of pre-created sources this pipeline reads from; at least one is required. |
| `PipelineResource.transforms` | array<`Step`> | no | — | — | Ordered transform steps applied to the source data. |
| `PipelineResource.view` | `ViewBlock` | no | — | — | View configuration that shapes the pipeline output into a queryable result. |
| `PipelineResource.serve` | `ServeBlock` | no | — | — | Serve configuration that exposes the pipeline output downstream. |
| `PipelineResource.settings` | `Settings` | no | — | — | Task-level settings for this pipeline. |
| `PipelineResource.experimental` | object | no | — | — | Experimental fields, exempt from the v1 compatibility freeze. |
| `TransformResource.version` | constant | yes | — | `tapstate/v1` | The grammar version; always "tapstate/v1". |
| `TransformResource.kind` | constant | yes | — | `transform` | Resource kind discriminator. |
| `TransformResource.id` | string | yes | — | — | Unique resource id across the workspace; must not contain a dot. |
| `TransformResource.metadata` | `Metadata` | no | — | — | Optional labels and free-text description. |
| `TransformResource.options` | object | no | — | — | Transform-owned extension options. |
| `TransformResource.experimental` | object | no | — | — | Experimental fields, exempt from the v1 compatibility freeze. |
| `TransformResource.<body>` | one transform body | yes | — | `filter`, `map`, `js`, `union`, `nest`, `join` | Reusable transform logic selected by the `type` discriminator. |
| `ViewResource.version` | constant | yes | — | `tapstate/v1` | The grammar version; always "tapstate/v1". |
| `ViewResource.kind` | constant | yes | — | `view` | Resource kind discriminator. |
| `ViewResource.id` | string | yes | — | — | Unique resource id across the workspace; must not contain a dot. |
| `ViewResource.metadata` | `Metadata` | no | — | — | Optional labels and free-text description. |
| `ViewResource.primary_key` | string | no | — | — | Name of the column used as the view's primary key. |
| `ViewResource.storage` | `Storage` | no | — | — | Where and how the view's data is materialized. |
| `ViewResource.schema` | `ViewSchema` | no | — | — | Column definitions of the view's output schema. |
| `ViewResource.experimental` | object | no | — | — | Experimental fields, exempt from the v1 compatibility freeze. |
| `ServeResource.version` | constant | yes | — | `tapstate/v1` | The grammar version; always "tapstate/v1". |
| `ServeResource.kind` | constant | yes | — | `serve` | Resource kind discriminator. |
| `ServeResource.id` | string | yes | — | — | Unique resource id across the workspace; must not contain a dot. |
| `ServeResource.metadata` | `Metadata` | no | — | — | Optional labels and free-text description. |
| `ServeResource.sync` | array<`SyncElement`> | no | — | — | Sync publish declarations exposed by this serve surface. |
| `ServeResource.query` | array<`QueryElement`> | no | — | — | Query publish declarations exposed by this serve surface. |
| `ServeResource.push` | array<`PushElement`> | no | — | — | Push publish declarations exposed by this serve surface. |
| `ServeResource.experimental` | object | no | — | — | Experimental fields, exempt from the v1 compatibility freeze. |

## Source and shared fields

| Field | Type | Required | Default | Accepted values | Description |
|---|---|---|---|---|---|
| `Metadata.labels` | object | no | — | — | Arbitrary key/value labels attached to the resource for grouping and selection. |
| `Metadata.description` | string | no | — | — | Free-text description of the resource; never identity. |
| `TableRef.Spec.name` | string | yes | — | — | Literal name of the table to select from the source. |
| `TableRef.Spec.filter` | string | no | — | — | CEL row expression that filters which rows of the table are included. |
| `TableRef.Spec.pk` | array<string> | no | — | — | Primary key column names used to identify rows when the source does not declare one. |
| `TableRef.Spec.options` | object | no | — | — | Connector-owned extension options. |
| `Srs.key` | string | no | — | — | Optional identifier that overrides automatic mining-chain derivation. Reuse a value only when compatible CDC sources must share one replay store. |
| `Srs.retention` | string | no | — | — | How long captured change data is retained in the replay store. |
| `Srs.schema_evolution` | `SrsSchemaEvolution` | no | — | `track`, `ignore` | Schema-evolution policy applied as upstream table structures change. |
| `Srs.queryable` | boolean | no | — | — | Whether the replay store can be queried directly. |
| `Srs.enabled` | boolean | no | true | — | Whether the replay store is provisioned; false streams cdc straight to the single consumer with no shared buffering. |

## Pipeline wiring and settings

| Field | Type | Required | Default | Accepted values | Description |
|---|---|---|---|---|---|
| `Settings.error_policy` | `ErrorPolicy` | no | fail | `dead_letter`, `skip`, `fail` | How the task reacts to record-level errors during processing. |
| `Settings.batch_size` | integer | no | 1000 | — | Number of records processed per batch. |
| `Settings.parallelism` | integer | no | 1 | — | Number of parallel workers used to process the task. |
| `Settings.schedule` | string | no | — | — | Cron-style schedule for running the task; only valid for a bounded read. |
| `Settings.read_mode` | `ReadMode` | no | snapshot_and_cdc | `snapshot_and_cdc`, `cdc_only`, `snapshot_only` | What the pipeline reads from a cdc source: full snapshot then changes, changes only, or a one-shot snapshot. |
| `Settings.start_from` | string | no | latest | — | Where to start consuming an incremental tail: earliest, latest, or an ISO-8601 timestamp. |
| `Step.Inline.id` | string | yes | — | — | Unique step id within the pipeline; auto-generated for anonymous inline steps. |
| `Step.Inline.from` | `FromClause` | yes | — | — | The upstream steps or sources this transform reads from. |
| `Step.Inline.options` | object | no | — | — | Transform-owned extension options. |
| `Step.Inline.experimental` | object | no | — | — | Experimental fields, exempt from the v1 compatibility freeze. |
| `Step.Use.id` | string | no | — | — | Unique step id within the pipeline; defaults to the referenced transform name. |
| `Step.Use.use` | string | yes | — | — | Name of the transform definition to reuse. |
| `Step.Use.from` | `FromClause` | yes | — | — | The upstream steps or sources this transform reads from. |
| `Step.Use.options` | object | no | — | — | Transform-owned extension options. |
| `ViewBlock.Inline.id` | string | yes | — | — | Unique resource id across the workspace; must not contain a dot. |
| `ViewBlock.Inline.from` | `FromRef` | yes | — | — | The upstream source this view consumes records from. |
| `ViewBlock.Inline.primary_key` | string | no | — | — | Field or fields that uniquely identify a record in this view. |
| `ViewBlock.Inline.storage` | `Storage` | no | — | — | Storage backend used to persist this view. |
| `ViewBlock.Inline.schema` | `ViewSchema` | no | — | — | Field layout of the records held by this view. |
| `ViewBlock.Use.id` | string | no | — | — | Unique resource id across the workspace; must not contain a dot. Defaults to the referenced view name. |
| `ViewBlock.Use.use` | string | yes | — | — | Name of the externally defined view to reuse. |
| `ViewBlock.Use.from` | `FromRef` | yes | — | — | The upstream source this view consumes records from. |
| `ServeBlock.Inline.id` | string | no | — | — | Optional id for this serve block. |
| `ServeBlock.Inline.from` | `FromRef` | yes | — | — | The data source this serve block exposes. |
| `ServeBlock.Inline.sync` | array<`SyncElement`> | no | — | — | Tables continuously synchronized to the serving layer. |
| `ServeBlock.Inline.query` | array<`QueryElement`> | no | — | — | Read endpoints exposed for querying the served data. |
| `ServeBlock.Inline.push` | array<`PushElement`> | no | — | — | Push endpoints that stream changes to downstream consumers. |
| `ServeBlock.Use.id` | string | no | — | — | Optional id for this serve block; defaults to the referenced definition name. |
| `ServeBlock.Use.use` | string | yes | — | — | Name of the reusable serve definition to use. |
| `ServeBlock.Use.from` | `FromRef` | yes | — | — | The data source this serve block exposes. |

## Transform bodies

| Field | Type | Required | Default | Accepted values | Description |
|---|---|---|---|---|---|
| `TransformBody.Filter.type` | constant | yes | — | `filter` | Transform type discriminator. |
| `TransformBody.Filter.expr` | string | yes | — | — | The CEL boolean expression evaluated against each row. |
| `TransformBody.MapProjection.type` | constant | yes | — | `map` | Transform type discriminator. |
| `TransformBody.MapProjection.fields` | object | yes | — | — | Output fields keyed by name, each mapped by a field rule; declared order is the output order. |
| `TransformBody.Js.type` | constant | yes | — | `js` | Transform type discriminator. |
| `TransformBody.Js.script` | string | yes | — | — | The JavaScript source executed for each event. |
| `TransformBody.Union.type` | constant | yes | — | `union` | Transform type discriminator. |
| `TransformBody.Nest.type` | constant | yes | — | `nest` | Transform type discriminator. |
| `TransformBody.Nest.primary_key` | string | no | — | — | Primary key used to group child records under their parent document. |
| `TransformBody.Nest.order` | `NestOrder` | no | — | `main_first`, `sub_first` | Ordering applied to nested child records. |
| `TransformBody.Nest.entries_in_memory` | integer | no | — | — | Maximum entries kept in memory at each nest level. Additional entries use the configured backing layer. Omit to use the deployment default. |
| `TransformBody.Nest.max_elements_per_document` | integer | no | — | — | Maximum embedded elements allowed in one assembled document. Exceeding the limit fails the pipeline. Omit to use the deployment default. |
| `TransformBody.Nest.root` | `NestRoot` | yes | — | — | The root stream whose documents receive the nested children. |
| `NestRoot.from` | string | yes | — | — | Alias of the parent stream that anchors this nest tree. |
| `NestRoot.key` | array<string> | no | — | — | Upsert key fields that identify a parent document for updates. |
| `NestRoot.mode` | string | no | — | — | Write mode for the parent stream, such as append-only or upsert. |
| `NestRoot.trackKeyChanges` | boolean | no | — | — | When true, moves the assembled document when its root key changes. Requires the source to provide a before image. |
| `NestRoot.embed` | array<`Embed`> | no | — | — | Child streams embedded under each parent document. |
| `Embed.from` | string | yes | — | — | Alias of the nest step's from map that supplies this child's rows. |
| `Embed.on` | object | yes | — | — | Maps this child's join fields to the parent fields they match. |
| `Embed.as` | `EmbedAs` | yes | — | `array`, `object` | How the matched child rows are shaped under the parent: a single object or an array. |
| `Embed.path` | string | yes | — | — | Target field path under the parent where the embedded child is placed. |
| `Embed.arrayKey` | array<string> | no | — | — | Fields that uniquely identify an element within an embedded array. |
| `Embed.ignoreUpdates` | boolean | no | — | — | When true, updates to the child rows are not propagated into the parent. |
| `Embed.trackKeyChanges` | boolean | no | — | — | When true, moves an embedded subtree when its array key, parent key, or child-reference key changes. Requires the source to provide a before image. |
| `Embed.embed` | array<`Embed`> | no | — | — | Further children embedded beneath this one, forming a nested tree. |
| `TransformBody.Join.type` | constant | yes | — | `join` | Transform type discriminator. |
| `TransformBody.Join.engine` | string | yes | — | — | The query engine that runs the join, such as duckdb. |
| `TransformBody.Join.sql` | string | yes | — | — | The SQL query that produces the joined wide table. |

## View and serve fields

| Field | Type | Required | Default | Accepted values | Description |
|---|---|---|---|---|---|
| `Storage.hot` | `Storage.Hot` | no | — | — | Hot in-memory layer settings. |
| `Storage.warm` | `Storage.Warm` | no | — | — | Warm database layer settings. |
| `Storage.cold` | `Storage.Cold` | no | — | — | Cold data-lake layer settings. |
| `Storage.Hot.ttl` | string | yes | — | — | Time-to-live for hot entries, as a duration string. |
| `Storage.Warm.collection` | string | yes | — | — | Database collection that backs the warm layer. |
| `Storage.Warm.indexes` | array<string> | no | — | — | Indexes to create on the warm collection. |
| `Storage.Cold.partition_by` | array<string> | no | — | — | Fields to partition cold data by. |
| `ViewSchema.enforce` | boolean | no | — | — | Whether the declared view schema is strictly enforced at runtime. |
| `ViewSchema.evolution` | string | no | — | — | How the view schema is allowed to evolve over time, such as additive-only. |
| `SyncElement.id` | string | no | — | — | Optional id for this sync element; required only when referenced by a query backend. |
| `SyncElement.source` | string | yes | — | — | Reference to a kind: source connection supplier that provides the target connector and config. |
| `SyncElement.write_mode` | `WriteMode` | no | upsert | `upsert`, `append` | How rows are written to the target — for example upsert or append. |
| `SyncElement.rename` | `RenameSpec` | no | — | — | Rules for renaming the target table and columns relative to the pipeline output. |
| `SyncElement.ddl` | `DdlPolicy` | no | fail | `apply`, `ignore`, `fail` | Policy controlling how schema changes are applied to the target store. |
| `SyncElement.options` | object | no | — | — | Connector-owned extension options. |
| `RenameSpec.map` | object | no | — | — | Explicit per-table rename map from source name to target name; takes highest priority. |
| `RenameSpec.case` | `RenameCase` | no | — | `upper`, `lower`, `camel`, `pascal` | Case transform applied to table names before prefix/suffix rules. |
| `RenameSpec.prefix` | string | no | — | — | Prefix prepended to each target table name. |
| `RenameSpec.suffix` | string | no | — | — | Suffix appended to each target table name. |
| `QueryElement.type` | `QueryType` | yes | — | `rest`, `graphql`, `mcp` | The kind of query this element exposes. |
| `QueryElement.backend` | string | no | — | — | The sync id whose sink serves this query as an API; omit for parallel egress from the view store. |
| `PushElement.id` | string | no | — | — | Optional id for this push element; defaults to a generated id when omitted. |
| `PushElement.source` | string | yes | — | — | Id of the source resource this egress reads change events from. |
| `PushElement.topic` | string | no | — | — | Target topic or channel the change events are pushed to. |
| `PushElement.format` | `PushFormat` | no | — | — | Serialization format used to encode each pushed change event. |
| `PushElement.options` | object | no | — | — | Connector-owned extension options. |

## Runtime boundary

Schema acceptance does not prove that a connector artifact is installed or that
the current runtime executes every declared transform, view, or serve surface.
See the [resource grammar](/docs/reference/dsl-grammar) for the current preview
execution boundary.
