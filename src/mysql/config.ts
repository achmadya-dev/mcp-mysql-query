import { envBool, envInt, envStr } from "@achmadya-dev/mcp-core";

export default {
  host: envStr("MYSQL_HOST", "localhost"),
  port: envInt("MYSQL_PORT", 3306),
  user: envStr("MYSQL_USER"),
  password: envStr("MYSQL_PASSWORD", ""),
  database: envStr("MYSQL_DATABASE") || undefined,
  maxRows: envInt("MYSQL_MAX_ROWS", 500),
  allowInsert: envBool("ALLOW_INSERT_OPERATION"),
  allowUpdate: envBool("ALLOW_UPDATE_OPERATION"),
  allowDelete: envBool("ALLOW_DELETE_OPERATION"),
  allowDdl: envBool("ALLOW_DDL_OPERATION"),
};
