# mcp-mysql-typescript

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for MySQL. The `mysql_query` tool lets MCP clients (e.g. Cursor) run **one** SQL statement per invocation.

**Default mode: read-only.** Commands such as `INSERT`, `UPDATE`, `DELETE`, and DDL are not executed unless you enable the corresponding environment variables (see below).

## Requirements

- Node.js **≥ 20**

Communication uses **stdio** (not HTTP). MySQL credentials and options are set via environment variables in your MCP configuration (`env`) or on the system.

## Install in Cursor

1. Open **Settings → MCP**, or edit the `mcp.json` file for your Cursor account.
2. Add a server entry like the example below. The `npx -y` command fetches the package from the npm registry and runs it (no global install required).

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["-y", "@achmadya-dev/mcp-mysql-typescript"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_USER": "root",
        "MYSQL_PASSWORD": "password"
      }
    }
  }
}
```

Adjust the `env` values to match your MySQL server.

## Manual setup from a cloned repository

Clone the repository, install dependencies, then build:

```bash
git clone <repo-url> mcp-mysql-typescript
cd mcp-mysql-typescript
pnpm install && pnpm run build
```

Then register the MCP server with **`node`** and the **absolute path** to `dist/index.js` in your project folder:

```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["C:/Users/Username/projects/mcp-mysql-typescript/dist/index.js"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_USER": "root",
        "MYSQL_PASSWORD": "password"
      }
    }
  }
}
```

Replace the path in `args` with your clone location. After changing TypeScript sources, run `pnpm run build` again.

## Environment variables

### Connection

| Variable         | Default                    | Description                                      |
| ---------------- | -------------------------- | ------------------------------------------------ |
| `MYSQL_HOST`     | `127.0.0.1`                | MySQL host                                       |
| `MYSQL_PORT`     | `3306`                     | Port                                             |
| `MYSQL_USER`     | `root`                     | Username                                         |
| `MYSQL_PASSWORD` | _(unset = empty string)_   | Password                                         |
| `MYSQL_DATABASE` | _(optional)_               | Database selected after connect                  |
| `MYSQL_MAX_ROWS` | `500`                      | Max rows returned for `SELECT` results           |

### Allowing write operations

**Read** commands (`SELECT`, `SHOW`, `DESCRIBE`, `EXPLAIN`, and similar) are always allowed.

To allow **writes** or **DDL**, enable the desired types with the variables below. Values treated as enabled: `true`, `1`, `yes`, or `on` (case-insensitive).

| Variable                 | Allows                                |
| ------------------------ | ------------------------------------- |
| `ALLOW_INSERT_OPERATION` | `INSERT` / `REPLACE`                  |
| `ALLOW_UPDATE_OPERATION` | `UPDATE`                              |
| `ALLOW_DELETE_OPERATION` | `DELETE`                              |
| `ALLOW_DDL_OPERATION`    | DDL (`CREATE`, `ALTER`, `DROP`, etc.) |

If a variable is unset, or its value is not one of the above, that operation type remains **rejected** (read-only for that type).

## Other behavior

- Each request must contain **one** SQL statement only (no multiple statements separated by `;`).
- `SELECT` results are returned as columnar text; row count is capped by `MYSQL_MAX_ROWS`.
