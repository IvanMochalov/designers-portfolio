import { describe, expect, it } from "vitest";
import { scrollLeftToCenter } from "./scrollActive";

describe("scrollLeftToCenter", () => {
  it("centers a middle tab in the visible menu", () => {
    expect(scrollLeftToCenter(400, 200, 150, 50)).toBe(75);
  });

  it("keeps the first tab fully visible", () => {
    expect(scrollLeftToCenter(400, 200, 0, 80)).toBe(0);
  });

  it("keeps the last tab fully visible", () => {
    expect(scrollLeftToCenter(400, 200, 340, 60)).toBe(200);
  });

  it("does not scroll when every tab already fits", () => {
    expect(scrollLeftToCenter(180, 240, 90, 40)).toBe(0);
  });
});
