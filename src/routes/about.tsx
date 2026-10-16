import { createFileRoute } from "@tanstack/react-router";
import { assetUrl } from "../data/assets";
import { useSite } from "../components/LocaleProvider/LocaleProvider";

function AboutPage() {
  const { about, profile, ui } = useSite().content;
  const chatHref =
    profile.social.find((item) => item.href.includes("t.me/"))?.href ?? `mailto:${profile.email}`;

  return (
    <main>
      <section className="about-intro">
        <img src={assetUrl(about.portrait)} alt={about.portraitAlt} />
        <div className="prose">
          <h2 className="split-title">
            <span>{about.heading}</span>
            <span className="muted">{about.headingMuted}</span>
          </h2>
          {about.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          <a className="button button-secondary" href={chatHref} target="_blank" rel="noopener noreferrer">
            {ui.letsChat}
            <span className="button-icon" aria-hidden="true">
              <img src={assetUrl("assets/ui/send.svg")} alt="" />
            </span>
          </a>
        </div>
      </section>
      <section className="band">
        <h2 className="inline-title">
          {about.interestsTitle} <span className="muted">{about.interestsMuted}</span>
        </h2>
        <ul className="chip-row">
          {about.interests.map((interest) => (
            <li key={interest.icon} className="chip">
              <img src={assetUrl(interest.icon)} alt="" />
              {interest.label}
            </li>
          ))}
        </ul>
      </section>
      <section className="band">
        <h2 className="split-title">
          <span>{about.valuesTitle}</span>
          <span className="muted">{about.valuesMuted}</span>
        </h2>
        <div className="values">
          {about.values.map((value, index) => (
            <article key={index}>
              <h3>{value.title}</h3>
              <p>{value.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="band band-last">
        <h2 className="split-title">
          <span>{about.pathTitle}</span>
          <span className="muted">{about.pathMuted}</span>
        </h2>
        <div className="path-grid">
          {about.path.map((item) => (
            <figure key={item.src}>
              <img src={assetUrl(item.src)} alt={item.alt} />
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}

export const Route = createFileRoute("/about")({
  component: AboutPage,
});
