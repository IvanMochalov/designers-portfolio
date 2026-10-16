export type FluidBuffers = {
  width: number;
  height: number;
  vx: Float32Array;
  vy: Float32Array;
  nextX: Float32Array;
  nextY: Float32Array;
  r: Float32Array;
  g: Float32Array;
  b: Float32Array;
  nextR: Float32Array;
  nextG: Float32Array;
  nextB: Float32Array;
};

const MAX_PUSH = 3.2;
const MAX_DYE = 2;

export function createFluid(width: number, height: number): FluidBuffers {
  const count = width * height;
  return {
    width,
    height,
    vx: new Float32Array(count),
    vy: new Float32Array(count),
    nextX: new Float32Array(count),
    nextY: new Float32Array(count),
    r: new Float32Array(count),
    g: new Float32Array(count),
    b: new Float32Array(count),
    nextR: new Float32Array(count),
    nextG: new Float32Array(count),
    nextB: new Float32Array(count),
  };
}

export function peakDye(field: FluidBuffers): number {
  let max = 0;
  for (let index = 0; index < field.r.length; index += 1) {
    const amount = Math.max(field.r[index] ?? 0, field.g[index] ?? 0, field.b[index] ?? 0);
    if (amount > max) max = amount;
  }
  return max;
}

export function addSplat(
  field: FluidBuffers,
  u: number,
  v: number,
  dx: number,
  dy: number,
  radius: number,
  dye = 1,
): void {
  if (radius <= 0) return;
  const mag = Math.hypot(dx, dy);
  const limit = mag > MAX_PUSH ? MAX_PUSH / mag : 1;
  const pushX = dx * limit;
  const pushY = dy * limit;
  const across = Math.hypot(pushX, pushY) || 1;
  const sideX = -pushY / across;
  const sideY = pushX / across;
  const cx = u * (field.width - 1);
  const cy = v * (field.height - 1);
  const reach = Math.ceil(radius);
  const x0 = Math.max(0, Math.floor(cx - reach));
  const x1 = Math.min(field.width - 1, Math.ceil(cx + reach));
  const y0 = Math.max(0, Math.floor(cy - reach));
  const y1 = Math.min(field.height - 1, Math.ceil(cy + reach));
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const offsetX = (x - cx) / radius;
      const offsetY = (y - cy) / radius;
      const dist = Math.hypot(offsetX, offsetY);
      if (dist >= 1) continue;
      const weight = (1 - dist) ** 2;
      const index = y * field.width + x;
      field.vx[index] = (field.vx[index] ?? 0) + pushX * weight;
      field.vy[index] = (field.vy[index] ?? 0) + pushY * weight;
      const side = Math.max(-1, Math.min(1, offsetX * sideX + offsetY * sideY));
      const pink = Math.max(0, -side);
      const cyan = Math.max(0, side);
      const core = 1 - Math.abs(side);
      const ink = weight * dye;
      field.r[index] = Math.min(MAX_DYE, (field.r[index] ?? 0) + (core * 0.55 + pink + cyan * 0.2) * ink);
      field.g[index] = Math.min(MAX_DYE, (field.g[index] ?? 0) + (core * 0.62 + pink * 0.25 + cyan * 0.95) * ink);
      field.b[index] = Math.min(MAX_DYE, (field.b[index] ?? 0) + (core * 0.85 + pink * 0.7 + cyan) * ink);
    }
  }
}

export function addStroke(
  field: FluidBuffers,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  radius: number,
  dye = 1,
): void {
  const traveled = Math.hypot((u1 - u0) * field.width, (v1 - v0) * field.height);
  const steps = Math.max(1, Math.ceil(traveled / Math.max(1, radius * 0.45)));
  for (let step = 1; step <= steps; step += 1) {
    const t = step / steps;
    addSplat(
      field,
      u0 + (u1 - u0) * t,
      v0 + (v1 - v0) * t,
      ((u1 - u0) * field.width) / steps,
      ((v1 - v0) * field.height) / steps,
      radius,
      dye,
    );
  }
}

function at(source: Float32Array, width: number, height: number, x: number, y: number): number {
  const ix = Math.max(0, Math.min(width - 1, x));
  const iy = Math.max(0, Math.min(height - 1, y));
  return source[iy * width + ix] ?? 0;
}

function bilinear(source: Float32Array, width: number, height: number, x: number, y: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const top = at(source, width, height, x0, y0) * (1 - tx) + at(source, width, height, x0 + 1, y0) * tx;
  const bottom = at(source, width, height, x0, y0 + 1) * (1 - tx) + at(source, width, height, x0 + 1, y0 + 1) * tx;
  return top * (1 - ty) + bottom * ty;
}

function neighborAverage(source: Float32Array, width: number, height: number, x: number, y: number): number {
  const center = source[y * width + x] ?? 0;
  const left = source[y * width + Math.max(0, x - 1)] ?? 0;
  const right = source[y * width + Math.min(width - 1, x + 1)] ?? 0;
  const up = source[Math.max(0, y - 1) * width + x] ?? 0;
  const down = source[Math.min(height - 1, y + 1) * width + x] ?? 0;
  return (center + left + right + up + down) / 5;
}

function blend(flow: number, spread: number, diffuse: number, decay: number): number {
  return (flow * (1 - diffuse) + spread * diffuse) * decay;
}

export function stepFluid(field: FluidBuffers, decay: number, diffuse: number, dyeDecay: number): number {
  const { vx, vy, nextX, nextY, r, g, b, nextR, nextG, nextB, width, height } = field;
  let max = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const speedX = vx[index] ?? 0;
      const speedY = vy[index] ?? 0;
      const lookX = x - speedX;
      const lookY = y - speedY;
      const outX = blend(
        bilinear(vx, width, height, lookX, lookY),
        neighborAverage(vx, width, height, x, y),
        diffuse,
        decay,
      );
      const outY = blend(
        bilinear(vy, width, height, lookX, lookY),
        neighborAverage(vy, width, height, x, y),
        diffuse,
        decay,
      );
      nextX[index] = outX;
      nextY[index] = outY;
      nextR[index] = blend(bilinear(r, width, height, lookX, lookY), neighborAverage(r, width, height, x, y), diffuse, dyeDecay);
      nextG[index] = blend(bilinear(g, width, height, lookX, lookY), neighborAverage(g, width, height, x, y), diffuse, dyeDecay);
      nextB[index] = blend(bilinear(b, width, height, lookX, lookY), neighborAverage(b, width, height, x, y), diffuse, dyeDecay);
      const energy = Math.max(Math.hypot(outX, outY), nextR[index] ?? 0, nextG[index] ?? 0, nextB[index] ?? 0);
      if (energy > max) max = energy;
    }
  }
  field.vx = nextX;
  field.vy = nextY;
  field.nextX = vx;
  field.nextY = vy;
  field.r = nextR;
  field.g = nextG;
  field.b = nextB;
  field.nextR = r;
  field.nextG = g;
  field.nextB = b;
  return max;
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function writeDye(field: FluidBuffers, pixels: Uint8ClampedArray, alphaGain: number, pale: number): void {
  const tint = Math.max(0, Math.min(1, pale));
  const count = field.width * field.height;
  for (let index = 0; index < count; index += 1) {
    const red = field.r[index] ?? 0;
    const green = field.g[index] ?? 0;
    const blue = field.b[index] ?? 0;
    const offset = index * 4;
    const amount = Math.max(red, green, blue);
    if (amount <= 0) {
      pixels[offset] = 0;
      pixels[offset + 1] = 0;
      pixels[offset + 2] = 0;
      pixels[offset + 3] = 0;
      continue;
    }
    pixels[offset] = clampChannel(255 * (1 - tint + (red / amount) * tint));
    pixels[offset + 1] = clampChannel(255 * (1 - tint + (green / amount) * tint));
    pixels[offset + 2] = clampChannel(255 * (1 - tint + (blue / amount) * tint));
    pixels[offset + 3] = clampChannel(Math.min(1, amount) * alphaGain * 255);
  }
}
