import { useRef, useState, type TransitionEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { assetUrl } from "../../data/assets";
import { projectBySlug, visibleSections } from "../../data/content";
import { useSite } from "../../components/LocaleProvider/LocaleProvider";
import type { CaseFigure, CaseSlide, Project } from "../../data/types";

type SlideView = { src: string; fit: "cover" | "contain"; align: "left" | "center" };

function slideViews(figure: CaseFigure): SlideView[] {
  const source = figure.slides && figure.slides.length > 0 ? figure.slides : [figure.src];
  return source.map((slide) => normalizeSlide(slide, figure.fit));
}

function normalizeSlide(slide: string | CaseSlide, figureFit: CaseFigure["fit"]): SlideView {
  if (typeof slide === "string") {
    return { src: slide, fit: figureFit ?? "cover", align: "center" };
  }
  return { src: slide.src, fit: slide.fit ?? figureFit ?? "cover", align: slide.align ?? "center" };
}

function slideClass(slide: SlideView) {
  const names = ["carousel-slide"];
  if (slide.fit === "contain") names.push("is-contain");
  if (slide.align === "left") names.push("is-left");
  return names.join(" ");
}

function CaseMockup({ figure }: { figure: CaseFigure }) {
  const slides = slideViews(figure);
  const [index, setIndex] = useState(0);
  const canPrev = index > 0;
  const canNext = index < slides.length - 1;

  function step(direction: number) {
    setIndex((value) => Math.min(slides.length - 1, Math.max(0, value + direction)));
  }

  return (
    <div className="case-hero">
      <div className="device">
        <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((slide, slideIndex) => (
            <div key={`${slide.src}-${slideIndex}`} className={slideClass(slide)}>
              <img src={assetUrl(slide.src)} alt={slideIndex === 0 ? figure.alt : ""} />
            </div>
          ))}
        </div>
      </div>
      {canPrev ? (
        <button type="button" className="carousel-btn prev" aria-label="Previous screen" onClick={() => step(-1)}>
          <img src={assetUrl("assets/carousel-arrow.svg")} alt="" />
          <img className="is-hover" src={assetUrl("assets/carousel-arrow-hover.svg")} alt="" />
        </button>
      ) : null}
      {canNext ? (
        <button type="button" className="carousel-btn next" aria-label="Next screen" onClick={() => step(1)}>
          <img src={assetUrl("assets/carousel-arrow.svg")} alt="" />
          <img className="is-hover" src={assetUrl("assets/carousel-arrow-hover.svg")} alt="" />
        </button>
      ) : null}
    </div>
  );
}

function BriefCard({ brief }: { brief: Project["brief"] }) {
  const items = brief.items ?? [];
  const [open, setOpen] = useState(false);
  const [heights, setHeights] = useState({ teaser: "auto", items: "0px" });
  const teaserRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const expanded = open && items.length > 0;

  function toggle() {
    const teaser = teaserRef.current;
    const panel = itemsRef.current;
    if (!teaser || !panel || items.length === 0) return;
    const next = !open;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const teaserFull = teaser.scrollHeight;
    const panelFull = panel.scrollHeight;
    if (reduced) {
      setOpen(next);
      setHeights({ teaser: next ? "0px" : "auto", items: next ? "auto" : "0px" });
      return;
    }
    setOpen(next);
    setHeights({
      teaser: `${teaser.getBoundingClientRect().height}px`,
      items: `${panel.getBoundingClientRect().height}px`,
    });
    requestAnimationFrame(() => {
      setHeights({
        teaser: `${next ? 0 : teaserFull}px`,
        items: `${next ? panelFull : 0}px`,
      });
    });
  }

  function releaseHeight(event: TransitionEvent<HTMLDivElement>) {
    if (event.propertyName !== "height" || event.target !== event.currentTarget) return;
    setHeights(open ? { teaser: "0px", items: "auto" } : { teaser: "auto", items: "0px" });
  }

  return (
    <section className={expanded ? "brief-card is-open" : "brief-card"}>
      <button type="button" className="brief-toggle" aria-expanded={expanded} onClick={toggle}>
        <h2>{brief.title}</h2>
        <img className="brief-chevron" src={assetUrl("assets/chevron-down.svg")} alt="" />
      </button>
      <div className="brief-fold">
        <div className="brief-teaser" ref={teaserRef} style={{ height: heights.teaser }} onTransitionEnd={releaseHeight}>
          <p>{brief.text}</p>
        </div>
        <div className="brief-items" ref={itemsRef} style={{ height: heights.items }} onTransitionEnd={releaseHeight}>
          <div className="brief-items-inner">
            {items.map((item, index) => (
              <div key={index} className="brief-item">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CaseStudyPage() {
  const { slug } = Route.useParams();
  const { content } = useSite();
  const project = projectBySlug(content.projects, slug);

  if (!project) {
    return (
      <section className="missing">
        <h1>{content.ui.notFound}</h1>
        <Link to="/">{content.ui.backHome}</Link>
      </section>
    );
  }

  const sections = visibleSections(project);
  const meta = (
    [
      [content.ui.metaLabels.role, project.meta.role],
      [content.ui.metaLabels.timeline, project.meta.timeline],
      [content.ui.metaLabels.team, project.meta.team],
      [content.ui.metaLabels.platform, project.meta.platform],
    ] as const
  ).filter(([, value]) => value);

  return (
    <main className="case">
      <article className="case-column">
        <p className="case-year">{project.year}</p>
        <h1>{project.title}</h1>
        {project.summary ? <p className="case-summary">{project.summary}</p> : null}
        <div className={project.hero.phone ? "case-hero has-phone" : "case-hero"}>
          <div className={project.hero.phone ? "device is-compact" : "device"}>
            <img src={assetUrl(project.hero.overlay ?? project.hero.screen)} alt="" />
          </div>
          {project.hero.phone ? (
            <div className="phone">
              <img src={assetUrl(project.hero.phone)} alt="" />
            </div>
          ) : null}
        </div>
        {meta.length > 0 ? (
          <dl className="meta-grid">
            {meta.map(([label, value], index) => (
              <div key={index}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <BriefCard brief={project.brief} />
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="case-section">
            <p className="kicker">{section.kicker}</p>
            {section.heading ? <h2>{section.heading}</h2> : null}
            {section.paragraphs.length > 0 ? (
              <div className="case-copy">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : null}
            {section.insights.map((insight, index) => (
              <div key={insight.figure?.src ?? index} className="insight">
                {insight.heading ? <h3>{insight.heading}</h3> : null}
                {insight.paragraphs ? (
                  <div className="case-copy">
                    {insight.paragraphs.map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}
                {insight.points ? (
                  <div className="points">
                    {insight.points.map((point, pointIndex) => (
                      <div key={pointIndex}>
                        <h4>{point.title}</h4>
                        <p>{point.text}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                {insight.figure ? <CaseMockup figure={insight.figure} /> : null}
              </div>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}

export const Route = createFileRoute("/case-studies/$slug")({
  component: CaseStudyPage,
});
