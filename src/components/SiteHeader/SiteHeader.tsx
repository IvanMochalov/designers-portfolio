import { useLayoutEffect, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { assetUrl } from "../../data/assets";
import chrome from "../chrome.module.css";
import { LocaleButton, useSite } from "../LocaleProvider/LocaleProvider";
import { scrollLeftToCenter } from "./scrollActive";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const menuRef = useRef<HTMLElement>(null);
  const { locale, content } = useSite();
  const { profile, ui } = content;
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const align = () => alignActiveItem(menu, chrome.active);

    align();
    window.addEventListener("resize", align);
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) align();
    });
    return () => {
      cancelled = true;
      window.removeEventListener("resize", align);
    };
  }, [locale, pathname]);

  return (
    <>
      <div className={styles.topbar}>
        <div className={styles.avatar}>
          <img src={assetUrl(profile.avatar)} alt="" />
        </div>
      </div>
      <header className={styles.nav}>
        <nav ref={menuRef} className={styles.menu} aria-label="Primary">
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

function alignActiveItem(menu: HTMLElement, activeClass: string) {
  const active = menu.querySelector<HTMLElement>(`.${CSS.escape(activeClass)}`);
  if (!active) return;
  const menuRect = menu.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  const itemOffset = activeRect.left - menuRect.left + menu.scrollLeft;
  menu.scrollLeft = scrollLeftToCenter(
    menu.scrollWidth,
    menu.clientWidth,
    itemOffset,
    active.offsetWidth,
  );
}
