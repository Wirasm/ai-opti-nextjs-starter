import { describe, expect, it, mock } from "bun:test";

// Mock database client
const mockExecute = mock(() => Promise.resolve([{ "?column?": 1 }]));

mock.module("@/core/database/client", () => ({
  db: {
    execute: mockExecute,
  },
}));

// Mock env
mock.module("@/core/config/env", () => ({
  env: {
    NODE_ENV: "test",
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-key",
  },
}));

// Mock logger
mock.module("@/core/logging", () => ({
  getLogger: () => ({
    info: mock(() => {}),
    warn: mock(() => {}),
    error: mock(() => {}),
  }),
}));

const { GET } = await import("./route");

describe("GET /api/health/ready", () => {
  it("returns ready when all checks pass", async () => {
    mockExecute.mockResolvedValueOnce([{ "?column?": 1 }] as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("ready");
    expect(data.environment).toBe("test");
    expect(data.checks.database).toBe("connected");
    expect(data.checks.auth).toBe("configured");
  });

  it("returns not_ready when database fails", async () => {
    mockExecute.mockRejectedValueOnce(new Error("Connection refused") as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("not_ready");
    expect(data.checks.database).toBe("disconnected");
    expect(data.checks.auth).toBe("configured");
  });
});
