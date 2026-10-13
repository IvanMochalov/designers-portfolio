import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { assetUrl } from "../data/assets";
import { content } from "../data/content";

export function SiteFooter() {
  const [copied, setCopied] = useState(false);
  const { profile, ui } = content;
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
        <div>
          <img className="wordmark" src={assetUrl(profile.wordmark)} alt="artyom.k" />
          <p className="footer-tagline">{profile.tagline}</p>
          <p className="copyright">{profile.copyright}</p>
        </div>
        <div>
          <p className="footer-label">{ui.linksTitle}</p>
          {ui.nav.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </div>
        <div>
          <p className="footer-label">{ui.contactTitle}</p>
          <button type="button" className="copy-email" onClick={() => void copyEmail()}>
            {copied ? ui.copied : profile.email}
          </button>
          <a href={scheduleHref}>{ui.schedule}</a>
          <div className="socials">
            {profile.social.map((item) =>
              item.href ? (
                <a key={item.label} href={item.href}>
                  <img src={assetUrl(item.icon)} alt={item.label} />
                </a>
              ) : (
                <img key={item.label} src={assetUrl(item.icon)} alt={item.label} />
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
