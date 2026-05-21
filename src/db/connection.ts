import mysql from "mysql2/promise";
import type { Connection } from "mysql2/promise";
import type { MySQLConfig } from "../types.js";

export async function createConnection(
  config: MySQLConfig
): Promise<Connection> {
  return mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    charset: "utf8mb4",
    multipleStatements: false,
  });
}
