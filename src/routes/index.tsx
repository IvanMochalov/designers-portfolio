import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { IdentityBlock } from "../components/IdentityBlock";
import { ProjectCard } from "../components/ProjectCard";
import { content } from "../data/content";

function HomePage() {
  useEffect(() => {
    if (window.location.hash === "#work") {
      document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <main>
      <IdentityBlock />
      <section id="work" className="project-grid">
        {content.projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </section>
    </main>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
