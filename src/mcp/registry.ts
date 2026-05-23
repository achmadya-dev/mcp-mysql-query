import { defineTool, ToolError } from "./server.js";
import { runSql, safeQuery } from "./mysql/mysql.js";
import {
  mysqlQueryInputSchema,
  mysqlQueryOutputShape,
  mysqlQueryResultSchema,
} from "./mysql/schema.js";

export const mysql_select = defineTool({
  name: "mysql_select",
  description: "Read data from the database using SELECT, SHOW, DESCRIBE, EXPLAIN, or DESC. Only a single query is allowed.",
  inputSchema: mysqlQueryInputSchema,
  outputSchema: mysqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["SELECT", "SHOW", "DESCRIBE", "EXPLAIN", "DESC"]);
    const result = await runSql(query);
    const parsed = mysqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mysql_insert = defineTool({
  name: "mysql_insert",
  description: "Insert new data into the database using INSERT or REPLACE. Only a single query is allowed.",
  inputSchema: mysqlQueryInputSchema,
  outputSchema: mysqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["INSERT", "REPLACE"]);
    const result = await runSql(query);
    const parsed = mysqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mysql_update = defineTool({
  name: "mysql_update",
  description: "Update existing data in the database using UPDATE. Only a single query is allowed.",
  inputSchema: mysqlQueryInputSchema,
  outputSchema: mysqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["UPDATE"]);
    const result = await runSql(query);
    const parsed = mysqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mysql_delete = defineTool({
  name: "mysql_delete",
  description: "Delete data from the database using DELETE. Only a single query is allowed.",
  inputSchema: mysqlQueryInputSchema,
  outputSchema: mysqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["DELETE"]);
    const result = await runSql(query);
    const parsed = mysqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mysql_ddl = defineTool({
  name: "mysql_ddl",
  description: "Modify the database schema or permissions using CREATE, ALTER, DROP, TRUNCATE, RENAME, GRANT, or REVOKE. Only a single query is allowed.",
  inputSchema: mysqlQueryInputSchema,
  outputSchema: mysqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["CREATE", "ALTER", "DROP", "TRUNCATE", "RENAME", "GRANT", "REVOKE"]);
    const result = await runSql(query);
    const parsed = mysqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    return parsed.data;
  },
});