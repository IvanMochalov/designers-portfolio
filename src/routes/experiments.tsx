import { createFileRoute } from "@tanstack/react-router";
import { IdentityBlock } from "../components/IdentityBlock/IdentityBlock";
import { assetUrl } from "../data/assets";
import { useSite } from "../components/LocaleProvider/LocaleProvider";

function ExperimentsPage() {
  const { experiments } = useSite().content;

  return (
    <main>
      <IdentityBlock />
      <section className="masonry">
        {experiments.map((item) => (
          <figure key={item.src}>
            <img src={assetUrl(item.src)} alt={item.alt} />
            <figcaption>{item.title}</figcaption>
          </figure>
        ))}
      </section>
    </main>
  );
}

export const Route = createFileRoute("/experiments")({
  component: ExperimentsPage,
});
