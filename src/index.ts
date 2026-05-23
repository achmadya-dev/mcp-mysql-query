#!/usr/bin/env node
import { Server } from "./mcp/server.js";
import packageJson from "../package.json" with { type: "json" };
import {
  mysql_select,
  mysql_insert,
  mysql_update,
  mysql_delete,
  mysql_ddl,
} from "./mcp/registry.js";

async function main(): Promise<void> {
  const server = new Server({
    name: "MySQL Database",
    version: packageJson.version,
  });

  server.registerTool(mysql_select);
  server.registerTool(mysql_insert);
  server.registerTool(mysql_update);
  server.registerTool(mysql_delete);
  server.registerTool(mysql_ddl);

  await server.start();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
