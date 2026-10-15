import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { content, isBlockType, projectsNewestFirst, visibleSections } from "./content";
import { isCopy, localizedContent } from "./localize";
import raw from "./site.json";
import type { Project } from "./types";

function collectAssetPaths(value: unknown, found: string[] = []): string[] {
  if (typeof value === "string" && value.startsWith("assets/")) {
    return [...found, value];
  }
  if (Array.isArray(value)) {
    return value.reduce<string[]>((acc, item) => collectAssetPaths(item, acc), found);
  }
  if (value && typeof value === "object") {
    return Object.values(value).reduce<string[]>(
      (acc, item) => collectAssetPaths(item, acc),
      found,
    );
  }
  return found;
}

describe("site content", () => {
  it("uses the designer profile and the three main pages", () => {
    expect(content.profile.name).toBe("Artyom Kashkarov");
    expect(content.profile.email).toBe("kashkarov.artyom@gmail.com");
    expect(content.ui.nav.map((item) => item.label)).toEqual(["Projects", "About", "Resume"]);
    expect(content.ui.switchTo).toBe("Switch language to Russian");
  });

  it("lists the two case studies and their section anchors", () => {
    expect(content.projects.map((project) => [project.title, project.year])).toEqual([
      ["CRM platform for managing room bookings", "2024"],
      ["Construction tender management, all in one place", "2025"],
    ]);
    expect(content.projects[0]?.sections.map((section) => section.nav)).toEqual([
      "Overview",
      "Problem",
      "Analysis",
      "Architecture",
      "Solutions",
      "Takeaways",
    ]);
    expect(content.projects[1]?.sections.map((section) => section.nav)).toEqual([
      "Overview",
      "Challenge",
      "Solutions",
      "Conclusion",
    ]);
    expect(projectsNewestFirst(content.projects).map((project) => project.year)).toEqual(["2025", "2024"]);
    expect(content.projects[0]?.brief.items?.map((item) => item.title)).toEqual([
      "Product",
      "Problem",
      "My solution",
      "Result",
    ]);
    expect(content.projects[1]?.brief.items?.map((item) => item.title)).toEqual([
      "Product",
      "Problem",
      "My solution",
      "Result",
    ]);
    const analysis = content.projects[0]?.sections.find((section) => section.id === "analysis");
    expect(analysis?.insights[0]?.figure?.slides).toHaveLength(2);
    const booking = content.projects[0]?.sections.find((section) => section.id === "solutions");
    expect(booking?.insights.at(-1)?.figure?.slides).toHaveLength(6);
    const tenderSolutions = content.projects[1]?.sections.find((section) => section.id === "solutions");
    expect(tenderSolutions?.insights.map((insight) => insight.figure?.slides?.length)).toEqual([3, 3, 6]);
    expect(content.projects[1]?.brief.items?.[0]?.text).toContain("B2B platform");
  });

  it("keeps hidden sections out of the case-study outline", () => {
    const project = {
      sections: [
        { id: "overview", nav: "Overview", kicker: "Overview", paragraphs: [], insights: [] },
        {
          id: "process",
          nav: "Process",
          kicker: "Process",
          hidden: true,
          paragraphs: [],
          insights: [],
        },
      ],
    } as unknown as Project;
    expect(visibleSections(project).map((section) => section.id)).toEqual(["overview"]);
  });

  it("only accepts known block types", () => {
    expect(isBlockType("text")).toBe(true);
    expect(isBlockType("gallery")).toBe(true);
    expect(isBlockType("nda")).toBe(true);
    expect(isBlockType("unknown")).toBe(false);
  });

  it("keeps a Russian layout for every piece of copy", () => {
    const russian = localizedContent(raw, "ru");
    expect(russian.ui.nav.map((item) => item.label)).toEqual(["Проекты", "Обо мне", "Резюме"]);
    expect(russian.profile.name).toBe("Артём Кашкаров");
    expect(russian.profile.email).toBe(content.profile.email);
    expect(russian.projects[1]?.brief.items?.[0]?.text).not.toBe(content.projects[1]?.brief.items?.[0]?.text);
    expect(russian.ui.switchTo).toBe("Переключить язык на английский");

    const visit = (value: unknown) => {
      if (isCopy(value)) {
        expect(value.en.length).toBeGreaterThan(0);
        expect(value.ru.length).toBeGreaterThan(0);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(visit);
        return;
      }
      if (value && typeof value === "object") Object.values(value).forEach(visit);
    };
    visit(raw);
  });

  it("points every asset path at a file in src/assets", () => {
    const assets = collectAssetPaths(content);
    expect(assets.length).toBeGreaterThan(0);
    assets.forEach((assetPath) => {
      const filePath = path.join(process.cwd(), "src", assetPath);
      expect(existsSync(filePath), assetPath).toBe(true);
    });
  });
});
