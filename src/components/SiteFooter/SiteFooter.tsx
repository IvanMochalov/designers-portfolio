import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { assetUrl } from "../../data/assets";
import { useSite } from "../LocaleProvider/LocaleProvider";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const [copied, setCopied] = useState(false);
  const { profile, ui } = useSite().content;

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <footer className={styles.footer} data-reveal>
      <div className={styles.rule} />
      <div className={styles.grid}>
        <div className={styles.brand}>
          <img className={styles.wordmark} src={assetUrl(profile.wordmark)} alt="artyom.k" />
          <p className={styles.tagline}>{profile.tagline}</p>
          <p className={styles.copyright}>{profile.copyright}</p>
        </div>
        <div className={styles.links}>
          <p className={styles.label}>{ui.linksTitle}</p>
          {ui.nav.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className={styles.contact}>
          <p className={styles.label}>{ui.contactTitle}</p>
          <button type="button" className={styles.copy} onClick={() => void copyEmail()}>
            {copied ? ui.copied : profile.email}
          </button>
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
    </footer>
  );
}
