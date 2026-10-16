import site from "./site.json";
import { localizedContent } from "./localize";
import type { Block, PageSeo, Project, Section, SiteContent } from "./types";

const blockTypes = new Set<Block["type"]>([
  "text",
  "image",
  "gallery",
  "quote",
  "list",
  "video",
  "nda",
]);

/** English snapshot for tests. Screens read the active locale through useSite(). */
export const content = localizedContent(site, "en");

export function visibleSections(project: Project): Section[] {
  return project.sections.filter((section) => section.hidden !== true);
}

export function projectsNewestFirst(projects: Project[]): Project[] {
  return projects
    .map((project, index) => ({ project, index }))
    .sort((left, right) => {
      const byYear = Number(right.project.year) - Number(left.project.year);
      if (byYear !== 0) return byYear;
      return right.index - left.index;
    })
    .map((item) => item.project);
}

const PAGE_SEO: Record<string, string> = {
  "/": "projects",
  "/experiments": "experiments",
  "/about": "about",
  "/resume": "resume",
  "/not-found": "not-found",
};

const CASE_PREFIX = "/case-studies/";

export function pageSeo(content: SiteContent, pathname: string): PageSeo | undefined {
  if (pathname.startsWith(CASE_PREFIX)) return content.seo[pathname.slice(CASE_PREFIX.length)];
  const key = PAGE_SEO[pathname];
  return key ? content.seo[key] : undefined;
}

export function projectBySlug(projects: Project[], slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function isBlockType(value: string): value is Block["type"] {
  return blockTypes.has(value as Block["type"]);
}
