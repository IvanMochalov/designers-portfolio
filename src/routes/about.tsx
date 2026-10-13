import { createFileRoute } from "@tanstack/react-router";
import { IdentityBlock } from "../components/IdentityBlock";
import { assetUrl } from "../data/assets";
import { content } from "../data/content";

function AboutPage() {
  const { about, profile, ui } = content;
  const chatHref = profile.scheduleUrl || `mailto:${profile.email}`;

  return (
    <main>
      <IdentityBlock />
      <section className="about-intro">
        <img src={assetUrl(about.portrait)} alt={about.portraitAlt} />
        <div className="prose">
          <h2 className="split-title">
            <span>{about.heading}</span>
            <span className="muted">{about.headingMuted}</span>
          </h2>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <a className="button button-secondary" href={chatHref}>
            {ui.letsChat}
          </a>
        </div>
      </section>
      <section className="band">
        <h2 className="inline-title">
          {about.interestsTitle} <span className="muted">{about.interestsMuted}</span>
        </h2>
        <ul className="chip-row">
          {about.interests.map((interest) => (
            <li key={interest.label} className="chip">
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
          {about.values.map((value) => (
            <article key={value.title}>
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
