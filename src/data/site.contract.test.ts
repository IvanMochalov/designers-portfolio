import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { content, isBlockType, pageSeo, projectsNewestFirst, visibleSections } from "./content";
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
    expect(content.ui.nav.map((item) => item.label)).toEqual([
      "Projects",
      "Experiments",
      "About",
      "Resume",
    ]);
    expect(content.ui.switchTo).toBe("Switch language to Russian");
    expect(content.seo.projects).toEqual({
      title: "Projects — Product Design & UX/UI Portfolio | Artyom",
      description:
        "A collection of my work in product design, focused on solving complex challenges, creating intuitive experiences, and building thoughtful digital solutions.",
    });
    expect(pageSeo(content, "/")).toBe(content.seo.projects);
    expect(content.seo.about).toEqual({
      title: "About Artyom — Product Designer & UX/UI",
      description:
        "I'm Artyom, a Product Designer focused on complex digital systems. Learn about my experience, design philosophy, skills, and approach to creating better products.",
    });
    expect(pageSeo(content, "/about")).toBe(content.seo.about);
    expect(content.seo.resume).toEqual({
      title: "Artyom — Product Designer Resume | B2B & Design Systems",
      description:
        "Explore my professional experience, skills, and background in product design. Specialized in B2B applications, complex UX/UI, enterprise software, and design systems.",
    });
    expect(pageSeo(content, "/resume")).toBe(content.seo.resume);
    expect(content.seo.experiments).toEqual({
      title: "Design Experiments — AI, Motion & UI Concepts | Artyom",
      description:
        "Exploring new ideas in digital design through AI, motion, interactive interfaces, creative coding, and experimental product concepts.",
    });
    expect(pageSeo(content, "/experiments")).toBe(content.seo.experiments);
    expect(pageSeo(content, "/case-studies/crm-platform-for-managing-room-bookings")?.title).toBe(
      "CRM Design Case Study — Room Booking System | Artyom",
    );
    expect(pageSeo(content, "/case-studies/construction-tender-management")?.title).toBe(
      "B2B Tender Platform — Product Design Case Study | Artyom",
    );
    expect(pageSeo(content, "/not-found")).toEqual({
      title: "404 — Page Not Found | Artyom",
      description:
        "Looks like this page doesn't exist or has been moved. Head back to my portfolio to explore projects, experiments, and more.",
    });
    expect(content.ui.lost).toEqual({
      lead: "Looks like ",
      rest: "this page got lost.",
      home: "Back to home",
      contact: "Get in touch",
    });
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
    expect(booking?.insights.at(-2)?.figure?.slides).toHaveLength(6);
    expect(booking?.insights.at(-1)?.figure?.slides).toHaveLength(3);
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
    expect(russian.ui.nav.map((item) => item.label)).toEqual([
      "Проекты",
      "Эксперименты",
      "Обо мне",
      "Резюме",
    ]);
    expect(russian.profile.name).toBe("Артём Кашкаров");
    expect(russian.profile.email).toBe(content.profile.email);
    expect(russian.projects[1]?.brief.items?.[0]?.text).not.toBe(content.projects[1]?.brief.items?.[0]?.text);
    expect(russian.ui.switchTo).toBe("Переключить язык на английский");
    expect(russian.seo.projects.title).toBe("Проекты — Артём | Портфолио Product Designer");
    expect(russian.seo.projects.description).toBe(
      "Подборка моих работ в продуктовом дизайне. Проектирую цифровые продукты, превращая сложные задачи в понятные, удобные и продуманные интерфейсы.",
    );
    expect(russian.seo.about.title).toBe("Обо мне — Артём | Продуктовый дизайнер");
    expect(russian.seo.about.description).toBe(
      "Я Артём, продуктовый дизайнер сложных цифровых систем. Рассказываю о своём опыте, профессиональном пути, ценностях и подходе к проектированию интерфейсов.",
    );
    expect(russian.seo.resume.title).toBe("Резюме — Артём | Product Designer, B2B и UX/UI");
    expect(russian.seo.resume.description).toBe(
      "Резюме продуктового дизайнера с опытом более 5 лет. Специализация: сложные B2B-интерфейсы, корпоративные сервисы, UX/UI и разработка дизайн-систем.",
    );
    expect(russian.seo.experiments.title).toBe("Эксперименты — Артём | AI, UI и Motion Design");
    expect(russian.seo.experiments.description).toBe(
      "Эксперименты с интерфейсами, анимацией, искусственным интеллектом и новыми технологиями. Исследую нестандартные подходы к цифровому дизайну.",
    );
    expect(russian.seo["crm-platform-for-managing-room-bookings"]?.title).toBe(
      "CRM — система бронирования помещений | Артём",
    );
    expect(russian.seo["construction-tender-management"]?.description).toBe(
      "Проектирование B2B-платформы строительных тендеров с нуля: тендерные процессы, ролевые интерфейсы, оценка подрядчиков и выбор победителя.",
    );
    expect(russian.seo["not-found"]?.title).toBe("404 — Страница не найдена | Артём");
    expect(russian.seo["not-found"]?.description).toBe(
      "Похоже, такой страницы не существует или она была перемещена. Вернитесь в портфолио, чтобы посмотреть проекты, эксперименты и другие разделы.",
    );
    expect(russian.ui.lost).toEqual({
      lead: "Похоже, ",
      rest: "эта страница потерялась.",
      home: "На главную",
      contact: "Связаться",
    });

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
