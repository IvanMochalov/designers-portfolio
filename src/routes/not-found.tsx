import { createFileRoute, Link } from "@tanstack/react-router";
import { useSite } from "../components/LocaleProvider/LocaleProvider";

function NotFoundPage() {
  const { profile, ui } = useSite().content;
  const chatHref =
    profile.social.find((item) => item.href.includes("t.me/"))?.href ?? `mailto:${profile.email}`;

  return (
    <main>
      <section className="lost">
        <h2>
          {ui.lost.lead}
          <span className="muted">{ui.lost.rest}</span>
        </h2>
        <p>{profile.summary}</p>
        <div className="lost-actions">
          <Link className="button button-primary" to="/">
            {ui.lost.home}
          </Link>
          <a className="button button-secondary" href={chatHref} target="_blank" rel="noopener noreferrer">
            {ui.lost.contact}
          </a>
        </div>
      </section>
    </main>
  );
}

export const Route = createFileRoute("/not-found")({
  component: NotFoundPage,
});
