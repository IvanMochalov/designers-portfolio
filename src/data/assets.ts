const files = import.meta.glob("../assets/**/*.{png,jpg,jpeg,svg,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export function assetUrl(path: string): string {
  const relative = path.replace(/^assets\//, "");
  const match = Object.entries(files).find(([key]) => key.endsWith(`/${relative}`));
  return match?.[1] ?? path;
}
