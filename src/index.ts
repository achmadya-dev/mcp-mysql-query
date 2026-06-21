#!/usr/bin/env node
import { runMcp } from "@achmadya-dev/mcp-core";
import packageJson from "../package.json" with { type: "json" };
import {
  captureHealthCheckError,
  registerConnectionFailureSurface,
} from "./connection-status.js";
import { checkConnection } from "./mysql/mysql.js";
import { mysql_ddl } from "./tools/mysql_ddl.js";
import { mysql_delete } from "./tools/mysql_delete.js";
import { mysql_insert } from "./tools/mysql_insert.js";
import { mysql_select } from "./tools/mysql_select.js";
import { mysql_update } from "./tools/mysql_update.js";

const health = captureHealthCheckError(checkConnection);

await runMcp({
  name: "MySQL Database",
  version: packageJson.version,
  transport: "stdio",
  tools: [mysql_select, mysql_insert, mysql_update, mysql_delete, mysql_ddl],
  healthCheck: health.check,
  setup(server) {
    const error = health.getError();
    if (error) registerConnectionFailureSurface(server, error);
  },
});
