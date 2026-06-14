# @achmadya-dev/mcp-mysql-query

MCP server for MySQL. Runs a single SQL statement per tool call over **stdio**. **Read-only by default** — writes and DDL require explicit env flags.

## Requirements

- Node.js **≥ 20**
- A reachable MySQL server (local, Docker, or remote)

## Install from npm

Add to Cursor **Settings → MCP** or `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["-y", "@achmadya-dev/mcp-mysql-query"],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "your_user",
        "MYSQL_PASSWORD": "your_password",
        "MYSQL_DATABASE": "your_database"
      }
    }
  }
}
```

Or load credentials from a file (Cursor `envFile`):

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["-y", "@achmadya-dev/mcp-mysql-query"],
      "envFile": "/absolute/path/to/.env"
    }
  }
}
```

## Develop from source

From the repository root ([`achmadya-dev/mcp`](https://github.com/achmadya-dev/mcp)):

```bash
cp .env.example .env
pnpm install
docker compose up -d mysql
pnpm --filter @achmadya-dev/mcp-mysql-query run build
```

Register the built server in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["${workspaceFolder}/packages/mcp-mysql-query/dist/index.js"],
      "envFile": "${workspaceFolder}/.env"
    }
  }
}
```

Relevant `.env` keys (defaults match `docker-compose.yml`):

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=dev
MYSQL_PASSWORD=devpassword
MYSQL_DATABASE=devdb
```

## Environment variables

### Connection

| Variable         | Default      | Description                     |
| ---------------- | ------------ | ------------------------------- |
| `MYSQL_HOST`     | `localhost`  | MySQL host                      |
| `MYSQL_PORT`     | `3306`       | Port                            |
| `MYSQL_USER`     | _(empty)_    | Username                        |
| `MYSQL_PASSWORD` | _(empty)_    | Password                        |
| `MYSQL_DATABASE` | _(optional)_ | Database selected after connect |
| `MYSQL_MAX_ROWS` | `500`        | Max rows returned for `SELECT`  |

### Write access

Enabled when the value is `true`, `1`, `yes`, or `on` (case-insensitive). If unset, that operation type is **rejected**.

| Variable                 | Allows                             |
| ------------------------ | ---------------------------------- |
| `ALLOW_INSERT_OPERATION` | `INSERT`, `REPLACE`                |
| `ALLOW_UPDATE_OPERATION` | `UPDATE`                           |
| `ALLOW_DELETE_OPERATION` | `DELETE`                           |
| `ALLOW_DDL_OPERATION`    | DDL (`CREATE`, `ALTER`, `DROP`, …) |

## Tools

| Tool           | Statements                                      | Env flag                 |
| -------------- | ----------------------------------------------- | ------------------------ |
| `mysql_select` | `SELECT`, `SHOW`, `DESCRIBE`, `EXPLAIN`, `DESC` | always on                |
| `mysql_insert` | `INSERT`, `REPLACE`                             | `ALLOW_INSERT_OPERATION` |
| `mysql_update` | `UPDATE`                                        | `ALLOW_UPDATE_OPERATION` |
| `mysql_delete` | `DELETE`                                        | `ALLOW_DELETE_OPERATION` |
| `mysql_ddl`    | DDL                                             | `ALLOW_DDL_OPERATION`    |

Each tool accepts one `sql` string. Results are JSON text; `SELECT` output is capped by `MYSQL_MAX_ROWS`.

## Behavior and security

- One SQL statement per request (no `;`-separated batches).
- Dangerous patterns are blocked regardless of flags.
- Read operations are always permitted.

## Package scripts

```bash
pnpm run build
pnpm test
pnpm start
```
