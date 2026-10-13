import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { assetUrl } from "../../data/assets";
import { content, projectBySlug, visibleSections } from "../../data/content";
import type { CaseFigure } from "../../data/types";

function CaseMockup({ figure }: { figure: CaseFigure }) {
  const slides = figure.slides && figure.slides.length > 0 ? figure.slides : [figure.src];
  const [index, setIndex] = useState(0);
  const current = slides[index] ?? slides[0];

  function step(direction: number) {
    setIndex((value) => (value + direction + slides.length) % slides.length);
  }

  return (
    <div className="case-hero">
      <div className={figure.fit === "contain" ? "device is-contain" : "device"}>
        <img src={assetUrl(current)} alt={figure.alt} />
      </div>
      {figure.arrows ? (
        <>
          <button type="button" className="carousel-btn prev" aria-label="Previous screen" onClick={() => step(-1)}>
            <img src={assetUrl("assets/arrow-left.svg")} alt="" />
          </button>
          <button type="button" className="carousel-btn next" aria-label="Next screen" onClick={() => step(1)}>
            <img src={assetUrl("assets/arrow-left.svg")} alt="" />
          </button>
        </>
      ) : null}
    </div>
  );
}

function CaseStudyPage() {
  const { slug } = Route.useParams();
  const project = projectBySlug(slug);

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
            {meta.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <section className="brief-card">
          <header>
            <h2>{project.brief.title}</h2>
            <img src={assetUrl("assets/chevron-down.svg")} alt="" />
          </header>
          <p>{project.brief.text}</p>
        </section>
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="case-section">
            <p className="kicker">{section.kicker}</p>
            {section.heading ? <h2>{section.heading}</h2> : null}
            {section.paragraphs.length > 0 ? (
              <div className="case-copy">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : null}
            {section.insights.map((insight) => (
              <div key={insight.heading || insight.figure?.src} className="insight">
                {insight.heading ? <h3>{insight.heading}</h3> : null}
                {insight.paragraphs ? (
                  <div className="case-copy">
                    {insight.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}
                {insight.points ? (
                  <div className="points">
                    {insight.points.map((point) => (
                      <div key={point.title}>
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
