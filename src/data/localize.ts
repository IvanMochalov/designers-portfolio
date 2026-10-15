import type { SiteContent } from "./types";

export type Locale = "en" | "ru";

export type Copy = {
  en: string;
  ru: string;
};

const structuralKeys = new Set([
  "slug",
  "id",
  "to",
  "src",
  "cover",
  "avatar",
  "icon",
  "portrait",
  "wordmark",
  "email",
  "scheduleUrl",
  "href",
  "year",
  "fit",
  "align",
  "client",
  "screen",
  "overlay",
  "phone",
  "poster",
  "screens",
  "iconCrop",
  "hidden",
  "type",
  "defaultLocale",
]);

export function isCopy(value: unknown): value is Copy {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  return keys.length === 2 && typeof record.en === "string" && typeof record.ru === "string";
}

function keepAsIs(value: string, key: string): boolean {
  return structuralKeys.has(key) || value.startsWith("assets/") || value.startsWith("/") || value.includes("@");
}

export function localize(value: unknown, locale: Locale, key = ""): unknown {
  if (isCopy(value)) return value[locale];
  if (Array.isArray(value)) return value.map((item) => localize(item, locale, key));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([childKey]) => childKey !== "defaultLocale")
        .map(([childKey, child]) => [childKey, localize(child, locale, childKey)]),
    );
  }
  if (typeof value === "string" && !keepAsIs(value, key)) return value;
  return value;
}

export function localizedContent(value: unknown, locale: Locale): SiteContent {
  return localize(value, locale) as SiteContent;
}
