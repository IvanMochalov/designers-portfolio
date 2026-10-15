import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import site from "../data/site.json";
import { localizedContent, type Locale } from "../data/localize";
import type { SiteContent } from "../data/types";

const STORAGE_KEY = "site-locale";
const CYRILLIC_SAMPLE = "Артём";
const INVOLVE_WEIGHTS = [400, 500, 600];

export function loadInvolveCyrillic(): Promise<void> {
  return Promise.all(
    INVOLVE_WEIGHTS.map((weight) => document.fonts.load(`${weight} 16px Involve`, CYRILLIC_SAMPLE)),
  ).then(() => undefined);
}

type LocaleState = {
  locale: Locale;
  content: SiteContent;
  otherLabel: string;
  toggleLocale: () => void;
};

const LocaleContext = createContext<LocaleState | null>(null);

function readLocale(): Locale {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "ru" ? "ru" : "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readLocale);

  const content = useMemo(() => localizedContent(site, locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    void loadInvolveCyrillic().catch(() => undefined);
  }, []);

  const value = useMemo<LocaleState>(
    () => ({
      locale,
      content,
      otherLabel: locale === "en" ? "RU" : "EN",
      toggleLocale: () => {
        if (locale === "ru") {
          setLocale("en");
          return;
        }
        void loadInvolveCyrillic()
          .catch(() => undefined)
          .then(() => setLocale("ru"));
      },
    }),
    [content, locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useSite(): LocaleState {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useSite must be used within LocaleProvider");
  return value;
}

export function LocaleButton() {
  const { content, otherLabel, toggleLocale } = useSite();

  return (
    <button type="button" className="locale-pill" aria-label={content.ui.switchTo} onClick={toggleLocale}>
      <span>{otherLabel}</span>
    </button>
  );
}
