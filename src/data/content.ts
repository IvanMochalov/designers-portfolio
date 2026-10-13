import site from "./site.json";
import type { Block, Project, Section, SiteContent } from "./types";

const blockTypes = new Set<Block["type"]>([
  "text",
  "image",
  "gallery",
  "quote",
  "list",
  "video",
  "nda",
]);

export const content = site as SiteContent;

export function visibleSections(project: Project): Section[] {
  return project.sections.filter((section) => section.hidden !== true);
}

export function projectBySlug(slug: string): Project | undefined {
  return content.projects.find((project) => project.slug === slug);
}

export function otherProjects(slug: string): Project[] {
  return content.projects.filter((project) => project.slug !== slug);
}

export function isBlockType(value: string): value is Block["type"] {
  return blockTypes.has(value as Block["type"]);
}
