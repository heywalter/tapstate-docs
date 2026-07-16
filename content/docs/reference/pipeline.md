---
title: pipeline
description: Reference for kind:pipeline resources
sidebar:
  order: 3
ai:
  kind: reference
  id: pipeline-resource
  aliases: [tapstate pipeline reference, pipeline yaml, sync target]
---

`pipeline` describes a data path: it references a source, applies transforms, and declares how records are delivered. Confirm accepted fields and defaults with the resource schema supplied with your tapstate version.

```yaml
version: tapstate/v1
kind: pipeline
id: <string>

source: <source-id>       # references the id of a kind:source

tables:                   # optional; further filters the source's table set
  - name: <string> | /<regex>/

transforms:               # optional; executed in order
  - name: <string>
    filter: <CEL>         # filter; rows not satisfying the condition are discarded
    js: <script>          # row-by-row script processing
    rename:               # field renaming
      <old>: <new>
    # ... more node types: see transforms reference

sync:                     # write to target storage (full snapshot / CDC)
  - source: <table name>
    target:
      collection: <target collection name>
    options:
      write_mode: upsert | append
      ddl: apply | ignore | fail
      auto_create_table: true

push:                     # publish as event stream (Kafka, etc.)
  - source: <table name>
    topic: <string>       # omitted = uses table name
    format: tapstate        # default: tapstate envelope; custom = CEL projection

settings:
  error_policy: fail | skip | dlq   # default: fail
  batch_size: 1000
  parallelism: 1
  schedule: <cron>                  # bounded tasks only

metadata:
  labels:
    <key>: <value>
```

## sync vs push

| | `sync` | `push` |
|---|---|---|
| Semantics | Table model sync (structured write) | Event stream output (no structure guarantee) |
| Target | Database collection | Message queue topic |
| write_mode | upsert / append | — |
| DDL | Configurable | — |
