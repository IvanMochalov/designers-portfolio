export type FluidBuffers = {
  width: number;
  height: number;
  vx: Float32Array;
  vy: Float32Array;
  nextX: Float32Array;
  nextY: Float32Array;
};

const MAX_PUSH = 3.2;

export function createFluid(width: number, height: number): FluidBuffers {
  const count = width * height;
  return {
    width,
    height,
    vx: new Float32Array(count),
    vy: new Float32Array(count),
    nextX: new Float32Array(count),
    nextY: new Float32Array(count),
  };
}

export function peakSpeed(field: FluidBuffers): number {
  let max = 0;
  for (let index = 0; index < field.vx.length; index += 1) {
    const speed = Math.hypot(field.vx[index] ?? 0, field.vy[index] ?? 0);
    if (speed > max) max = speed;
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
): void {
  if (radius <= 0) return;
  const mag = Math.hypot(dx, dy);
  const limit = mag > MAX_PUSH ? MAX_PUSH / mag : 1;
  const pushX = dx * limit;
  const pushY = dy * limit;
  const cx = u * (field.width - 1);
  const cy = v * (field.height - 1);
  const reach = Math.ceil(radius);
  const x0 = Math.max(0, Math.floor(cx - reach));
  const x1 = Math.min(field.width - 1, Math.ceil(cx + reach));
  const y0 = Math.max(0, Math.floor(cy - reach));
  const y1 = Math.min(field.height - 1, Math.ceil(cy + reach));
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const dist = Math.hypot((x - cx) / radius, (y - cy) / radius);
      if (dist >= 1) continue;
      const weight = (1 - dist) ** 2;
      const index = y * field.width + x;
      field.vx[index] = (field.vx[index] ?? 0) + pushX * weight;
      field.vy[index] = (field.vy[index] ?? 0) + pushY * weight;
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

export function stepFluid(field: FluidBuffers, decay: number, diffuse: number): number {
  const { vx, vy, nextX, nextY, width, height } = field;
  let max = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const speedX = vx[index] ?? 0;
      const speedY = vy[index] ?? 0;
      const flowX = bilinear(vx, width, height, x - speedX, y - speedY);
      const flowY = bilinear(vy, width, height, x - speedX, y - speedY);
      const spreadX = neighborAverage(vx, width, height, x, y);
      const spreadY = neighborAverage(vy, width, height, x, y);
      const outX = (flowX * (1 - diffuse) + spreadX * diffuse) * decay;
      const outY = (flowY * (1 - diffuse) + spreadY * diffuse) * decay;
      nextX[index] = outX;
      nextY[index] = outY;
      const speed = Math.hypot(outX, outY);
      if (speed > max) max = speed;
    }
  }
  field.vx = nextX;
  field.vy = nextY;
  field.nextX = vx;
  field.nextY = vy;
  return max;
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function writeDisplacement(field: FluidBuffers, pixels: Uint8ClampedArray, gain: number): void {
  const count = field.width * field.height;
  for (let index = 0; index < count; index += 1) {
    const offset = index * 4;
    pixels[offset] = clampChannel(128 + (field.vx[index] ?? 0) * gain);
    pixels[offset + 1] = clampChannel(128 + (field.vy[index] ?? 0) * gain);
    pixels[offset + 2] = 128;
    pixels[offset + 3] = 255;
  }
}
