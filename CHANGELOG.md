# @achmadya-dev/mcp-mysql-query

## 0.3.1

### Patch Changes

- 314cc58: Register a connection_status tool when startup health check fails, with clearer driver error messages.

## 0.3.0

### Minor Changes

- 8f4451d: Check MySQL connection at startup and disable tools when the database is unreachable.

## 0.2.2

### Patch Changes

- b7f2b78: Bump @achmadya-dev/mcp-core to ^0.6.0 for tool result helpers and simplified registration API.

## 0.2.1

### Patch Changes

- Migrate to mcp-core 0.5.0: replace `startMcpServer` with `runMcp`.

## 0.2.0

### Minor Changes

- 1d09416: Sync standalone repo with monorepo: mcp-core 0.3.x, Zod schemas, Changesets CI/publish.
