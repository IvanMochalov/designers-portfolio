import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { assetUrl } from "../data/assets";
import { useSite } from "./LocaleProvider";

export function SiteFooter() {
  const [copied, setCopied] = useState(false);
  const { profile, ui } = useSite().content;
  const scheduleHref = profile.scheduleUrl || `mailto:${profile.email}`;

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
    <footer className="site-footer">
      <div className="footer-rule" />
      <div className="footer-grid">
        <div className="footer-brand">
          <img className="wordmark" src={assetUrl(profile.wordmark)} alt="artyom.k" />
          <p className="footer-tagline">{profile.tagline}</p>
          <p className="copyright">{profile.copyright}</p>
        </div>
        <div className="footer-links">
          <p className="footer-label">{ui.linksTitle}</p>
          {ui.nav.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="footer-contact">
          <p className="footer-label">{ui.contactTitle}</p>
          <button type="button" className="copy-email" onClick={() => void copyEmail()}>
            {copied ? ui.copied : profile.email}
          </button>
          <a href={scheduleHref}>{ui.schedule}</a>
          <div className="socials">
            {profile.social.map((item) =>
              item.href ? (
                <a key={item.icon} href={item.href}>
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
