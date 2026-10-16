import { useEffect, useRef } from "react";
import { addStroke, createFluid, stepFluid, writeDye } from "./fluidField";
import styles from "./FluidSurface.module.css";

/** Клеток по короткой стороне экрана. Больше — мельче вихрь и тяжелее кадр. */
const GRID = 128;

function gridSize(pixelWidth: number, pixelHeight: number) {
  const aspect = pixelWidth / Math.max(1, pixelHeight);
  if (aspect >= 1) return { width: Math.max(GRID, Math.round(GRID * aspect)), height: GRID };
  return { width: GRID, height: Math.max(GRID, Math.round(GRID / aspect)) };
}
/** Радиус всплеска в клетках сетки. Больше — шире след от курсора. */
const SPLAT_RADIUS = 7;
/** Затухание скорости за кадр. Меньше — быстрее успокаивается. */
const DECAY = 0.97;
/** Затухание красителя за кадр. Меньше — короче след. */
const DYE_DECAY = 0.985;
/** Насколько скорость и краситель растекаются по соседним клеткам. */
const DIFFUSE = 0.28;
/** Сколько красителя кладёт движение курсора. */
const DYE = 1.15;
/** Прозрачность следа на белом фоне. Меньше — бледнее. */
const ALPHA = 0.72;
/** Доля цвета в кромке. Меньше — ближе к белому. */
const PALE = 0.42;
/** Ниже этой энергии поле считается спокойным и очищается. */
const SLEEP = 0.02;

export function FluidSurface() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const view = canvas?.getContext("2d");
    if (!canvas || !view) return;

    let field = createFluid(GRID, GRID);
    const grid = document.createElement("canvas");
    const gridContext = grid.getContext("2d");
    if (!gridContext) return;
    let image = gridContext.createImageData(GRID, GRID);
    let previous: { u: number; v: number } | null = null;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(window.innerWidth * ratio));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * ratio));
      const next = gridSize(canvas.width, canvas.height);
      if (next.width === field.width && next.height === field.height) return;
      field = createFluid(next.width, next.height);
      grid.width = next.width;
      grid.height = next.height;
      image = gridContext.createImageData(next.width, next.height);
      previous = null;
    };

    let frame = 0;
    let running = false;

    const draw = () => {
      writeDye(field, image.data, ALPHA, PALE);
      gridContext.putImageData(image, 0, 0);
      view.clearRect(0, 0, canvas.width, canvas.height);
      view.imageSmoothingEnabled = true;
      view.imageSmoothingQuality = "high";
      view.drawImage(grid, 0, 0, canvas.width, canvas.height);
    };

    const tick = () => {
      const energy = stepFluid(field, DECAY, DIFFUSE, DYE_DECAY);
      if (energy < SLEEP) {
        running = false;
        view.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      draw();
      frame = window.requestAnimationFrame(tick);
    };

    const wake = () => {
      if (running) return;
      running = true;
      frame = window.requestAnimationFrame(tick);
    };

    const stir = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const u = (clientX - rect.left) / rect.width;
      const v = (clientY - rect.top) / rect.height;
      if (u < 0 || u > 1 || v < 0 || v > 1) {
        previous = null;
        return;
      }
      if (!previous) {
        previous = { u, v };
        return;
      }
      const traveled = Math.hypot((u - previous.u) * rect.width, (v - previous.v) * rect.height);
      if (traveled < 1) return;
      addStroke(field, previous.u, previous.v, u, v, SPLAT_RADIUS, DYE);
      previous = { u, v };
      wake();
    };

    const onPointer = (event: PointerEvent) => {
      stir(event.clientX, event.clientY);
    };

    const onLeave = () => {
      previous = null;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
