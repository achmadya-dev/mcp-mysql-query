import { defineTool, ToolError } from "./server.js";
import { runSql, safeQuery } from "./mysql/mysql.js";
import {
  mysqlQueryInputSchema,
  mysqlQueryOutputShape,
  mysqlQueryResultSchema,
} from "./mysql/schema.js";

export const mysql_select = defineTool({
  name: "mysql_select",
  description: "Membaca data dari database menggunakan SELECT, SHOW, DESCRIBE, EXPLAIN, atau DESC. Hanya diizinkan satu kueri saja.",
  inputSchema: mysqlQueryInputSchema,
  outputSchema: mysqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["SELECT", "SHOW", "DESCRIBE", "EXPLAIN", "DESC"]);
    const result = await runSql(query);
    const parsed = mysqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Hasil kueri tidak valid: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mysql_insert = defineTool({
  name: "mysql_insert",
  description: "Memasukkan data baru ke database menggunakan INSERT atau REPLACE. Hanya diizinkan satu kueri saja.",
  inputSchema: mysqlQueryInputSchema,
  outputSchema: mysqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["INSERT", "REPLACE"]);
    const result = await runSql(query);
    const parsed = mysqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Hasil kueri tidak valid: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mysql_update = defineTool({
  name: "mysql_update",
  description: "Mengubah data yang ada di database menggunakan UPDATE. Hanya diizinkan satu kueri saja.",
  inputSchema: mysqlQueryInputSchema,
  outputSchema: mysqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["UPDATE"]);
    const result = await runSql(query);
    const parsed = mysqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Hasil kueri tidak valid: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mysql_delete = defineTool({
  name: "mysql_delete",
  description: "Menghapus data dari database menggunakan DELETE. Hanya diizinkan satu kueri saja.",
  inputSchema: mysqlQueryInputSchema,
  outputSchema: mysqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["DELETE"]);
    const result = await runSql(query);
    const parsed = mysqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Hasil kueri tidak valid: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mysql_ddl = defineTool({
  name: "mysql_ddl",
  description: "Mengubah skema database atau hak akses menggunakan CREATE, ALTER, DROP, TRUNCATE, RENAME, GRANT, atau REVOKE. Hanya diizinkan satu kueri saja.",
  inputSchema: mysqlQueryInputSchema,
  outputSchema: mysqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["CREATE", "ALTER", "DROP", "TRUNCATE", "RENAME", "GRANT", "REVOKE"]);
    const result = await runSql(query);
    const parsed = mysqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Hasil kueri tidak valid: ${parsed.error.message}`);
    return parsed.data;
  },
});