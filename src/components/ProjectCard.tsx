import { Link } from "@tanstack/react-router";
import { assetUrl } from "../data/assets";
import type { Project } from "../data/types";

export function ProjectPreview({ project }: { project: Project }) {
  return (
    <div className="project-preview">
      <img className="project-bg" src={assetUrl(project.cover)} alt="" />
      <div className="screen-mock" aria-hidden="true">
        {project.screens.map((screen) => (
          <img key={screen} src={assetUrl(screen)} alt="" />
        ))}
      </div>
    </div>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to="/case-studies/$slug"
      params={{ slug: project.slug }}
      className={project.span === "full" ? "project-card is-wide" : "project-card"}
    >
      <ProjectPreview project={project} />
      <span className="project-caption">
        <strong>{project.title}</strong>
        <span>{project.year}</span>
      </span>
    </Link>
  );
}
