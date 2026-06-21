import mysql from "mysql2/promise";
import { ToolError } from "@achmadya-dev/mcp-core";
import type { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import config from "./config.js";
import { formatConnectionError } from "../connection-status.js";
import * as helpers from "./helpers.js";

export function safeQuery(sql: string, allowedPrefixes: string[]): string {
  const { cleanSql, prefixes } = helpers.validateInputs(sql, allowedPrefixes);
  const statement = helpers.parseSingleStatement(cleanSql);
  helpers.validateStatement(statement, prefixes);
  return statement;
}

export async function checkConnection(): Promise<void> {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      charset: "utf8mb4",
      multipleStatements: false,
    });
    await conn.ping();
  } catch (e) {
    throw new Error(formatConnectionError("MySQL", e));
  } finally {
    if (conn) await conn.end();
  }
}

export async function runSql(sql: string): Promise<
  | {
      kind: "resultset";
      columns: string[];
      rowCount: number;
      totalRows: number;
      truncated: boolean;
      maxRows: number;
      rows: RowDataPacket[];
    }
  | {
      kind: "execute";
      affectedRows: number;
      insertId: string | null;
    }
> {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      charset: "utf8mb4",
      multipleStatements: false,
    });
    const [rows, fields] = await conn.execute(sql);
    if (fields && Array.isArray(fields) && fields.length > 0) {
      const columns = (fields as FieldPacket[]).map((f) => f.name);
      const all = rows as RowDataPacket[];
      const truncated = all.length > config.maxRows;
      const display = all.slice(0, config.maxRows);
      return {
        kind: "resultset",
        columns,
        rowCount: display.length,
        totalRows: all.length,
        truncated,
        maxRows: config.maxRows,
        rows: display,
      };
    }
    const header = rows as ResultSetHeader;
    const id = header.insertId;
    return {
      kind: "execute",
      affectedRows: header.affectedRows ?? 0,
      insertId: id != null && Number(id) > 0 ? String(id) : null,
    };
  } catch (e) {
    throw new ToolError(`MySQL: ${e instanceof Error ? e.message : String(e)}`);
  } finally {
    if (conn) await conn.end();
  }
}
