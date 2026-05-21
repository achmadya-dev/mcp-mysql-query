import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadConfig } from "../../config.js";
import { runSql } from "../../db/runner.js";
import {
  checkAllowed,
  checkBannedConstructs,
  firstKeyword,
  validateSingleStatement,
} from "../../policy/index.js";
import type { MySQLConfig } from "../../types.js";
import { errorResponse, jsonResponse } from "../../utils/response.js";

const TOOL_NAME = "mysql_query";
const TOOL_TITLE = "MySQL query";
const TOOL_DESCRIPTION =
  "Menjalankan satu pernyataan SQL pada MySQL (default: read-only). Koneksi dari env MYSQL_*; SELECT/SHOW/EXPLAIN/dll. baca diizinkan; INSERT/UPDATE/DELETE/DDL ditolak kecuali env ALLOW_* terkait diset. CTE (WITH ...) dan ROW_NUMBER() selalu ditolak. Hasil dikembalikan dalam format JSON.";

const inputSchema = {
  sql: z.string().describe("Satu pernyataan SQL (tanpa CTE / ROW_NUMBER)"),
};

async function handleQuery(config: MySQLConfig, sql: string) {
  const validation = validateSingleStatement(sql);
  if (!validation.ok) return errorResponse(validation.reason);

  const banned = checkBannedConstructs(sql);
  if (!banned.ok) return errorResponse(banned.reason);

  const keyword = firstKeyword(sql);
  if (!keyword) return errorResponse("Tidak dapat menemukan perintah SQL.");

  const permission = checkAllowed(keyword, {
    allowInsert: config.allowInsert,
    allowUpdate: config.allowUpdate,
    allowDelete: config.allowDelete,
    allowDdl: config.allowDdl,
  });
  if (!permission.ok) return errorResponse(permission.reason);

  try {
    const payload = await runSql(config, sql);
    return jsonResponse({ ok: true, ...payload });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return errorResponse(`MySQL: ${msg}`);
  }
}

export function registerMysqlQueryTool(server: McpServer): void {
  const config = loadConfig();
  server.registerTool(
    TOOL_NAME,
    {
      title: TOOL_TITLE,
      description: TOOL_DESCRIPTION,
      inputSchema,
    },
    async ({ sql }) => handleQuery(config, sql)
  );
}
