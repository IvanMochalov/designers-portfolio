import { createFileRoute } from "@tanstack/react-router";
import { IdentityBlock } from "../components/IdentityBlock/IdentityBlock";
import { ProjectCard } from "../components/ProjectCard/ProjectCard";
import { projectsNewestFirst } from "../data/content";
import { useSite } from "../components/LocaleProvider/LocaleProvider";

function HomePage() {
  const projects = projectsNewestFirst(useSite().content.projects);

  return (
    <main>
      <IdentityBlock />
      <section id="work" className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </section>
    </main>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
