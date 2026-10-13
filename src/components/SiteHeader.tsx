import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { assetUrl } from "../data/assets";
import { content } from "../data/content";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { profile, ui } = content;

  return (
    <header className="topbar">
      <div className="avatar-frame">
        <img src={assetUrl(profile.avatar)} alt="" />
      </div>
      <button
        type="button"
        className="menu-button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? ui.menuClose : ui.menuOpen}
      </button>
      <nav className={open ? "nav-pill is-open" : "nav-pill"} aria-label="Primary">
        {ui.nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: true }}
            className="nav-link"
            activeProps={{ className: "nav-link is-active" }}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="locale-pill">
        <span>{ui.locale}</span>
      </div>
    </header>
  );
}
