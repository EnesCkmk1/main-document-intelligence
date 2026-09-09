import { beforeEach, it, expect, vi } from "vitest";
import { DEMO_ANALYSE } from "../lib/demo";
const { create } = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@anthropic-ai/sdk", () => ({ default: class {
  messages = { create };
  static AuthenticationError = class extends Error {};
  static RateLimitError = class extends Error {};
  static APIError = class extends Error {};
} }));
vi.mock("../lib/demo", async importOriginal => ({
  ...await importOriginal<typeof import("../lib/demo")>(), DEMO_MODE: false,
}));
import { POST } from "../app/api/analyze/route";

beforeEach(() => { vi.unstubAllEnvs(); create.mockReset(); });
function request(file?: File) {
  const body = new FormData();
  if (file) body.set("file", file);
  return new Request("http://localhost/api/analyze", { method: "POST", body });
}
it("rejects missing upload", async () => expect((await POST(request())).status).toBe(400));
it("rejects empty upload", async () => expect((await POST(request(new File([], "x.txt")))).status).toBe(400));
it("rejects oversized upload", async () => {
  expect((await POST(request(new File([new Uint8Array(20 * 1024 * 1024 + 1)], "x.txt")))).status).toBe(413);
});
it("labels demo output and never calls the provider", async () => {
  vi.stubEnv("ANTHROPIC_API_KEY", "");
  const response = await POST(request(new File(["Syntetisk brev"], "x.txt")));
  expect((await response.json()).demo).toBe(true);
  expect(create).not.toHaveBeenCalled();
});
it.each(["not json", "{}", JSON.stringify({ ...DEMO_ANALYSE, datoer: "invalid" })])
  ("rejects invalid provider payload %#", async text => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-only-placeholder");
    create.mockResolvedValue({ content: [{ type: "text", text }] });
    expect((await POST(request(new File(["Syntetisk brev"], "x.txt")))).status).toBe(502);
  });
it("returns validated live-provider output", async () => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-only-placeholder");
  create.mockResolvedValue({ content: [{ type: "text", text: JSON.stringify(DEMO_ANALYSE) }] });
  const response = await POST(request(new File(["Syntetisk brev"], "x.txt")));
  expect(response.status).toBe(200);
  expect((await response.json()).analyse).toEqual(DEMO_ANALYSE);
});
