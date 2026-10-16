import { useLayoutEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import "./ScrollReveal.module.css";

const REVEAL = "[data-reveal], main > :not(.project-grid):not(.case-column), .case-column > *";

function inView(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight * 0.92;
}

export function ScrollReveal() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useLayoutEffect(() => {
    const root = document.querySelector(".page");
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let batch = 0;

    const show = (node: HTMLElement) => {
      if (node.dataset.in === "1") return;
      node.style.animationDelay = `${Math.min(batch, 4) * 0.08}s`;
      batch += 1;
      node.dataset.in = "1";
    };

    const observer = new IntersectionObserver(
      (entries) => {
        batch = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );

    const scan = () => {
      batch = 0;
      for (const node of root.querySelectorAll<HTMLElement>(REVEAL)) {
        if (node.dataset.in === "1") continue;
        if (reduce || inView(node)) {
          show(node);
          continue;
        }
        observer.observe(node);
      }
    };

    scan();
    const frame = window.requestAnimationFrame(scan);
    const mutations = new MutationObserver(scan);
    mutations.observe(root, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(frame);
      mutations.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
