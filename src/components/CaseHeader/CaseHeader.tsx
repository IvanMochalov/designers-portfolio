import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { assetUrl } from "../../data/assets";
import { projectBySlug, visibleSections } from "../../data/content";
import chrome from "../chrome.module.css";
import { LocaleButton, useSite } from "../LocaleProvider/LocaleProvider";
import styles from "./CaseHeader.module.css";

function sectionScrollTop(node: HTMLElement) {
  const header = document.querySelector("[data-case-topbar]");
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  const stickyTop = header ? Number.parseFloat(getComputedStyle(header).top) || 0 : 0;
  const anchor = node.querySelector(".kicker") ?? node;
  const gap = 16;
  return Math.max(0, window.scrollY + anchor.getBoundingClientRect().top - stickyTop - headerHeight - gap);
}

function animateScroll(target: number, onDone: () => void) {
  const start = window.scrollY;
  const distance = target - start;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || Math.abs(distance) < 2) {
    window.scrollTo(0, target);
    onDone();
    return () => {};
  }

  const duration = Math.min(800, 280 + Math.abs(distance) * 0.25);
  const startTime = performance.now();
  let frame = 0;
  let stopped = false;

  const stop = (finished: boolean) => {
    if (stopped) return;
    stopped = true;
    if (frame !== 0) cancelAnimationFrame(frame);
    window.removeEventListener("wheel", interrupt);
    window.removeEventListener("touchstart", interrupt);
    if (finished) onDone();
  };

  const interrupt = () => stop(true);

  const tick = (now: number) => {
    const progress = Math.min(1, (now - startTime) / duration);
    const eased = 1 - (1 - progress) ** 3;
    window.scrollTo(0, start + distance * eased);
    if (progress < 1) frame = requestAnimationFrame(tick);
    else stop(true);
  };

  window.addEventListener("wheel", interrupt, { passive: true });
  window.addEventListener("touchstart", interrupt, { passive: true });
  frame = requestAnimationFrame(tick);
  return () => stop(false);
}

export function CaseHeader() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const slug = pathname.split("/").filter(Boolean).at(-1) ?? "";
  const { content } = useSite();
  const project = projectBySlug(content.projects, slug);
  const projectsLabel = content.ui.nav.find((item) => item.to === "/")?.label ?? "Projects";
  const sections = project ? visibleSections(project) : [];
  const sectionKey = `${slug}:${sections.map((section) => section.id).join("|")}`;
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const scrollLock = useRef(0);
  const syncActive = useRef<() => void>(() => {});
  const cancelScroll = useRef<(() => void) | null>(null);

  useEffect(() => {
    const ids = sectionKey.split(":").at(1)?.split("|").filter(Boolean) ?? [];
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;

    const update = () => {
      if (scrollLock.current !== 0) return;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActive(nodes[nodes.length - 1].id);
        return;
      }
      const header = document.querySelector("[data-case-topbar]");
      const marker = (header?.getBoundingClientRect().bottom ?? 80) + 24;
      let current = nodes[0].id;
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= marker) current = node.id;
      }
      setActive(current);
    };
    syncActive.current = update;

    let frame = 0;
    const onScroll = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      syncActive.current = () => {};
      cancelScroll.current?.();
      cancelScroll.current = null;
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [sectionKey]);

  function onSectionClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    setActive(id);
    const node = document.getElementById(id);
    if (!node) return;
    cancelScroll.current?.();
    const token = scrollLock.current + 1;
    scrollLock.current = token;
    window.history.replaceState(null, "", `#${id}`);
    cancelScroll.current = animateScroll(sectionScrollTop(node), () => {
      if (scrollLock.current !== token) return;
      scrollLock.current = 0;
      cancelScroll.current = null;
      syncActive.current();
    });
  }

  return (
    <header className={styles.topbar} data-case-topbar>
      <Link to="/" className={styles.back} aria-label={projectsLabel}>
        <img src={assetUrl("assets/arrow-left.svg")} alt="" />
        <span className={styles.label}>{projectsLabel}</span>
      </Link>
      <nav className={styles.anchors} aria-label="Sections">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={section.id === active ? `${chrome.link} ${chrome.active}` : chrome.link}
            onClick={(event) => onSectionClick(event, section.id)}
          >
            {section.nav}
          </a>
        ))}
      </nav>
      <LocaleButton className={styles.locale} />
    </header>
  );
}
