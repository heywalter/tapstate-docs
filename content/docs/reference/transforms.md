---
title: transforms
description: Reference for pipeline transform node shapes
sidebar:
  order: 4
ai:
  kind: reference
  id: transforms
  aliases: [tapstate transforms, pipeline filter, pipeline javascript, rename fields]
---

`transforms` is the ordered list of processing nodes in a pipeline. Use the reference and schema supplied with your tapstate version to confirm available nodes and fields.

## Node types

### filter — Row Filtering

```yaml
transforms:
  - name: active-only
    filter: "record.status == 'active' && record.deleted_at == null"
```

- Uses a **CEL expression**; rows not satisfying the condition are discarded
- Compiled + type-checked at validate time (not evaluated)
- `record` is the current row object

### js — JavaScript Transform

```yaml
transforms:
  - name: enrich
    js: |
      record.tier = record.spend > 1000 ? 'premium' : 'standard';
      record.processed_at = new Date().toISOString();
      return record;   // null = discard this row
```

- Test JavaScript transforms with representative records before production. Available APIs, execution limits, and error handling can vary by deployment.
- `return null` = discard this row
- Returning an array = one row becomes multiple rows (fan-out)

### rename — Field Renaming

```yaml
transforms:
  - name: normalize-fields
    rename:
      user_id: id
      created_at: createdAt
      full_name: name
```

### typeFilter — Filter by Data Type

```yaml
transforms:
  - name: only-inserts
    type_filter: insert    # insert | update | delete
```

Retains only CDC events of the specified operation type.

### unwind — Array Flattening

```yaml
transforms:
  - name: flatten-tags
    unwind: tags           # array field name
```

Flattens an array field: one record → N records (N = array length).

## Node combination example

```yaml
transforms:
  - name: filter-active
    filter: "record.status == 'active'"

  - name: normalize
    rename:
      user_id: id
      created_at: createdAt

  - name: enrich
    js: |
      record.tier = record.spend > 1000 ? 'premium' : 'standard';
      return record;
```

Nodes execute in order; the output of each node is the input to the next.
