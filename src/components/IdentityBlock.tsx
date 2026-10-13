import { useNavigate, useRouterState } from "@tanstack/react-router";
import { content } from "../data/content";

export function IdentityBlock() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { profile, ui } = content;
  const chatHref = profile.scheduleUrl || `mailto:${profile.email}`;

  function onLatestWork() {
    if (pathname === "/") {
      document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    void navigate({ to: "/", hash: "work" });
  }

  return (
    <section className="identity">
      <h1>{profile.name}</h1>
      <p>{profile.summary}</p>
      <div className="actions">
        <button type="button" className="button button-primary" onClick={onLatestWork}>
          {ui.latestWork}
        </button>
        <a className="button button-secondary" href={chatHref}>
          {ui.letsChat}
        </a>
      </div>
    </section>
  );
}
