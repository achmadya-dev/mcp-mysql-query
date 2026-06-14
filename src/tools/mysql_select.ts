import { defineTool, ToolError } from "@achmadya-dev/mcp-core";
import { z } from "zod";
import { runSql, safeQuery } from "../mysql/mysql.js";
import {
  mysqlQueryInputSchema,
  mysqlQueryOutputShape,
  mysqlQueryResultSchema,
} from "../mysql/schema.js";

export const mysql_select = defineTool({
  name: "mysql_select",
  description:
    "Read data from the database using SELECT, SHOW, DESCRIBE, EXPLAIN, or DESC. Only a single query is allowed.",
  inputSchema: mysqlQueryInputSchema,
  outputSchema: mysqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["SELECT", "SHOW", "DESCRIBE", "EXPLAIN", "DESC"]);
    const result = await runSql(query);
    const parsed = mysqlQueryResultSchema.safeParse(result);
    if (!parsed.success) {
      throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    }
    return parsed.data;
  },
});
