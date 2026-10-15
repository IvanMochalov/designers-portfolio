import { describe, expect, it } from "vitest";
import { addSplat, createFluid, peakSpeed, stepFluid, writeDisplacement } from "./fluidField";

describe("screen fluid", () => {
  it("leaves the page flat until the pointer stirs it", () => {
    const field = createFluid(4, 4);
    const pixels = new Uint8ClampedArray(4 * 4 * 4);
    writeDisplacement(field, pixels, 40);
    expect(Array.from(pixels.slice(0, 4))).toEqual([128, 128, 128, 255]);
  });

  it("pushes pixels where the pointer moves and nowhere else", () => {
    const field = createFluid(8, 8);
    const pixels = new Uint8ClampedArray(8 * 8 * 4);
    addSplat(field, 0.5, 0.5, 2, 0, 1.2);
    writeDisplacement(field, pixels, 30);
    const center = (4 * 8 + 4) * 4;
    expect(pixels[center]).toBeGreaterThan(128);
    expect(pixels[0]).toBe(128);
    expect(pixels[1]).toBe(128);
  });

  it("settles back to still after the pointer stops", () => {
    const field = createFluid(20, 20);
    addSplat(field, 0.5, 0.5, 2, 0, 3);
    const stirred = peakSpeed(field);
    expect(stirred).toBeGreaterThan(0.5);
    for (let frame = 0; frame < 30; frame += 1) stepFluid(field, 0.8, 0.2);
    expect(peakSpeed(field)).toBeLessThan(stirred * 0.15);
  });
});
