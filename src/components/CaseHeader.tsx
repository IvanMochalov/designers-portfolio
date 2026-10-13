import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { assetUrl } from "../data/assets";
import { content, projectBySlug, visibleSections } from "../data/content";

function sectionScrollTop(node: HTMLElement) {
  const header = document.querySelector(".case-topbar");
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  const anchor = node.querySelector(".kicker") ?? node;
  const gap = 16;
  return Math.max(0, window.scrollY + anchor.getBoundingClientRect().top - headerHeight - gap);
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
  const project = projectBySlug(slug);
  const sections = project ? visibleSections(project) : [];
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const scrollLock = useRef(0);
  const syncActive = useRef<() => void>(() => {});
  const cancelScroll = useRef<(() => void) | null>(null);

  useEffect(() => {
    const items = project ? visibleSections(project) : [];
    const nodes = items
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;

    const update = () => {
      if (scrollLock.current !== 0) return;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActive(nodes[nodes.length - 1].id);
        return;
      }
      const marker = 150;
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
  }, [project, slug]);

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
    <header className="case-topbar">
      <Link to="/" className="back-pill">
        <img src={assetUrl("assets/arrow-left.svg")} alt="" />
        Projects
      </Link>
      <nav className="nav-pill case-anchors" aria-label="Sections">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={section.id === active ? "nav-link is-active" : "nav-link"}
            onClick={(event) => onSectionClick(event, section.id)}
          >
            {section.nav}
          </a>
        ))}
      </nav>
      <div className="locale-pill">
        <span>{content.ui.locale}</span>
      </div>
    </header>
  );
}
