import { Link } from "@tanstack/react-router";
import { assetUrl } from "../../data/assets";
import { useSite } from "../LocaleProvider/LocaleProvider";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const { profile, ui } = useSite().content;

  return (
    <footer className={styles.footer} data-reveal>
      <div className={styles.rule} />
      <div className={styles.grid}>
        <div className={styles.brand}>
          <div className={styles.identity}>
            <img className={styles.wordmark} src={assetUrl(profile.wordmark)} alt="artyom.k" />
            <p className={styles.tagline}>{profile.tagline}</p>
          </div>
          <p className={styles.copyright}>{profile.copyright}</p>
        </div>
        <div className={styles.links}>
          <p className={styles.label}>{ui.linksTitle}</p>
          <div className={styles.stack}>
            {ui.nav.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.contact}>
          <p className={styles.label}>{ui.contactTitle}</p>
          <div className={styles.stack}>
            <a className={styles.copy} href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <div className={styles.socials}>
              {profile.social.map((item) =>
                item.href ? (
                  <a key={item.icon} href={item.href} target="_blank" rel="noopener noreferrer">
                    <img src={assetUrl(item.icon)} alt={item.label} />
                  </a>
                ) : (
                  <img key={item.icon} src={assetUrl(item.icon)} alt={item.label} />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
