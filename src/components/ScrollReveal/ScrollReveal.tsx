import { useLayoutEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import "./ScrollReveal.module.css";

const REVEAL = [
  ".project-grid > *",
  ".masonry > *",
  "main > :not(.project-grid):not(.masonry):not(.case-column)",
  ".case-column > *",
  "[data-reveal]",
].join(", ");

function hasEntered(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight * 0.92;
}

export function ScrollReveal() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useLayoutEffect(() => {
    const root = document.querySelector(".page");
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = () => [...root.querySelectorAll<HTMLElement>(REVEAL)];

    for (const node of nodes()) delete node.dataset.in;
    void root.getBoundingClientRect();

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
      for (const node of nodes()) {
        if (node.dataset.in === "1") continue;
        if (reduce || hasEntered(node)) {
          show(node);
          continue;
        }
        observer.observe(node);
      }
    };

    let frame = 0;
    const onScroll = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        scan();
      });
    };

    scan();
    const first = window.requestAnimationFrame(scan);
    window.addEventListener("scroll", onScroll, { passive: true });
    const mutations = new MutationObserver(scan);
    mutations.observe(root, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(first);
      window.removeEventListener("scroll", onScroll);
      mutations.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
