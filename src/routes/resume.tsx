import { createFileRoute } from "@tanstack/react-router";
import { IdentityBlock } from "../components/IdentityBlock";
import { assetUrl } from "../data/assets";
import { content } from "../data/content";

function ResumePage() {
  const { resume } = content;

  return (
    <main>
      <IdentityBlock />
      <section className="jobs">
        {resume.jobs.map((job) => (
          <article key={`${job.company}-${job.dates}`}>
            {job.icon ? (
              <div className="job-logo">
                <img src={assetUrl(job.icon)} alt="" />
              </div>
            ) : null}
            <div>
              <h2>
                <span>{job.role}</span>
                <span className="job-company">{job.company}</span>
              </h2>
              <p className="job-meta">
                {job.dates} · {job.location}
              </p>
              {job.body.split("\n\n").map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </section>
      <section className="band">
        <h2 className="inline-title">
          {resume.toolsTitle} <span className="muted">{resume.toolsMuted}</span>
        </h2>
        <ul className="tools">
          {resume.tools.map((tool) => (
            <li key={tool.name}>
              {tool.icon ? (
                <span className={tool.iconCrop ? "tool-icon is-crop" : "tool-icon"}>
                  <img src={assetUrl(tool.icon)} alt="" />
                </span>
              ) : null}
              <span>
                <strong>{tool.name}</strong>
                {tool.detail}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="band">
        <h2 className="inline-title">{resume.skillsTitle}</h2>
        <ul className="chip-row">
          {resume.skills.map((skill) => (
            <li key={skill} className="chip skill-chip">
              {skill}
            </li>
          ))}
        </ul>
      </section>
      <section className="band band-last">
        <h2 className="inline-title">{resume.educationTitle}</h2>
        {resume.education.map((item) => (
          <article key={item.title} className="education">
            <h3>{item.title}</h3>
            <p className="job-meta">
              {item.dates} · {item.location}
            </p>
            {item.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </article>
        ))}
      </section>
    </main>
  );
}

export const Route = createFileRoute("/resume")({
  component: ResumePage,
});
