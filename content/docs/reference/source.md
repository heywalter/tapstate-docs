---
title: source
description: Reference for kind:source connection resources
sidebar:
  order: 2
ai:
  kind: reference
  id: source-resource
  aliases: [tapstate source reference, source connection yaml, target connection yaml]
---

`source` defines a reusable source or target connection. Confirm accepted fields and defaults with the resource schema supplied with your tapstate version.

```yaml
version: tapstate/v1
kind: source
id: <string>           # globally unique; must not contain `.`

connector: <string>    # connector id (from catalog)
mode: snapshot | cdc | stream | api | file

config:                # connector-specific configuration (fields defined by connector spec)
  <key>: <value>
  # supports ${ENV_VAR} externalization

options:
  start_from: latest | earliest | <ISO8601>  # default: latest

tables:                # omitted = all tables
  - name: <string>     # literal = fixed table name
  - name: /<regex>/    # regex = dynamic matching (requires discovery capability)

metadata:
  labels:              # string→string; short values (≤63 characters)
    <key>: <value>

experimental: {}       # experimental field zone; no compatibility guarantee
```

## Field reference

### `id`
Globally unique identifier. Rules: letters, digits, and hyphens only; no `.`; unique within the workspace.

### `connector`
Connector ID from the connector catalog used by your tapstate version.

### `mode`

| Value | Semantics |
|---|---|
| `snapshot` | One-shot snapshot (bounded); task stops when complete |
| `cdc` | Continuous change capture (unbounded); runs continuously |
| `stream` | Unbounded push stream from a message system |
| `api` | API / SaaS pull (polling or webhook) |
| `file` | File scanning |

Validation compares the selected connector and mode with the connector catalog used by your tapstate version.

### `config`
Connector-specific fields. See the connector page for the documented field names, requirements, and examples.

Keep sensitive values out of committed files. Use `${ENV_VAR}` placeholders or the secret mechanism supported by your environment.

### `options.start_from`
Data read starting point:
- `latest` (default): start from the current position; no historical data is read
- `earliest`: start from the earliest available data (CDC starts from the earliest binlog position)
- ISO8601 timestamp: start from the specified point in time

### `tables`
Specifies the set of tables to sync:
- Omitted → equivalent to `/.*/`; all tables
- Literal string → fixed; does not track new tables
- `/regex/` → dynamic; new tables matching the regex automatically join the pipeline (requires connector support for discovery)
