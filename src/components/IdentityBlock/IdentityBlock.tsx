import { useNavigate } from "@tanstack/react-router";
import { assetUrl } from "../../data/assets";
import { projectsNewestFirst } from "../../data/content";
import { useSite } from "../LocaleProvider/LocaleProvider";
import styles from "./IdentityBlock.module.css";

export function IdentityBlock() {
  const navigate = useNavigate();
  const { profile, ui, projects } = useSite().content;
  const chatHref = profile.scheduleUrl || `mailto:${profile.email}`;
  const latest = projectsNewestFirst(projects)[0];

  function onLatestWork() {
    if (!latest) return;
    void navigate({ to: "/case-studies/$slug", params: { slug: latest.slug } });
  }

  return (
    <section className={styles.root}>
      <h1>{profile.name}</h1>
      <p>{profile.summary}</p>
      <div className={styles.actions}>
        <button type="button" className="button button-primary" onClick={onLatestWork}>
          {ui.latestWork}
          <span className="button-icon" aria-hidden="true">
            <img src={assetUrl("assets/star.svg")} alt="" />
          </span>
        </button>
        <a className="button button-secondary" href={chatHref}>
          {ui.letsChat}
          <span className="button-icon" aria-hidden="true">
            <img src={assetUrl("assets/send.svg")} alt="" />
          </span>
        </a>
      </div>
    </section>
  );
}
