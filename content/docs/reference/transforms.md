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

The v1 grammar defines six transform bodies. A transform can be declared inline
in `pipeline.transforms` or as a reusable `kind: transform` resource.

An inline step adds `id` and `from`:

```yaml
transforms:
  - id: active-orders
    from: [orders]
    type: filter
    expr: "after.status == 'active'"
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

## Runtime status

| Type | Schema | Current preview runtime |
|---|---|---|
| `filter` | Accepted | Wired |
| `map` | Accepted | Wired |
| `js` | Accepted | Wired |
| `union` | Accepted | Wired |
| `nest` | Accepted | Wired |
| `join` | Accepted | Wired (Preview) |

## `filter`

```yaml
- id: active-only
  from: [orders]
  type: filter
  expr: "after.status == 'active' && op != 'd'"
```

`expr` is a CEL boolean expression. Expressions that read `after.<field>` or
`before.<field>` require a discovered schema for every source that can reach the
step. Apply each source connection first, run `discover-schema <source-id>`,
then apply the pipeline. Offline validation compiles supported expressions but
does not evaluate them against connector records.

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
column references. It does not extend to every computed decimal expression:
in v0.6.0, a conditional between decimal columns can pass apply and fail at the
first target write.

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
existing MongoDB connection. The default is the deployment's
`tapstate.store.mongo.operator-state-database` (`tapstate_nest` when unset).
See [Move Nest state](/docs/guides/move-nest-state) before changing an existing
Nest's placement.

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
