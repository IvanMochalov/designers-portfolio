import { describe, expect, it } from "vitest";
import { addSplat, createFluid, peakDye, stepFluid, writeDye } from "./fluidField";

describe("background trail", () => {
  it("leaves the background clear until the pointer moves", () => {
    const field = createFluid(4, 4);
    const pixels = new Uint8ClampedArray(4 * 4 * 4);
    writeDye(field, pixels, 1, 0.5);
    expect(peakDye(field)).toBe(0);
    expect(pixels.every((channel) => channel === 0)).toBe(true);
  });

  it("paints dye only where the pointer moves", () => {
    const field = createFluid(8, 8);
    const pixels = new Uint8ClampedArray(8 * 8 * 4);
    addSplat(field, 0.5, 0.5, 2, 0, 1.2);
    writeDye(field, pixels, 1, 0.5);
    const center = (4 * 8 + 4) * 4;
    expect(pixels[center + 3]).toBeGreaterThan(0);
    expect(pixels[3]).toBe(0);
  });

  it("lets the trail fade after the pointer stops", () => {
    const field = createFluid(20, 20);
    addSplat(field, 0.5, 0.5, 2, 0, 3);
    const stirred = peakDye(field);
    expect(stirred).toBeGreaterThan(0.2);
    for (let frame = 0; frame < 30; frame += 1) stepFluid(field, 0.8, 0.2, 0.8);
    expect(peakDye(field)).toBeLessThan(stirred * 0.15);
  });
});
