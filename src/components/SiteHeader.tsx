import { Link } from "@tanstack/react-router";
import { assetUrl } from "../data/assets";
import { LocaleButton, useSite } from "./LocaleProvider";

export function SiteHeader() {
  const { profile, ui } = useSite().content;

  return (
    <>
      <div className="topbar">
        <div className="avatar-frame">
          <img src={assetUrl(profile.avatar)} alt="" />
        </div>
      </div>
      <header className="site-nav">
        <nav className="nav-pill" aria-label="Primary">
          {ui.nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              className="nav-link"
              activeProps={{ className: "nav-link is-active" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-nav-end">
          <LocaleButton />
        </div>
      </header>
    </>
  );
}
