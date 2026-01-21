import { describe, it, expect } from "vitest";
import { unsafeCoerce, unwrap, ok, err, eff } from "./index.impl";
import type { NewType } from "./index.def";

describe("NewType", () => {
  type TestBrand = NewType<string, "Test">;

  it("unsafeCoerce creates branded value", () => {
    const v: TestBrand = unsafeCoerce("hello");
    expect(v).toBe("hello");
  });

  it("unwrap extracts underlying value", () => {
    const v: TestBrand = unsafeCoerce("hello");
    expect(unwrap(v)).toBe("hello");
  });
});

describe("Result", () => {
  it("ok creates success result", () => {
    const r = ok(42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("err creates failure result", () => {
    const r = err("error");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("error");
  });
});

describe("Eff", () => {
  it("succeed returns success", async () => {
    const e = eff.succeed(42);
    const r = await e.run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("fail returns failure", async () => {
    const e = eff.fail("error");
    const r = await e.run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("error");
  });

  it("map transforms success value", async () => {
    const e = eff.map(eff.succeed(2), (x) => x * 3);
    const r = await e.run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(6);
  });

  it("map propagates failure", async () => {
    const e = eff.map(eff.fail("err") as ReturnType<typeof eff.fail<string>>, (x: number) => x * 3);
    const r = await e.run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("err");
  });

  it("flatMap chains effects", async () => {
    const e = eff.flatMap(eff.succeed(2), (x) => eff.succeed(x * 3));
    const r = await e.run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(6);
  });

  it("flatMap short-circuits on failure", async () => {
    const e = eff.flatMap(eff.fail("err") as ReturnType<typeof eff.fail<string>>, (x: number) =>
      eff.succeed(x * 3),
    );
    const r = await e.run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("err");
  });

  it("fromPromise handles success", async () => {
    const e = eff.fromPromise(
      () => Promise.resolve(42),
      () => "error",
    );
    const r = await e.run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("fromPromise handles rejection", async () => {
    const e = eff.fromPromise(
      () => Promise.reject(new Error("fail")),
      (e) => (e as Error).message,
    );
    const r = await e.run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("fail");
  });
});
