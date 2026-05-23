import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("safeQuery", () => {
  let safeQuery: typeof import("../mysql.js").safeQuery;

  beforeEach(async () => {
    ({ safeQuery } = await import("../mysql.js"));
  });

  it("mengizinkan kueri dengan prefiks yang cocok", () => {
    const res = safeQuery("SELECT id FROM users", ["SELECT", "SHOW"]);
    expect(res).toBe("SELECT id FROM users");
  });

  it("menolak kueri dengan prefiks yang tidak cocok", () => {
    expect(() => safeQuery("INSERT INTO users", ["SELECT"])).toThrow(
      /SQL query is not allowed/
    );
  });

  it("mengizinkan titik koma di akhir kueri tunggal", () => {
    const res = safeQuery("SELECT 1;", ["SELECT"]);
    expect(res).toBe("SELECT 1;");
  });

  it("mengizinkan titik koma di dalam string literal", () => {
    const res = safeQuery("SELECT * FROM users WHERE email = 'a;b';", ["SELECT"]);
    expect(res).toBe("SELECT * FROM users WHERE email = 'a;b';");
  });

  it("menolak kueri berganda yang dipisahkan titik koma", () => {
    expect(() => safeQuery("SELECT 1; SELECT 2", ["SELECT"])).toThrow(
      /Only a single SQL query is allowed/
    );
  });

  it("melempar error jika kueri kosong", () => {
    expect(() => safeQuery("  ", ["SELECT"])).toThrow(/SQL query cannot be empty/);
  });
});

describe("runSql", () => {
  const mockExecute = jest.fn<() => Promise<unknown>>();
  const mockEnd = jest.fn<() => Promise<void>>();
  const mockCreateConnection = jest.fn<() => Promise<{
    execute: typeof mockExecute;
    end: typeof mockEnd;
  }>>();

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
        user: "root",
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

  it("mengembalikan resultset dan memotong baris sesuai maxRows", async () => {
    mockExecute.mockResolvedValue([
      [{ id: 1 }, { id: 2 }, { id: 3 }],
      [{ name: "id" }],
    ]);

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

  it("mengembalikan execute untuk DML tanpa result set", async () => {
    mockExecute.mockResolvedValue([{ affectedRows: 1, insertId: 42 }, undefined]);

    const { runSql } = await import("../mysql.js");
    const result = await runSql("UPDATE users SET active = 1");

    expect(result).toEqual({
      kind: "execute",
      affectedRows: 1,
      insertId: "42",
    });
  });

  it("melempar ToolError saat koneksi gagal", async () => {
    mockCreateConnection.mockRejectedValue(new Error("ECONNREFUSED"));

    const { runSql } = await import("../mysql.js");
    await expect(runSql("SELECT 1")).rejects.toThrow(/MySQL: ECONNREFUSED/);
  });
});
