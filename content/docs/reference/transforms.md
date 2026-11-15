---
title: transforms
description: Reference for inline and reusable transform shapes
sidebar:
  order: 4
ai:
  kind: reference
  id: transforms
  aliases: [tapstate transforms, pipeline filter, pipeline javascript, map fields]
---

The v1 grammar defines seven transform bodies. A transform can be declared inline
in `pipeline.transforms` or as a reusable `kind: transform` resource.

An inline step adds `id` and `from`:

```yaml
transforms:
  - id: active-orders
    from: [orders]
    type: filter
    expr: "op == 'd' ? before.status == 'active' : after.status == 'active'"
```

A reusable definition contains only pure logic:

```yaml title="transform/public-order-shape.tap.yml"
version: tapstate/v1
kind: transform
id: public-order-shape
type: map
fields:
  customer_name: $customer
  internal_note: false
```

Reference it from a pipeline:

```yaml
transforms:
  - id: public-shape
    from: [orders]
    use: public-order-shape
```

Set optional `execution` on the inline step or the step containing `use`,
not on the reusable Transform definition. Transforms default to parallelism
`1`. See [Node execution](/docs/reference/pipeline#node-execution).

## Runtime status

| Type | Schema | Current preview runtime |
|---|---|---|
| `filter` | Accepted | Wired |
| `map` | Accepted | Wired |
| `js` | Accepted | Wired |
| `union` | Accepted | Wired |
| `unwind` | Accepted | Wired |
| `nest` | Accepted | Wired |
| `join` | Accepted | Wired (Preview) |

## `filter`

```yaml
- id: active-only
  from: [orders]
  type: filter
  expr: "op == 'd' ? before.status == 'active' : after.status == 'active'"
```

`expr` is a CEL boolean expression. Expressions that read `after.<field>` or
`before.<field>` require a discovered schema for every source that can reach the
step. Apply each source connection first, run `discover-schema <source-id>`,
then apply the pipeline. Offline validation compiles supported expressions but
does not evaluate them against connector records.

### Maintain a filtered result

The update-retraction behavior below applies to Cloud and v0.8 servers (see
[upgrade requirements](/docs/releases/v0.8#before-upgrading)). Do not assume
that an older self-hosted release (`v0.7` or earlier) has the same behavior.

Matching snapshot rows and inserts pass through. A matching update also passes
through. If an update stops matching, tapstate evaluates its earlier row as
`after`; if that row matched, it emits a delete for the earlier key. If neither
image matches, the update produces no row event.

Compare source and target rows across the full match → nonmatch → match cycle
on an independent test target before relying on a filtered maintained result.

Source deletes are evaluated with the removed row in `before` and an empty
`after`. The expression above handles both source deletes and updates. Explicit
operation predicates still apply: `op != 'd'` suppresses source deletes, and
`op == 'r'` admits only snapshot reads. DDL events bypass the filter.

Updates and deletes need the earlier fields read by the predicate. Configure
full before images in the source. For PostgreSQL, for example:

```sql
ALTER TABLE shipments REPLICA IDENTITY FULL;
```

A missing field needed during evaluation produces
`transform.expression-failed`; the filter does not query the source for the
old row. Check both entry into and removal from the filtered result when
validating CDC.

## `map`

```yaml
- id: shape-order
  from: [active-only]
  type: map
  fields:
    customer_name: $customer
    internal_note: false
    source_system: tapstate
    label: "=after.customer + ' <' + src + '>'"
```

Each field rule can rename a field (`$old_name`), drop it (`false`), set a
literal value, or compute a value with an `=<CEL>` expression. Fields not listed
pass through.

A computed rule that reads `after.<field>` or `before.<field>` uses the same
discovered-schema type gate as `filter`. Columns whose types cannot be mapped to
CEL without loss may still pass through unchanged, but cannot participate in a
computed expression. See [Troubleshooting](/docs/guides/troubleshooting#row-expression-schema-and-type-errors)
for the corresponding diagnostic codes.

### Decimal columns and null values

A direct column expression such as `moved: "=after.amount"` preserves the
source decimal's precision and scale. This also applies to direct `before`
column references and `$amount` renames. Computed decimal results, such as a
conditional between decimal columns, have no declared precision or scale and
are rejected during validation. Keep an exact decimal as a direct column
reference instead of computing a new decimal value.

Outer joins can supply null dimension values. Use expressions that handle null
explicitly. An operation that cannot accept null fails with
`transform.expression-failed`; it is not a target-connector write failure.

## `js`

```yaml
- id: normalize-order
  from: [orders]
  type: js
  script: |
    function process(record, ctx) {
      if (record.after) {
        record.after.processed = true;
      }
      return record;
    }
```

The runtime uses GraalVM JavaScript and sends every event through the step,
including DDL and data change events (unlike `filter` and `map` which evaluate
only row data). Connector converted value provenance metadata is preserved
across unmutated field slots; writing a new value to a slot discards that slot's
source provenance. Test scripts with representative insert, update, delete, and
non-row events.

### Decimal values in JavaScript

JavaScript reads decimal columns as double-precision numbers, so arithmetic and
comparisons work but can round values. An untouched field retains its original
value and type information; assigning or copying a number uses JavaScript
numeric precision.

Reading a decimal that overflows to infinity or underflows from nonzero to zero
fails with `transform.script-decimal-out-of-range`. This range check does not
reject every loss of decimal precision. Keep exact values unchanged when you
do not need to calculate with them.

## `union`

```yaml
- id: all-orders
  from: [online-orders, store-orders]
  type: union
```

`union` explicitly merges multiple upstream streams.

## `unwind`

`unwind` is available in Cloud and self-hosted runtimes; `source_id_field` and
automatic target-identity separation require Cloud or the v0.8 server and
matching CLI/schema (for v0.7 self-hosted workspaces, validate against the
schema bundled with that server).

Expand an array into one output row per element. Each output keeps the parent's
fields and replaces the array with the selected element. Use an upsert target
so updates and deletes can change the rows produced by an earlier expansion.

```yaml
- id: order_lines
  from: [orders]
  type: unwind
  path: items
  element_key: sku
  include_array_index: item_no
  element_type: json
```

For `{id: 10, items: [{sku: "a"}, {sku: "b"}]}`, the logical output is:

```json
{"id": 10, "items": {"sku": "a"}, "sku": "a", "item_no": 0}
{"id": 10, "items": {"sku": "b"}, "sku": "b", "item_no": 1}
```

The element key is copied to a top-level column. The complete output key is
`(id, sku)` in this example. If both locator options are present, `element_key`
supplies identity and the index records order. For scalar elements, omit
`element_key` and use `include_array_index`; the key becomes `(id, item_no)`.
At least one locator is required. Output order is not guaranteed.

| Field | Default | Meaning |
|---|---|---|
| `path` | Required | One top-level array field; dotted paths, wildcards, and recursive expansion are not supported. |
| `element_key` | — | Field inside each element used as its identity; also adds that top-level column. |
| `include_array_index` | — | Name of a generated zero-based ordinal column; supplies identity when `element_key` is absent. |
| `preserve_null_and_empty_arrays` | `false` | Retain one row for a null, missing, or empty array when `true`; its locator is null. |
| `source_id_field` | `_unwind_source_id` | Name for the preserved parent identity when a destination requires automatic identity separation. Adds no field when separation is unnecessary. |
| `element_type` | — | Declared output-column type, such as `json`; when omitted, the type is unknown and target handling is connector-dependent. This setting does not convert values. |

A non-array value is one element. A JSON string is still a string; decode it
before expansion if it should become an array. A second unwind extends the
previous expansion's key with its own locator. Generated column names must not
collide with parent columns, the array path, or each other.

### Target identity and existing data

The complete logical key identifies a child. A target can also enforce a
separate unique identity: MongoDB `_id`, for example, cannot be reused for every
child of one parent. When the destination can generate its own identity and
reliably match the complete expanded key, tapstate preserves the parent's
identity under `source_id_field` and omits the physical identity from writes.

For a qualifying MongoDB target, a logical row
`{"_id":"order-1","items":"a","item_no":0}` is written as
`{"_unwind_source_id":"order-1","items":"a","item_no":0}`. MongoDB generates
`_id`; matching uses `(_unwind_source_id, item_no)` for updates, deletes, and
replay. The original value and type are preserved. Compatible composite-key
targets keep their fields unchanged.

Automatic separation requires all of the following:

- The repeated parent identity conflicts with a target identity the database
  can generate independently.
- The preserved field does not overwrite an existing field.
- A complete unique matching index exists or can be prepared for a new or
  empty target, or a target explicitly configured to clear on full load.
- Other unique constraints remain compatible with the expanded rows.
- Exact target metadata and the required matching reads are available.

MongoDB checks query index declarations through the connector and still need
permission to read matching records. They evaluate the fields of declared
unique or primary indexes; MongoDB-specific partial filters, sparse behavior,
and collation are not evaluated. Review those options separately. A passing
check is not a guarantee about index properties the connector does not report.
Failed or malformed metadata queries block START with
`connector.target-identity-check-failed`. A populated target without the
required matching index needs an explicit migration or a new destination.

For MongoDB automatic matching, use stable scalar keys: strings, booleans,
signed 64-bit integers, ObjectIds, binary values with their subtype, or dates
with millisecond precision. Null, missing, array, object, floating-point,
decimal, and sub-millisecond date keys are refused. Existing matching records
with incompatible BSON key types also block the batch before writes. An
ObjectId and its hexadecimal string represent the same logical key; changing
only that BSON representation during CDC is refused for replay safety.

An existing PostgreSQL or MySQL table can qualify when it has an independently
generated identity, the preserved field, and a complete unique matching key.
Automatic relational matching currently requires signed BIGINT columns and
signed 64-bit integer values for every matching component. String coercion,
decimal rounding, unknown widths, and unverified collation semantics are
refused. Tapstate does not add missing columns or remove business constraints.

Use a nonblank, top-level `source_id_field` name without dots, a leading `$`, or
a NUL character. An omitted name inherits an earlier unwind's effective choice;
an explicit name overrides it downstream. Streams requiring separation at the
same destination must agree on the preserved field and complete key. Independent
or compatible destinations can keep different settings.

Changing this field does not migrate existing rows or indexes. Use a new target
or explicitly migrate and validate the data before changing a populated target.
See [target identity previews](/docs/guides/build-a-pipeline#inspect-unwind-target-identity).

### Changes and before images

Snapshot rows and inserts expand the current image. Deletes expand the previous
image. Updates delete expanded write keys that disappeared and write current
rows, including when a parent key changes or an indexed element is removed.

The source must provide a complete previous image, including every parent key
and at least one non-key field. Missing, empty, or key-only images produce
`transform.unwind-needs-a-complete-before-image`. Configure full MySQL binlog
row images or MongoDB collection pre-images as appropriate. A complete row
without the optional array is allowed if it contains another non-key field.

Choose element keys unique within each parent. Duplicate keys produce
`transform.unwind-rows-share-a-key` at WARNING severity; the destination can
retain only the last row for that key. With automatic identity separation,
`preserve_null_and_empty_arrays: true` cannot supply the required non-null
locator for a retained empty row.

An append destination is refused with `dsl.unwind-needs-an-upsert-target`.
Neither one-time expansion into append nor automatic existing-data migration
is supported. A following `map` may rename key columns, but must retain their
identity and values in both current and previous images.

## `nest`

```yaml
- id: customer-documents
  from:
    customers: customers
    orders: orders
    tiers: customer_tiers
  type: nest
  primary_key: customer_id
  root:
    from: customers
    key: [customer_id]
    mode: upsert
    trackKeyChanges: true
    embed:
      - from: orders
        on:
          customer_id: customer_id
        as: array
        path: orders
        arrayKey: [order_id]
        trackKeyChanges: true
      - from: tiers
        on:
          tier_id: tier_id
        as: object
        path: tier
        key: [tier_id]
```

`nest` assembles related streams into documents and keeps them updated as source
records change. Its aliases can refer to tables from different pipeline sources,
such as a MySQL root table and a PostgreSQL child table. Set `trackKeyChanges: true` on the root to move a whole document
when its root key changes. Set it on a child to move embedded data when its array
key, parent key, or child-pointer key changes. Both forms require the source
connector to provide a before image.

### Embed configuration and pointed-at relationships

Each `embed` block attaches an auxiliary stream to the document:

- `key`: An array of strings (`string[]`) that explicitly identifies a row in
  the embedded stream. When omitted, `nest` defaults to the stream's declared
  primary key. If the stream declares no key and has multiple unique indexes,
  `nest` refuses the configuration with `nest.key-ambiguous`.
- **Relationship direction (`on`)**: `nest` infers join direction from the `on`
  mapping by checking which side matches the stream's row identity. When the
  parent record holds a foreign key pointing to the child's identity key, it
  forms a *pointed-at* relationship (parent points to a shared child row).
- **Pointed-at row lifecycle**:
  - **Shared storage**: A row referenced by multiple parent documents is stored
    once in state and shared across them.
  - **Unblocking arrival**: Documents waiting for a referenced row do not block;
    they emit without the embedded slice and update once the referenced row arrives.
  - **Deletion**: When a referenced row is deleted, it is removed from all
    documents pointing to it.
  - **Repointing**: Updating a parent's pointer unbinds the old referenced row
    and attaches the new one. Removing the reference record requires knowing where
    it previously pointed; the source connector must provide before images. If
    the source cannot emit before images or is configured with `before_image: none`,
    the update is refused with `nest.reference-tracking-requires-before-image`.


### Flat embeds

Use `as: flat` when one related row should contribute fields directly to the
parent, without an object or array wrapper:

```yaml
- from: invoice
  on: { invoice_order_id: id }
  as: flat
  key: [invoice_row_id]
```

For example, parent `{ "id": 1 }` and child
`{ "invoice_row_id": 7, "invoice_order_id": 1, "total": 10 }` produce
`{ "id": 1, "invoice_row_id": 7, "invoice_order_id": 1, "total": 10 }`.
A later map step can drop the internal invoice keys.

- Omit both `path` and `arrayKey` for a flat embed.
- Use stable, distinct `from` aliases when multiple flat embeds read the same stream.
- One-to-one and many-to-one relationships are supported. A second live child
  matching the same parent stops the run with `nest.flat-cardinality-violation`.
  Use `as: array` for one-to-many relationships.
- Fields must not collide with the parent, sibling fields, or nested paths.
  A collision returns `nest.flat-field-conflict`; declaration order does not
  choose a winner. Rename or drop conflicting fields upstream while preserving
  the keys needed by Nest.

Removed child fields are removed from the output on update or delete. That
field history is durable, including across a server restart.

### Durable state placement

Set `state.database` on the Nest step to select its state database on the
existing MongoDB connection in a self-hosted deployment. The default is the deployment's
`tapstate.store.mongo.operator-state-database` (`tapstate_nest` when unset).
See [Move Nest state](/docs/guides/move-nest-state) before changing an existing
Nest's placement.

Cloud manages the internal database names and rejects authored `state` blocks
with `control.state-database-unavailable`; do not set `state.database` in
Cloud pipelines.

Nest can run with `snapshot_only`; this mode does not provide a CDC resume
position and can reread the source after restart.

### Nest diagnostics

The engine validates nest topologies and enforces bounds at runtime:

- `nest.key-ambiguous`: The embed declares no `key`, and the source table has no
  primary key but multiple candidate unique indexes. Provide `key: [...]` explicitly.
- `nest.reference-fanout-limit-exceeded`: More documents point to a single
  referenced row than the configured fanout capacity limit permits.
- `nest.referenced-level-carries-embeds`: A pointed-at referenced level itself
  declares nested `embed` definitions.
- `nest.reference-tracking-requires-before-image`: An update on a stream behind an
  embed updated a pointed-at reference without an earlier row image. Configure
  the source to provide before images (such as PostgreSQL `REPLICA IDENTITY FULL`).
- `nest.key-change-tracking-requires-before-image`: An update on a stream tracking
  key changes emitted an update whose before image was missing required key columns
  (such as minimal binlog row images). Configure the source to send complete before
  images (such as MySQL `binlog_row_image=FULL`).

### Related guides

- [Assemble documents with nest](/docs/guides/assemble-documents-with-nest) for
  a complete MySQL-and-PostgreSQL authoring and verification sequence.
- [Handle structural key changes with nest](/docs/guides/nest-structural-key-changes)
  before enabling `trackKeyChanges`.
- [Plan nest capacity and delivery behavior](/docs/guides/nest-throughput) for
  whole-document writes, final-state delivery, and capacity planning.

## `join`

```yaml
- id: customer-orders
  from:
    orders: orders
    customers: customers
  type: join
  engine: builtin
  sql: |
    SELECT o.id AS order_id, o.amount, c.name AS customer_name, c.tier
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
```

`join` maintains a flattened streaming view as source tables change, applying the same SQL
logic to initial snapshot loads and continuous change-data capture.

### Prerequisites and relationship rules

- **Execution engine**: The step requires `engine: builtin`. It has no default; the built-in carrier is the only engine supported for joins in this release.
- **Single driving fact source**: The `FROM` clause must designate exactly one driving
  fact table. All dimension tables must join directly to this driving source.
  Dimension-to-dimension chains are unsupported.
- **Dimension key uniqueness (no fan-out)**: Each joined dimension must be unique on its
  complete join key. One fact row produces at most one output row. If duplicate dimension
  keys arrive from the source, the later-arriving row displaces the earlier match and logs
  a WARNING diagnostic (`engine.join-dimension-row-displaced`). One-to-many or many-to-many
  fan-out is not supported.
- **Output key projection**: For default `upsert` sync targets, every primary-key column
  of the driving fact table must be directly projected in the `SELECT` statement (aliases
  are allowed, such as `o.id AS order_id`). Expressions cannot substitute for key columns.
  If any driving primary-key column is missing, the pipeline refuses initialization with
  `actuation.join-output-key-not-published`. Append-only targets are exempt from this requirement.

### SQL subset

| Construct | Supported boundary |
|---|---|
| Joins | `INNER JOIN`, `LEFT JOIN` on equality conditions directly from the driving source to each dimension. `RIGHT JOIN` is normalized to `LEFT JOIN` with swapped operands. |
| `ON` conditions | Conjunctions (`AND`) of qualified column equalities; composite keys are supported. |
| Projection | Direct column references, column aliases, and supported per-row scalar expressions. |
| Unsupported | `FULL OUTER`, `CROSS`, `NATURAL`, non-equality joins (`<`, `>`, `!=`), `WHERE`, `DISTINCT`, `GROUP BY`, `HAVING`, aggregates, window functions (`OVER`), subqueries, `ORDER BY`, `LIMIT`. |

### Join input restrictions

Each alias in a Join's `from` mapping must resolve to one physical source
table. It cannot refer to a previous transform step or a table pattern, even
when that pattern currently matches one table.

Validate/apply reject these inputs with `dsl.join-input-not-a-table` or
`dsl.join-input-is-a-pattern`. An older stored definition can be refused at
start with `actuation.join-input-not-a-table`. SQL whose columns cannot be
resolved fails startup with `actuation.join-sql-invalid` instead of repeatedly
remaining `NEW`.

Keep every dimension unique on its complete join key. A duplicate key replaces
the earlier match; the engine does not enforce dimension uniqueness or fan out
one fact into multiple output rows.

### Join diagnostics

- `actuation.join-output-key-not-published`: The join SELECT list does not project all primary-key columns of the driving fact table, preventing upsert targets from identifying output records.
- `actuation.join-source-not-declared`: The SQL query references a source table alias not declared in the step's `from` mapping.
- `actuation.join-source-key-missing`: The driving fact table has no primary key discovered.
- `engine.join-dimension-row-displaced`: A second dimension row arrived under an existing join key, displacing the earlier row. The target will hold fewer joined rows than a full relational query describes.
