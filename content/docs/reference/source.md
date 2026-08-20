---
title: source
description: Define a reusable tapstate source connection, including its connector ID, endpoint settings, and source read mode.
sidebar:
  order: 2
ai:
  kind: reference
  id: source-resource
  aliases: [tapstate source reference, source connection yaml, target connection yaml]
---

`source` defines a reusable connector connection. A read connection includes
`mode`; a connection used only as a target omits it.

```yaml title="source/orders.tap.yml"
version: tapstate/v1
kind: source
id: orders
connector: mysql
mode: cdc
config:
  host: db.internal
  port: "3306"
  database: production
  username: ${MYSQL_USER}
  password: ${MYSQL_PASSWORD}
tables:
  - users
  - /orders_.*/
  - audit_log
srs:
  enabled: true
  key: id
  queryable: false
  retention: 24h
  schema_evolution: track
metadata:
  description: Production order data
  labels:
    environment: production
experimental: {}
```

## Fields

### `id`

Unique in the workspace. A resource or inline ID cannot contain `.` because the
dot is reserved for stream addressing.

### `connector`

Connector ID from the catalog bundled with the tapstate version you are using.
A catalog ID and accepted config do not prove that a runtime artifact is
installed or registered.

### `mode`

Describes the connector's source-side read capability:

| Value | Connector read shape |
|---|---|
| `cdc` | Unbounded inserts, updates, and deletes |
| `snapshot` | Bounded one-shot read |
| `stream` | Unbounded message stream |
| `file` | Bounded file read |
| `api` | API or SaaS pull |

For a `cdc` source, the pipeline's `settings.read_mode` chooses whether a run
performs an initial snapshot, tails changes, or does both. Do not put
`start_from` under `source.options`.

### `config`

Connector-specific connection fields. Keep secrets out of committed files and
use the secret or environment-variable mechanism supported by your deployment.

The v1 Schema intentionally allows connector-owned keys. The current offline
validator can apply catalog rules to known keys, but unknown config keys can
still pass. Test network access, authentication, permissions, and representative
reads or writes against the real connector.

### `tables`

For a connection used as a read source, an omitted `tables` field makes
tapstate select every table in its latest discovered schema. Run schema
discovery first; an omitted selector cannot start from an absent or empty
discovery result. Use explicit names or patterns when you need the selected set
to remain stable as the source schema changes.

A target-only connection does not read tables, so omit `tables` there.

Each item can be:

- a literal table or collection name;
- a `/regex/` selector;
- an object with `name` plus optional `filter`, `pk`, and connector-owned
  `options`.

Regex selectors also require a discovered schema. A literal can be used before
discovery, but once a discovered schema is available it must name one of its
tables.

The v1 grammar accepts `filter`, `pk`, and `options` on an object selector, but
the current preview capture path supports an object with `name` only. It
returns `actuation.source-table-spec-unsupported` when those extra fields are
present. Do not use them in a runnable preview pipeline merely because offline
validation accepts the resource.

### `options`

Connector-owned source options. Task-level read behavior belongs under
`pipeline.settings`.

### `srs`

SRS settings. They are valid only for a `cdc` source. Accepted fields are
`enabled`, `key`, `queryable`, `retention`, and `schema_evolution` (`ignore` or
`track`).

See the [connector directory](/docs/connectors) for current roles, modes, and
external-system preparation.
