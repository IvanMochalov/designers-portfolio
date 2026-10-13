import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { content, isBlockType, visibleSections } from "./content";
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
    expect(content.ui.locale).toBe("RU");
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

  it("points every asset path at a file in src/assets", () => {
    const assets = collectAssetPaths(content);
    expect(assets.length).toBeGreaterThan(0);
    assets.forEach((assetPath) => {
      const filePath = path.join(process.cwd(), "src", assetPath);
      expect(existsSync(filePath), assetPath).toBe(true);
    });
  });
});
