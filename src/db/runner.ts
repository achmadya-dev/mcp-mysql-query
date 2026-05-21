import type {
  FieldPacket,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import type { MySQLConfig } from "../types.js";
import { createConnection } from "./connection.js";

export interface ResultSetPayload {
  kind: "resultset";
  columns: string[];
  rowCount: number;
  totalRows: number;
  truncated: boolean;
  maxRows: number;
  rows: Record<string, unknown>[];
}

export interface ExecutePayload {
  kind: "execute";
  affectedRows: number;
  insertId: string | null;
}

export type QueryPayload = ResultSetPayload | ExecutePayload;

function buildResultSetPayload(
  fields: FieldPacket[],
  rows: RowDataPacket[],
  maxRows: number
): ResultSetPayload {
  const columns = fields.map((f) => f.name);
  const truncated = rows.length > maxRows;
  const display = rows.slice(0, maxRows);
  return {
    kind: "resultset",
    columns,
    rowCount: display.length,
    totalRows: rows.length,
    truncated,
    maxRows,
    rows: display as unknown as Record<string, unknown>[],
  };
}

function buildExecutePayload(header: ResultSetHeader): ExecutePayload {
  const id = header.insertId;
  const insertId = id != null && Number(id) > 0 ? String(id) : null;
  return {
    kind: "execute",
    affectedRows: header.affectedRows ?? 0,
    insertId,
  };
}

export async function runSql(
  config: MySQLConfig,
  sql: string
): Promise<QueryPayload> {
  const conn = await createConnection(config);
  try {
    const [rows, fields] = await conn.execute(sql);
    if (fields && Array.isArray(fields) && fields.length > 0) {
      return buildResultSetPayload(
        fields as FieldPacket[],
        rows as RowDataPacket[],
        config.maxRows
      );
    }
    return buildExecutePayload(rows as ResultSetHeader);
  } finally {
    await conn.end();
  }
}
