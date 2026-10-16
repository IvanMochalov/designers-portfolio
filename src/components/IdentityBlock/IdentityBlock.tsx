import { useNavigate, useRouterState } from "@tanstack/react-router";
import { assetUrl } from "../../data/assets";
import { projectsNewestFirst } from "../../data/content";
import { useSite } from "../LocaleProvider/LocaleProvider";
import styles from "./IdentityBlock.module.css";

export function IdentityBlock() {
  const navigate = useNavigate();
  const { profile, ui, projects } = useSite().content;
  const chatHref =
    profile.social.find((item) => item.href.includes("t.me/"))?.href ?? `mailto:${profile.email}`;
  const latest = projectsNewestFirst(projects)[0];
  const showPdf = useRouterState({ select: (state) => state.location.pathname === "/resume" });

  function onLatestWork() {
    if (!latest) return;
    void navigate({ to: "/case-studies/$slug", params: { slug: latest.slug } });
  }

  return (
    <section className={styles.root}>
      <h1>{profile.name}</h1>
      <p>{profile.summary}</p>
      <div className={styles.actions}>
        <div className={styles.group}>
          <button type="button" className="button button-primary" onClick={onLatestWork}>
            {ui.latestWork}
            <span className="button-icon" aria-hidden="true">
              <img src={assetUrl("assets/ui/star.svg")} alt="" />
            </span>
          </button>
          <a className="button button-secondary" href={chatHref} target="_blank" rel="noopener noreferrer">
            {ui.letsChat}
            <span className="button-icon" aria-hidden="true">
              <img src={assetUrl("assets/ui/send.svg")} alt="" />
            </span>
          </a>
        </div>
        {showPdf ? (
          <a className={`button button-secondary ${styles.pdf}`} href={`${import.meta.env.BASE_URL}resume.pdf`} download>
            {ui.pdfResume}
            <span className="button-icon" aria-hidden="true">
              <img src={assetUrl("assets/ui/download.svg")} alt="" />
            </span>
          </a>
        ) : null}
      </div>
    </section>
  );
}
