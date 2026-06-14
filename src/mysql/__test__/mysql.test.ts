import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("safeQuery", () => {
  let safeQuery: typeof import("../mysql.js").safeQuery;

  beforeEach(async () => {
    ({ safeQuery } = await import("../mysql.js"));
  });

  it("allows queries with matching prefixes", () => {
    const res = safeQuery("SELECT id FROM users", ["SELECT", "SHOW"]);
    expect(res).toBe("SELECT id FROM users");
  });

  it("rejects queries with non-matching prefixes", () => {
    expect(() => safeQuery("INSERT INTO users", ["SELECT"])).toThrow(/SQL query is not allowed/);
  });

  it("allows a trailing semicolon on a single query", () => {
    const res = safeQuery("SELECT 1;", ["SELECT"]);
    expect(res).toBe("SELECT 1");
  });

  it("allows semicolons inside string literals", () => {
    const res = safeQuery("SELECT * FROM users WHERE email = 'a;b';", ["SELECT"]);
    expect(res).toBe("SELECT * FROM users WHERE email = 'a;b'");
  });

  it("rejects multiple queries separated by semicolons", () => {
    expect(() => safeQuery("SELECT 1; SELECT 2", ["SELECT"])).toThrow(
      /Only a single SQL query is allowed/
    );
  });

  it("throws an error if the query is empty", () => {
    expect(() => safeQuery("  ", ["SELECT"])).toThrow(/SQL query cannot be empty/);
  });

  it("allows a single-line comment at the start of the query", () => {
    const res = safeQuery("-- komentar ini\nSELECT 1", ["SELECT"]);
    expect(res).toBe("-- komentar ini\nSELECT 1");
  });

  it("allows a block comment at the start of the query", () => {
    const res = safeQuery("/* komentar blok */ SELECT 1", ["SELECT"]);
    expect(res).toBe("/* komentar blok */ SELECT 1");
  });

  it("allows double single quotes inside string literals", () => {
    const res = safeQuery("SELECT 'it''s fine'", ["SELECT"]);
    expect(res).toBe("SELECT 'it''s fine'");
  });

  it("allows backslash escape inside string literals", () => {
    const res = safeQuery("SELECT 'Achmad\\'s book'", ["SELECT"]);
    expect(res).toBe("SELECT 'Achmad\\'s book'");
  });

  it("allows MSSQL bracket identifiers", () => {
    const res = safeQuery("SELECT [column;name] FROM users", ["SELECT"]);
    expect(res).toBe("SELECT [column;name] FROM users");
  });

  it("rejects queries with unterminated single quotes", () => {
    expect(() => safeQuery("SELECT 'hello", ["SELECT"])).toThrow(
      /Unterminated single quote string/
    );
  });

  it("rejects queries with unterminated block comments", () => {
    expect(() => safeQuery("/* komentar SELECT 1", ["SELECT"])).toThrow(
      /Unterminated block comment/
    );
  });

  it("rejects dangerous SQL patterns like XP_CMDSHELL or LOAD_FILE", () => {
    expect(() => safeQuery("SELECT LOAD_FILE('/etc/passwd')", ["SELECT"])).toThrow(
      /Dangerous SQL pattern detected/
    );
    expect(() => safeQuery("EXEC xp_cmdshell 'dir'", ["EXEC", "SELECT"])).toThrow(
      /Dangerous SQL pattern detected/
    );
  });
});

describe("runSql", () => {
  const mockExecute = jest.fn<() => Promise<unknown>>();
  const mockEnd = jest.fn<() => Promise<void>>();
  const mockCreateConnection = jest.fn<
    () => Promise<{
      execute: typeof mockExecute;
      end: typeof mockEnd;
    }>
  >();

  beforeEach(async () => {
    jest.resetModules();
    mockExecute.mockReset();
    mockEnd.mockReset();
    mockCreateConnection.mockReset();
    mockEnd.mockResolvedValue(undefined);

    await jest.unstable_mockModule("mysql2/promise", () => ({
      default: { createConnection: mockCreateConnection },
    }));

    await jest.unstable_mockModule("../config.js", () => ({
      default: {
        host: "127.0.0.1",
        port: 3306,
        user: "",
        password: "",
        database: undefined,
        maxRows: 2,
        allowInsert: false,
        allowUpdate: false,
        allowDelete: false,
        allowDdl: false,
      },
    }));

    mockCreateConnection.mockResolvedValue({
      execute: mockExecute,
      end: mockEnd,
    });
  });

  it("returns a result set and truncates rows according to maxRows", async () => {
    mockExecute.mockResolvedValue([[{ id: 1 }, { id: 2 }, { id: 3 }], [{ name: "id" }]]);

    const { runSql } = await import("../mysql.js");
    const result = await runSql("SELECT id FROM users");

    expect(result).toEqual({
      kind: "resultset",
      columns: ["id"],
      rowCount: 2,
      totalRows: 3,
      truncated: true,
      maxRows: 2,
      rows: [{ id: 1 }, { id: 2 }],
    });
    expect(mockEnd).toHaveBeenCalled();
  });

  it("returns an execute result for DML without a result set", async () => {
    mockExecute.mockResolvedValue([{ affectedRows: 1, insertId: 42 }, undefined]);

    const { runSql } = await import("../mysql.js");
    const result = await runSql("UPDATE users SET active = 1");

    expect(result).toEqual({
      kind: "execute",
      affectedRows: 1,
      insertId: "42",
    });
  });

  it("throws a ToolError when connection fails", async () => {
    mockCreateConnection.mockRejectedValue(new Error("ECONNREFUSED"));

    const { runSql } = await import("../mysql.js");
    await expect(runSql("SELECT 1")).rejects.toThrow(/MySQL: ECONNREFUSED/);
  });
});
