import { Link } from "@tanstack/react-router";
import { assetUrl } from "../../data/assets";
import type { Project } from "../../data/types";
import styles from "./ProjectCard.module.css";

export function ProjectPreview({ project }: { project: Project }) {
  return (
    <div className={styles.preview}>
      <img className={styles.background} src={assetUrl(project.cover)} alt="" />
      <div className={styles.mock} aria-hidden="true">
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
      className={project.span === "full" ? `${styles.card} ${styles.wide}` : styles.card}
      data-reveal
    >
      <ProjectPreview project={project} />
      <span className={styles.caption}>
        <strong>{project.title}</strong>
        <span>{project.year}</span>
      </span>
    </Link>
  );
}
