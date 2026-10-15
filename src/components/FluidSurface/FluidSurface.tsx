import { useEffect, useRef } from "react";
import { addStroke, createFluid, stepFluid, writeDisplacement } from "./fluidField";
import styles from "./FluidSurface.module.css";

/** Сторона сетки жидкости. Больше — мельче рябь и тяжелее кадр. */
const GRID = 128;
/** Радиус всплеска в клетках сетки. Больше — шире след от курсора. */
const SPLAT_RADIUS = 16;
/** Затухание за кадр. Меньше — быстрее успокаивается. */
const DECAY = 0.94;
/** Насколько скорость растекается по соседним клеткам. */
const DIFFUSE = 0.42;
/** Насколько скорость мыши сдвигает карту. */
const GAIN = 22;
/** Сдвиг пикселей страницы. Меньше — мягче. */
const DISPLACE = 130;
/** Ниже этой скорости поле считается спокойным и прячется. */
const SLEEP = 0.035;

export function FluidSurface() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const map = document.querySelector("#fluid-map");
    if (!layer || !map) return;

    const field = createFluid(GRID, GRID);
    const canvas = document.createElement("canvas");
    canvas.width = GRID;
    canvas.height = GRID;
    const context = canvas.getContext("2d");
    if (!context) return;
    const image = context.createImageData(GRID, GRID);

    let frame = 0;
    let running = false;
    let previous: { u: number; v: number } | null = null;

    const upload = () => {
      writeDisplacement(field, image.data, GAIN);
      context.putImageData(image, 0, 0);
      map.setAttribute("href", canvas.toDataURL());
    };

    const tick = () => {
      const energy = stepFluid(field, DECAY, DIFFUSE);
      upload();
      if (energy < SLEEP) {
        running = false;
        layer.classList.remove(styles.active);
        return;
      }
      layer.classList.add(styles.active);
      frame = window.requestAnimationFrame(tick);
    };

    const wake = () => {
      if (running) return;
      running = true;
      frame = window.requestAnimationFrame(tick);
    };

    const stir = (clientX: number, clientY: number) => {
      const rect = layer.getBoundingClientRect();
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
      addStroke(field, previous.u, previous.v, u, v, SPLAT_RADIUS);
      previous = { u, v };
      wake();
    };

    const onPointer = (event: PointerEvent) => {
      stir(event.clientX, event.clientY);
    };

    const onLeave = () => {
      previous = null;
    };

    window.addEventListener("pointermove", onPointer);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.cancelAnimationFrame(frame);
      layer.classList.remove(styles.active);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={layerRef} className={styles.surface} aria-hidden="true" />
      <svg className={styles.svg} aria-hidden="true">
        <filter id="fluid-displace" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feImage id="fluid-map" result="map" preserveAspectRatio="none" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={DISPLACE}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </>
  );
}
