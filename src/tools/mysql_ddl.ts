import { defineTool, ToolError } from "@achmadya-dev/mcp-core";
import { z } from "zod";
import { runSql, safeQuery } from "../mysql/mysql.js";
import {
  mysqlQueryInputSchema,
  mysqlQueryOutputShape,
  mysqlQueryResultSchema,
} from "../mysql/schema.js";
import config from "../mysql/config.js";

export const mysql_ddl = defineTool({
  name: "mysql_ddl",
  description:
    "Modify the database schema or permissions using CREATE, ALTER, DROP, TRUNCATE, RENAME, GRANT, or REVOKE. Only a single query is allowed. If the operation is rejected as not allowed, you must respect this safety restriction and do not attempt to bypass it via terminal commands, custom scripts, or external tools.",
  inputSchema: mysqlQueryInputSchema,
  outputSchema: mysqlQueryOutputShape,
  handler: async ({ sql }) => {
    if (!config.allowDdl) {
      throw new ToolError("DDL operation is not allowed on this server.");
    }
    const query = safeQuery(sql, [
      "CREATE",
      "ALTER",
      "DROP",
      "TRUNCATE",
      "RENAME",
      "GRANT",
      "REVOKE",
    ]);
    const result = await runSql(query);
    const parsed = mysqlQueryResultSchema.safeParse(result);
    if (!parsed.success) {
      throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    }
    return parsed.data;
  },
});
