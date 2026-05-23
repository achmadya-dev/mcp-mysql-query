import * as z from "zod/v4";

const rowValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const mysqlQueryInputSchema = {
  sql: z
    .string()
    .check(
      z.trim(),
      z.minLength(1, "SQL tidak boleh kosong"),
      z.maxLength(100_000, "SQL terlalu panjang (maks. 100.000 karakter)")
    )
    .describe(
      "Satu pernyataan SQL. Tanpa CTE (WITH). Tidak boleh beberapa pernyataan dipisah ';'."
    ),
} as const;

export const mysqlQueryOutputShape = {
  kind: z.enum(["resultset", "execute"]),
  columns: z.array(z.string()).optional(),
  rowCount: z.number().int().nonnegative().optional(),
  totalRows: z.number().int().nonnegative().optional(),
  truncated: z.boolean().optional(),
  maxRows: z.number().int().positive().optional(),
  rows: z.array(z.record(z.string(), rowValue)).optional(),
  affectedRows: z.number().int().nonnegative().optional(),
  insertId: z.string().nullable().optional(),
} as const;

export const mysqlQueryResultSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("resultset"),
    columns: z.array(z.string()),
    rowCount: z.number().int().nonnegative(),
    totalRows: z.number().int().nonnegative(),
    truncated: z.boolean(),
    maxRows: z.number().int().positive(),
    rows: z.array(z.record(z.string(), rowValue)),
  }),
  z.object({
    kind: z.literal("execute"),
    affectedRows: z.number().int().nonnegative(),
    insertId: z.string().nullable(),
  }),
]);
