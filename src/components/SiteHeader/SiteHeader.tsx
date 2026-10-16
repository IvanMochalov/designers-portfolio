import { Link } from "@tanstack/react-router";
import { assetUrl } from "../../data/assets";
import chrome from "../chrome.module.css";
import { LocaleButton, useSite } from "../LocaleProvider/LocaleProvider";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const { profile, ui } = useSite().content;

  return (
    <>
      <div className={styles.topbar}>
        <div className={styles.avatar}>
          <img src={assetUrl(profile.avatar)} alt="" />
        </div>
      </div>
      <header className={styles.nav}>
        <nav className={styles.menu} aria-label="Primary">
          {ui.nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              className={chrome.link}
              activeProps={{ className: `${chrome.link} ${chrome.active}` }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.end}>
          <LocaleButton />
        </div>
      </header>
    </>
  );
}
